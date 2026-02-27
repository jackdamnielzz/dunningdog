import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { ProblemError } from "@/lib/problem";
import { getRecoveryAttempts } from "@/lib/services/dashboard";
import { RecoveryTable } from "@/components/dashboard/recovery-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RecoveriesPage() {
  const requestHeaders = await headers();
  const workspace = await resolveWorkspaceContextFromHeaders(requestHeaders).catch((error) => {
    if (error instanceof ProblemError && error.code === "AUTH_UNAUTHORIZED") {
      redirect("/login?next=/app/recoveries");
    }
    throw error;
  });
  await ensureWorkspaceExists(workspace.workspaceId);
  const recoveries = await getRecoveryAttempts(workspace.workspaceId, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Recovery Attempts</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Full event history for failed and recovered invoices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to use this view</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-700">
          Monitor pending attempts to spot stalled recoveries. Use this table to audit
          invoice-level outcomes and validate whether dunning sequence timing aligns with
          your customers&apos; payment behavior.
        </CardContent>
      </Card>

      <RecoveryTable
        title="All recoveries"
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
