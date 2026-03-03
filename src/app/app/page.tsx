import Link from "next/link";
import { BarChart3, Clock3 } from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth";
import { getDashboardSummary, getRecoveryAttempts } from "@/lib/services/dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecoveryTable } from "@/components/dashboard/recovery-table";
import { DeclineBreakdown } from "@/components/dashboard/decline-breakdown";
import { DashboardControls } from "@/components/dashboard/dashboard-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
  const workspace = await requireWorkspaceContext("/app");
  const [summary, recoveries] = await Promise.all([
    getDashboardSummary(workspace.workspaceId, "month"),
    getRecoveryAttempts(workspace.workspaceId, 8),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Revenue Recovery Dashboard</h1>
          <p className="mt-1 truncate text-sm text-zinc-600">
            Workspace: <span className="mono">{workspace.workspaceId}</span>
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Link href="/app/sequences" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">Edit sequences</Button>
          </Link>
          <Link href="/app/settings" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">Connect Stripe</Button>
          </Link>
        </div>
      </div>

      <DashboardControls />

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
              <BarChart3 className="h-4 w-4 text-accent-600" />
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
              <Clock3 className="h-4 w-4 text-accent-600" />
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

      {summary.declineBreakdown && (
        <DeclineBreakdown
          soft={summary.declineBreakdown.soft}
          hard={summary.declineBreakdown.hard}
        />
      )}

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
