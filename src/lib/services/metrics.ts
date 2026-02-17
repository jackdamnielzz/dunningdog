import { endOfMonth, startOfMonth } from "date-fns";
import { db } from "@/lib/db";

export async function generateCurrentMonthSnapshot(workspaceId: string) {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  const [failed, recovered, atRiskCount] = await Promise.all([
    db.recoveryAttempt.aggregate({
      where: {
        workspaceId,
        startedAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amountDueCents: true },
    }),
    db.recoveryAttempt.aggregate({
      where: {
        workspaceId,
        status: "recovered",
        endedAt: { gte: periodStart, lte: periodEnd },
      },
      _sum: { recoveredAmountCents: true },
    }),
    db.subscriptionAtRisk.count({ where: { workspaceId } }),
  ]);

  const failedRevenueCents = failed._sum.amountDueCents ?? 0;
  const recoveredRevenueCents = recovered._sum.recoveredAmountCents ?? 0;
  const recoveryRate =
    failedRevenueCents > 0
      ? Number(((recoveredRevenueCents / failedRevenueCents) * 100).toFixed(2))
      : 0;

  return db.metricSnapshot.upsert({
    where: {
      workspaceId_periodStart_periodEnd: {
        workspaceId,
        periodStart,
        periodEnd,
      },
    },
    update: {
      failedRevenueCents,
      recoveredRevenueCents,
      recoveryRate,
      atRiskCount,
      generatedAt: new Date(),
    },
    create: {
      workspaceId,
      periodStart,
      periodEnd,
      failedRevenueCents,
      recoveredRevenueCents,
      recoveryRate,
      atRiskCount,
      generatedAt: new Date(),
    },
  });
}
