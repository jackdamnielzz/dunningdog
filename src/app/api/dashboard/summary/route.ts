import { ProblemError } from "@/lib/problem";
import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { getWorkspaceIdFromRequest, ensureWorkspaceExists } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { parseWindow } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const workspaceId = await getWorkspaceIdFromRequest(request);
    await ensureWorkspaceExists(workspaceId);
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
    if (error instanceof ProblemError) {
      return routeError(error, "/api/dashboard/summary");
    }
    return routeError(error, "/api/dashboard/summary");
  }
}
