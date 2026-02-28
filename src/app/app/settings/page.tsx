import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { ProblemError } from "@/lib/problem";
import { confirmBillingCheckoutSession } from "@/lib/services/billing";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoConnectedStripeAccount } from "@/lib/demo-data";
import { log } from "@/lib/logger";
import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";
import { ManageSubscriptionButton } from "@/components/forms/manage-subscription-button";
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
  { id: "starter", name: "Starter", earlyPrice: "$29/mo", fullPrice: "$49/mo", cap: "Up to $10k MRR" },
  { id: "pro", name: "Pro", earlyPrice: "$99/mo", fullPrice: "$149/mo", cap: "Up to $50k MRR" },
  { id: "growth", name: "Scale", earlyPrice: "$199/mo", fullPrice: "$299/mo", cap: "Up to $200k MRR" },
] as const;

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const query = await searchParams;
  const requestHeaders = await headers();
  const workspace = await resolveWorkspaceContextFromHeaders(requestHeaders).catch((error) => {
    if (error instanceof ProblemError && error.code === "AUTH_UNAUTHORIZED") {
      redirect("/login?next=/app/settings");
    }
    throw error;
  });
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
          <div className="flex items-center gap-2">
            <CardTitle>DunningDog Billing</CardTitle>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Early access
            </span>
          </div>
          <CardDescription>
            Choose the subscription plan for this workspace. Early access pricing is locked until all features ship.
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
            {plans.map((plan) => {
              const isCurrent = workspaceRecord.billingPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`space-y-3 rounded-lg border-2 bg-white p-4 ${
                    isCurrent
                      ? "border-emerald-500 ring-1 ring-emerald-200"
                      : "border-zinc-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                      {isCurrent && (
                        <Badge variant="success">Current</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-bold text-zinc-900">{plan.earlyPrice}</p>
                      <p className="text-sm text-zinc-400 line-through">{plan.fullPrice}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{plan.cap}</p>
                  </div>
                  <UpgradePlanButton
                    workspaceId={workspace.workspaceId}
                    plan={plan.id}
                    currentPlan={workspaceRecord.billingPlan}
                  />
                </div>
              );
            })}
          </div>
          {workspaceRecord.stripeCustomerId ? (
            <div className="pt-2">
              <ManageSubscriptionButton />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
