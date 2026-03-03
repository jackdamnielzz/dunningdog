import { requireWorkspaceContext, ensureWorkspaceExists } from "@/lib/auth";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import { confirmBillingCheckoutSession } from "@/lib/services/billing";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoConnectedStripeAccount } from "@/lib/demo-data";
import { log } from "@/lib/logger";
import { getBranding } from "@/lib/services/branding";
import { planHasFeature } from "@/lib/plan-features";
import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";
import { ManageSubscriptionButton } from "@/components/forms/manage-subscription-button";
import { UpgradePlanButton } from "@/components/forms/upgrade-plan-button";
import { BrandingForm } from "@/components/forms/branding-form";
import { NotificationChannelsForm } from "@/components/forms/notification-channels-form";
import { ApiKeysForm } from "@/components/forms/api-keys-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureGatedCard } from "@/components/dashboard/feature-gated-card";
import { readParam } from "@/lib/params";
import { PLAN_TIERS } from "@/lib/plans";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}


export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const query = await searchParams;
  const workspace = await requireWorkspaceContext("/app/settings");
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

  const branding = await getBranding(workspace.workspaceId).catch(() => null);

  const plan = workspaceRecord.billingPlan;
  const hasBranding = planHasFeature(plan, "email_branding");
  const hasNotifications = planHasFeature(plan, "notifications");
  const hasApiAccess = planHasFeature(plan, "api_access");

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
          {!connected && <ConnectStripeButton workspaceId={workspace.workspaceId} />}
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
            {PLAN_TIERS.map((plan) => {
              const isCurrent = workspaceRecord.billingPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`space-y-3 rounded-lg border-2 bg-white p-4 ${
                    isCurrent
                      ? "border-accent-500 ring-1 ring-accent-200"
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
                      <p className="text-lg font-bold text-zinc-900">${plan.monthly}/mo</p>
                    </div>
                    <p className="text-xs text-zinc-500">{plan.cap}</p>
                  </div>
                  <UpgradePlanButton
                    workspaceId={workspace.workspaceId}
                    plan={plan.id}
                    currentPlan={workspaceRecord.billingPlan}
                    billingStatus={workspaceRecord.billingStatus}
                  />
                </div>
              );
            })}
          </div>
          {workspaceRecord.stripeCustomerId ? (
            <div className="pt-2">
              <ManageSubscriptionButton workspaceId={workspace.workspaceId} />
            </div>
          ) : null}
        </CardContent>
      </Card>
      <FeatureGatedCard
        title="Notifications"
        description="Get alerts in Slack or Discord when payments are recovered, fail, or need attention."
        requiredPlanLabel="Pro plan required"
        hasFeature={hasNotifications}
      >
        <NotificationChannelsForm />
      </FeatureGatedCard>

      <FeatureGatedCard
        title="Email Branding"
        description="Customize the look and feel of recovery emails sent to your customers."
        requiredPlanLabel="Pro plan required"
        hasFeature={hasBranding}
      >
        <BrandingForm
          initialValues={{
            companyName: branding?.companyName ?? null,
            logoUrl: branding?.logoUrl ?? null,
            accentColor: branding?.accentColor ?? DEFAULT_ACCENT_COLOR,
            footerText: branding?.footerText ?? null,
          }}
        />
      </FeatureGatedCard>

      <FeatureGatedCard
        title="API Keys"
        description="Create API keys for programmatic access to your workspace data. Keys are shown once at creation."
        requiredPlanLabel="Scale plan required"
        hasFeature={hasApiAccess}
      >
        <ApiKeysForm />
      </FeatureGatedCard>
    </div>
  );
}
