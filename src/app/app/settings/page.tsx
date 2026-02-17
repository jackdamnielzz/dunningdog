import { DEFAULT_WORKSPACE_ID } from "@/lib/constants";
import { ensureWorkspaceExists } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoConnectedStripeAccount } from "@/lib/demo-data";
import { log } from "@/lib/logger";
import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await ensureWorkspaceExists(DEFAULT_WORKSPACE_ID);

  const connected = await (async () => {
    const { db } = await import("@/lib/db");

    try {
      return await db.connectedStripeAccount.findUnique({
        where: { workspaceId: DEFAULT_WORKSPACE_ID },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      log("warn", "Using demo connected stripe account due to database connectivity issue", {
        workspaceId: DEFAULT_WORKSPACE_ID,
        reason: describeFailure(error),
      });

      return getDemoConnectedStripeAccount(DEFAULT_WORKSPACE_ID);
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
          <ConnectStripeButton workspaceId={DEFAULT_WORKSPACE_ID} />
        </CardContent>
      </Card>
    </div>
  );
}
