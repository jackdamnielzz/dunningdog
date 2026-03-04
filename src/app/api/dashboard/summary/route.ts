import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { resolveWorkspaceContextFromRequest, ensureWorkspaceExists, requireScope } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { requireActiveWorkspace } from "@/lib/trial";
import { parseWindow } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const context = await resolveWorkspaceContextFromRequest(request);
    requireScope(context, "read:dashboard");
    const workspaceId = context.workspaceId;
    await ensureWorkspaceExists(workspaceId);
    await requireActiveWorkspace(workspaceId);
    const { searchParams } = new URL(request.url);
    const windowParam = parseWindow(searchParams.get("window") ?? undefined);
    const summary = await getDashboardSummary(workspaceId, windowParam);

    const [latestSnapshot, atRiskPreview] = await Promise.all([
      db.metricSnapshot.findFirst({
        where: { workspaceId },
        orderBy: { generatedAt: "desc" },
      }),
      db.subscriptionAtRisk.findMany({
        where: { workspaceId },
        take: 5,
        orderBy: { riskDetectedAt: "desc" },
      }),
    ]);

    return ok({
      ...summary,
      latestSnapshot: latestSnapshot
        ? {
            id: latestSnapshot.id,
            workspaceId: latestSnapshot.workspaceId,
            periodStart: latestSnapshot.periodStart.toISOString(),
            periodEnd: latestSnapshot.periodEnd.toISOString(),
            failedRevenueCents: latestSnapshot.failedRevenueCents,
            recoveredRevenueCents: latestSnapshot.recoveredRevenueCents,
            recoveryRate: latestSnapshot.recoveryRate,
            atRiskCount: latestSnapshot.atRiskCount,
            generatedAt: latestSnapshot.generatedAt.toISOString(),
          }
        : null,
      atRiskPreview: atRiskPreview.map((risk) => ({
        id: risk.id,
        workspaceId: risk.workspaceId,
        stripeCustomerId: risk.stripeCustomerId,
        stripeSubscriptionId: risk.stripeSubscriptionId,
        reason: risk.reason,
        riskDetectedAt: risk.riskDetectedAt.toISOString(),
        expirationDate: risk.expirationDate?.toISOString() ?? null,
        activeRecoveryAttemptId: risk.activeRecoveryAttemptId,
      })),
    });
  } catch (error) {
    return routeError(error, "/api/dashboard/summary");
  }
}
