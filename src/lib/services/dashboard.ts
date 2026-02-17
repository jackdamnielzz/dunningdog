import { subDays, startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import type { DashboardSummaryDTO } from "@/types/domain";

function getWindowStart(window: DashboardSummaryDTO["window"]) {
  const now = new Date();
  switch (window) {
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    case "lifetime":
      return new Date(0);
    case "month":
    default:
      return startOfMonth(now);
  }
}

export async function getDashboardSummary(
  workspaceId: string,
  window: DashboardSummaryDTO["window"] = "month",
): Promise<DashboardSummaryDTO> {
  const windowStart = getWindowStart(window);

  const [failed, recovered, atRiskCount, activeSequences] = await Promise.all([
    db.recoveryAttempt.aggregate({
      where: {
        workspaceId,
        startedAt: { gte: windowStart },
      },
      _sum: { amountDueCents: true },
    }),
    db.recoveryAttempt.aggregate({
      where: {
        workspaceId,
        status: "recovered",
        endedAt: { gte: windowStart },
      },
      _sum: { recoveredAmountCents: true },
    }),
    db.subscriptionAtRisk.count({
      where: { workspaceId },
    }),
    db.recoveryAttempt.count({
      where: {
        workspaceId,
        status: "pending",
      },
    }),
  ]);

  const failedRevenueCents = failed._sum.amountDueCents ?? 0;
  const recoveredRevenueCents = recovered._sum.recoveredAmountCents ?? 0;
  const recoveryRate =
    failedRevenueCents > 0
      ? Number(((recoveredRevenueCents / failedRevenueCents) * 100).toFixed(2))
      : 0;

  return {
    workspaceId,
    window,
    failedRevenueCents,
    recoveredRevenueCents,
    recoveryRate,
    atRiskCount,
    activeSequences,
    generatedAt: new Date().toISOString(),
  };
}

export async function getRecoveryAttempts(
  workspaceId: string,
  limit = 20,
  status?: "pending" | "recovered" | "failed" | "abandoned",
) {
  return db.recoveryAttempt.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
    },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      outcomes: {
        take: 1,
        orderBy: { occurredAt: "desc" },
      },
    },
  });
}
