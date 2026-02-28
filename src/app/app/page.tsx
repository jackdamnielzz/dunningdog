import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, Clock3 } from "lucide-react";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { ProblemError } from "@/lib/problem";
import { getDashboardSummary, getRecoveryAttempts } from "@/lib/services/dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecoveryTable } from "@/components/dashboard/recovery-table";
import { DeclineBreakdown } from "@/components/dashboard/decline-breakdown";
import { DashboardControls } from "@/components/dashboard/dashboard-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
  const requestHeaders = await headers();
  const workspace = await resolveWorkspaceContextFromHeaders(requestHeaders).catch((error) => {
    if (error instanceof ProblemError && error.code === "AUTH_UNAUTHORIZED") {
      redirect("/login?next=/app");
    }
    throw error;
  });
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
