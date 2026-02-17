import { addDays, isBefore } from "date-fns";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/env";

export async function runPreDunningScan(workspaceId: string) {
  const threshold = addDays(new Date(), 14);

  const existing = await db.subscriptionAtRisk.findMany({
    where: {
      workspaceId,
      reason: "card_expiring",
      expirationDate: { not: null },
    },
  });

  const candidates = existing.filter((entry) => {
    if (!entry.expirationDate) return false;
    return isBefore(entry.expirationDate, threshold);
  });

  if (isDemoMode && candidates.length === 0) {
    const demo = await db.subscriptionAtRisk.upsert({
      where: {
        id: `${workspaceId}_demo_predunning`,
      },
      update: {
        reason: "card_expiring",
        riskDetectedAt: new Date(),
        expirationDate: addDays(new Date(), 10),
      },
      create: {
        id: `${workspaceId}_demo_predunning`,
        workspaceId,
        stripeCustomerId: "cus_demo_predunning",
        stripeSubscriptionId: "sub_demo_predunning",
        reason: "card_expiring",
        riskDetectedAt: new Date(),
        expirationDate: addDays(new Date(), 10),
      },
    });
    return [demo];
  }

  return candidates;
}
