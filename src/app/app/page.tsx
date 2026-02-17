import Link from "next/link";
import { headers } from "next/headers";
import { BarChart3, Clock3 } from "lucide-react";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { getDashboardSummary, getRecoveryAttempts } from "@/lib/services/dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecoveryTable } from "@/components/dashboard/recovery-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
  const workspace = await resolveWorkspaceContextFromHeaders(await headers());
  await ensureWorkspaceExists(workspace.workspaceId);
  const [summary, recoveries] = await Promise.all([
    getDashboardSummary(workspace.workspaceId, "month"),
    getRecoveryAttempts(workspace.workspaceId, 8),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Revenue Recovery Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Workspace: <span className="mono">{workspace.workspaceId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/sequences">
            <Button variant="outline">Edit sequences</Button>
          </Link>
          <Link href="/app/settings">
            <Button>Connect Stripe</Button>
          </Link>
        </div>
      </div>

      <SummaryCards
        failedRevenueCents={summary.failedRevenueCents}
        recoveredRevenueCents={summary.recoveredRevenueCents}
        recoveryRate={summary.recoveryRate}
        atRiskCount={summary.atRiskCount}
        activeSequences={summary.activeSequences}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Golden Metric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700">
              Recovery Rate target is <strong>65%+</strong>. Current monthly rate is{" "}
              <strong>{summary.recoveryRate.toFixed(2)}%</strong>.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Suggested cadence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700">
              Review this dashboard weekly. Sequence automation is designed to run in the
              background while preserving auditability for every recovery attempt.
            </p>
          </CardContent>
        </Card>
      </div>

      <RecoveryTable
        items={recoveries.map((item) => ({
          attempt: {
            id: item.id,
            stripeInvoiceId: item.stripeInvoiceId,
            stripeCustomerId: item.stripeCustomerId,
            declineType: item.declineType,
            status: item.status,
            amountDueCents: item.amountDueCents,
            recoveredAmountCents: item.recoveredAmountCents,
            startedAt: item.startedAt.toISOString(),
            endedAt: item.endedAt?.toISOString() ?? null,
          },
        }))}
      />
    </div>
  );
}
