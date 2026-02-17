import { headers } from "next/headers";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { confirmBillingCheckoutSession } from "@/lib/services/billing";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoConnectedStripeAccount } from "@/lib/demo-data";
import { log } from "@/lib/logger";
import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";
import { UpgradePlanButton } from "@/components/forms/upgrade-plan-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

const plans = [
  { id: "starter", name: "Starter", cap: "Up to $5k MRR tracked" },
  { id: "pro", name: "Pro", cap: "Up to $20k MRR tracked" },
  { id: "growth", name: "Growth", cap: "Up to $50k MRR tracked" },
] as const;

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const query = await searchParams;
  const workspace = await resolveWorkspaceContextFromHeaders(await headers());
  let workspaceRecord = await ensureWorkspaceExists(workspace.workspaceId);

  const billingStatus = readParam(query, "billing");
  const billingPlanParam = readParam(query, "plan");
  const billingSessionId = readParam(query, "session_id");

  if (billingStatus === "success" && billingSessionId) {
    const confirmed = await confirmBillingCheckoutSession(
      workspace.workspaceId,
      billingSessionId,
    );
    if (confirmed) {
      workspaceRecord = confirmed;
    }
  }

  const connected = await (async () => {
    const { db } = await import("@/lib/db");

    try {
      return await db.connectedStripeAccount.findUnique({
        where: { workspaceId: workspace.workspaceId },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      log("warn", "Using demo connected stripe account due to database connectivity issue", {
        workspaceId: workspace.workspaceId,
        reason: describeFailure(error),
      });

      return getDemoConnectedStripeAccount(workspace.workspaceId);
    }
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Workspace Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Configure integrations and operational defaults for automated recovery.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
          <CardDescription>
            Connect your Stripe account to ingest billing events and orchestrate recovery workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={connected ? "success" : "warning"}>
              {connected ? "Connected" : "Not connected"}
            </Badge>
            <Badge variant={isStripeConfigured() ? "neutral" : "danger"}>
              {isStripeConfigured() ? "Live OAuth configured" : "Demo connect mode"}
            </Badge>
          </div>
          {connected ? (
            <div className="space-y-1 text-sm text-zinc-700">
              <p>
                Stripe account ID:{" "}
                <span className="mono text-xs">{connected.stripeAccountId}</span>
              </p>
              <p>Connected at: {connected.connectedAt.toLocaleString("en-US")}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-700">
              No Stripe account is linked yet. Connect now to start webhook ingestion and automated sequence execution.
            </p>
          )}
          <ConnectStripeButton workspaceId={workspace.workspaceId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DunningDog Billing</CardTitle>
          <CardDescription>
            Choose the subscription plan for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral" className="uppercase">
              Current: {workspaceRecord.billingPlan}
            </Badge>
            {billingStatus === "demo" ? (
              <Badge variant="warning">
                Demo update: switched to {billingPlanParam ?? workspaceRecord.billingPlan}
              </Badge>
            ) : null}
            {billingStatus === "success" ? (
              <Badge variant="success">Stripe checkout completed</Badge>
            ) : null}
            {billingStatus === "canceled" ? (
              <Badge variant="warning">Checkout canceled</Badge>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                  <p className="text-xs text-zinc-600">{plan.cap}</p>
                </div>
                <UpgradePlanButton
                  workspaceId={workspace.workspaceId}
                  plan={plan.id}
                  currentPlan={workspaceRecord.billingPlan}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
