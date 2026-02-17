import type Stripe from "stripe";
import { db } from "@/lib/db";
import { HARD_DECLINE_CODES } from "@/lib/constants";
import type { DeclineType } from "@/types/domain";
import { ProblemError } from "@/lib/problem";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoSequence } from "@/lib/demo-data";
import { log } from "@/lib/logger";

export function classifyDeclineType(code?: string | null): DeclineType {
  if (!code) return "soft";
  return HARD_DECLINE_CODES.has(code) ? "hard" : "soft";
}

export async function ensureDefaultSequence(workspaceId: string) {
  try {
    const existing = await db.dunningSequence.findFirst({
      where: { workspaceId },
      include: { steps: true },
    });

    if (existing) return existing;

    return db.dunningSequence.create({
      data: {
        workspaceId,
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
              status: "scheduled",
            },
            {
              stepOrder: 2,
              delayHours: 72,
              subjectTemplate: "Reminder: your payment is still pending",
              bodyTemplate:
                "Your subscription is still at risk because payment details were not updated. Please review and update now.",
              status: "scheduled",
            },
            {
              stepOrder: 3,
              delayHours: 168,
              subjectTemplate: "Final reminder before access is affected",
              bodyTemplate:
                "Please update your payment method now to keep your subscription active.",
              status: "scheduled",
            },
          ],
        },
      },
      include: { steps: true },
    });
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    log(
      "warn",
      "Using demo default sequence due to database connectivity issue",
      {
        workspaceId,
        reason: describeFailure(error),
      },
    );

    return getDemoSequence(workspaceId);
  }
}

export async function upsertRecoveryAttemptFromFailedInvoice(
  workspaceId: string,
  invoice: Stripe.Invoice,
) {
  const invoiceRecord = invoice as unknown as Record<string, unknown>;
  const charge = invoiceRecord.charge as
    | { outcome?: { network_status?: string | null } }
    | string
    | undefined;
  const subscription = invoiceRecord.subscription as
    | { id?: string }
    | string
    | undefined;

  const declineCode =
    charge && typeof charge === "object" && charge.outcome
      ? (charge.outcome.network_status ?? null)
      : null;

  const declineType = classifyDeclineType(declineCode);
  const amountDueCents = invoice.amount_due ?? 0;
  const stripeCustomerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? "unknown";
  const stripeSubscriptionId =
    typeof subscription === "string"
      ? subscription
      : subscription?.id ?? `sub_unknown_${invoice.id}`;

  const attempt = await db.recoveryAttempt.upsert({
    where: {
      workspaceId_stripeInvoiceId: {
        workspaceId,
        stripeInvoiceId: invoice.id,
      },
    },
    update: {
      declineType,
      status: "pending",
      amountDueCents,
      startedAt: invoice.created ? new Date(invoice.created * 1000) : new Date(),
    },
    create: {
      workspaceId,
      stripeInvoiceId: invoice.id,
      stripeCustomerId,
      declineType,
      status: "pending",
      amountDueCents,
      startedAt: invoice.created ? new Date(invoice.created * 1000) : new Date(),
    },
  });

  await db.subscriptionAtRisk.upsert({
    where: {
      id: `${workspaceId}_${stripeSubscriptionId}`,
    },
    update: {
      reason: "payment_failed",
      riskDetectedAt: new Date(),
      stripeCustomerId,
      stripeSubscriptionId,
      activeRecoveryAttemptId: attempt.id,
    },
    create: {
      id: `${workspaceId}_${stripeSubscriptionId}`,
      workspaceId,
      stripeCustomerId,
      stripeSubscriptionId,
      reason: "payment_failed",
      riskDetectedAt: new Date(),
      activeRecoveryAttemptId: attempt.id,
    },
  });

  return attempt;
}

