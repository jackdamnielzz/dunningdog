import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: {
      id: DEFAULT_WORKSPACE_ID,
      name: DEFAULT_WORKSPACE_NAME,
      ownerUserId: "demo-owner",
      timezone: "UTC",
      billingPlan: "starter",
      members: {
        create: {
          userId: "demo-owner",
          role: "owner",
        },
      },
    },
  });

  const existingSequence = await prisma.dunningSequence.findFirst({
    where: { workspaceId: workspace.id },
  });

  if (!existingSequence) {
    await prisma.dunningSequence.create({
      data: {
        workspaceId: workspace.id,
        name: "Default Recovery Sequence",
        isEnabled: true,
        version: 1,
        steps: {
          create: [
            {
              stepOrder: 1,
              delayHours: 0,
              subjectTemplate: "Action needed: update your payment details",
              bodyTemplate:
                "We could not process your recent payment. Please update your payment method to avoid subscription interruption.",
            },
            {
              stepOrder: 2,
              delayHours: 72,
              subjectTemplate: "Reminder: your payment is still pending",
              bodyTemplate:
                "Your subscription is still at risk because payment details were not updated. Please review and update now.",
            },
            {
              stepOrder: 3,
              delayHours: 168,
              subjectTemplate: "Final reminder before access is affected",
              bodyTemplate:
                "Please update your payment method now to keep your subscription active.",
            },
          ],
        },
      },
    });
  }

  const pendingAttempt = await prisma.recoveryAttempt.upsert({
    where: {
      workspaceId_stripeInvoiceId: {
        workspaceId: workspace.id,
        stripeInvoiceId: "in_demo_pending",
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      stripeInvoiceId: "in_demo_pending",
      stripeCustomerId: "cus_demo_001",
      declineType: "soft",
      status: "pending",
      amountDueCents: 6900,
      startedAt: subDays(new Date(), 2),
    },
  });

  const recoveredAttempt = await prisma.recoveryAttempt.upsert({
    where: {
      workspaceId_stripeInvoiceId: {
        workspaceId: workspace.id,
        stripeInvoiceId: "in_demo_recovered",
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      stripeInvoiceId: "in_demo_recovered",
      stripeCustomerId: "cus_demo_002",
      declineType: "soft",
      status: "recovered",
      amountDueCents: 12900,
      recoveredAmountCents: 12900,
      startedAt: subDays(new Date(), 8),
      endedAt: subDays(new Date(), 5),
    },
  });

  await prisma.recoveryOutcome.upsert({
    where: { id: "outcome_demo_recovered" },
    update: {},
    create: {
      id: "outcome_demo_recovered",
      workspaceId: workspace.id,
      recoveryAttemptId: recoveredAttempt.id,
      outcome: "recovered",
      occurredAt: subDays(new Date(), 5),
    },
  });

  await prisma.subscriptionAtRisk.upsert({
    where: { id: `${workspace.id}_sub_demo_pending` },
    update: {},
    create: {
      id: `${workspace.id}_sub_demo_pending`,
      workspaceId: workspace.id,
      stripeCustomerId: pendingAttempt.stripeCustomerId,
      stripeSubscriptionId: "sub_demo_pending",
      reason: "payment_failed",
      riskDetectedAt: subDays(new Date(), 2),
      activeRecoveryAttemptId: pendingAttempt.id,
    },
  });

  await prisma.subscriptionAtRisk.upsert({
    where: { id: `${workspace.id}_sub_demo_expiring` },
    update: {},
    create: {
      id: `${workspace.id}_sub_demo_expiring`,
      workspaceId: workspace.id,
      stripeCustomerId: "cus_demo_003",
      stripeSubscriptionId: "sub_demo_expiring",
      reason: "card_expiring",
      riskDetectedAt: subDays(new Date(), 1),
      expirationDate: addDays(new Date(), 10),
    },
  });

  console.log("Seed complete for workspace:", workspace.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