export async function markRecoverySucceeded(
  workspaceId: string,
  invoice: Stripe.Invoice,
) {
  const attempt = await db.recoveryAttempt.findUnique({
    where: {
      workspaceId_stripeInvoiceId: {
        workspaceId,
        stripeInvoiceId: invoice.id,
      },
    },
  });

  if (!attempt) {
    return null;
  }

  const recoveredAmount = invoice.amount_paid ?? invoice.amount_due ?? 0;
  const updated = await db.recoveryAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "recovered",
      recoveredAmountCents: recoveredAmount,
      endedAt: new Date(),
    },
  });

  await db.recoveryOutcome.create({
    data: {
      workspaceId,
      recoveryAttemptId: attempt.id,
      outcome: "recovered",
      occurredAt: new Date(),
    },
  });

  await db.subscriptionAtRisk.deleteMany({
    where: {
      workspaceId,
      activeRecoveryAttemptId: attempt.id,
    },
  });

  return updated;
}

export async function persistStripeEvent(params: {
  workspaceId: string;
  eventId: string;
  eventType: string;
  payload: unknown;
}) {
  try {
    const stripeEvent = await db.stripeEvent.create({
      data: {
        workspaceId: params.workspaceId,
        stripeEventId: params.eventId,
        eventType: params.eventType,
        payloadJson: params.payload as object,
        processingStatus: "received",
      },
    });
    return { stripeEvent, duplicate: false };
  } catch {
    const existing = await db.stripeEvent.findUnique({
      where: { stripeEventId: params.eventId },
    });
    if (existing) {
      return { stripeEvent: existing, duplicate: true };
    }
    throw new ProblemError({
      title: "Stripe webhook processing failed",
      status: 500,
      code: "DUNNING_WEBHOOK_PROCESSING_FAILED",
      detail: "Unable to persist incoming Stripe event.",
    });
  }
}

export async function processStripeWebhookEvent(params: {
  workspaceId: string;
  event: Stripe.Event;
}) {
  const { workspaceId, event } = params;
  const eventType = event.type;

  if (eventType === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const attempt = await upsertRecoveryAttemptFromFailedInvoice(workspaceId, invoice);
    await ensureDefaultSequence(workspaceId);
    await db.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
        processingStatus: "processed",
      },
    });
    return { action: "recovery_started", recoveryAttemptId: attempt.id };
  }

  if (eventType === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const attempt = await markRecoverySucceeded(workspaceId, invoice);
    await db.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
        processingStatus: "processed",
      },
    });
    return { action: "recovery_succeeded", recoveryAttemptId: attempt?.id ?? null };
  }

  if (eventType === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeSubscriptionId = subscription.id;
    const stripeCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    if (subscription.cancel_at_period_end || subscription.status === "canceled") {
      await db.subscriptionAtRisk.deleteMany({
        where: { workspaceId, stripeSubscriptionId },
      });
    } else {
      await db.subscriptionAtRisk.upsert({
        where: {
          id: `${workspaceId}_${stripeSubscriptionId}`,
        },
        update: {
          stripeCustomerId,
          stripeSubscriptionId,
          reason: "payment_failed",
          riskDetectedAt: new Date(),
        },
        create: {
          id: `${workspaceId}_${stripeSubscriptionId}`,
          workspaceId,
          stripeCustomerId,
          stripeSubscriptionId,
          reason: "payment_failed",
          riskDetectedAt: new Date(),
        },
      });
    }

    await db.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
        processingStatus: "processed",
      },
    });
    return { action: "subscription_synced" };
  }

  if (eventType === "payment_method.automatically_updated") {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    const customerId =
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : paymentMethod.customer?.id;

    if (customerId) {
      await db.subscriptionAtRisk.deleteMany({
        where: {
          workspaceId,
          stripeCustomerId: customerId,
          reason: "card_expiring",
        },
      });
    }

    await db.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
        processingStatus: "processed",
      },
    });
    return { action: "payment_method_updated" };
  }

  await db.stripeEvent.update({
    where: { stripeEventId: event.id },
    data: {
      processedAt: new Date(),
      processingStatus: "processed",
    },
  });
  return { action: "ignored" };
}
