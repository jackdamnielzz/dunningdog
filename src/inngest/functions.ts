import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { sendDunningEmail } from "@/lib/services/email";
import { resolveCustomerEmail } from "@/lib/services/customer-email";
import { generatePaymentUpdateToken } from "@/lib/services/payment-tokens";
import { sendNotification } from "@/lib/services/notifications";

export const recoveryStartedFunction = inngest.createFunction(
  { id: "recovery-started-sequence" },
  { event: "recovery/started" },
  async ({ event, step }) => {
    const { workspaceId, recoveryAttemptId, stripeCustomerId, customerEmail } = event.data;

    const attempt = await step.run("load-recovery-attempt", async () =>
      db.recoveryAttempt.findUnique({
        where: { id: recoveryAttemptId },
      }),
    );
    if (!attempt) {
      return { skipped: true, reason: "attempt_not_found" };
    }

    const sequence = await step.run("load-sequence", async () =>
      db.dunningSequence.findFirst({
        where: {
          workspaceId,
          isEnabled: true,
        },
        include: {
          steps: { orderBy: { stepOrder: "asc" } },
        },
      }),
    );

    if (!sequence || sequence.steps.length === 0) {
      return { skipped: true, reason: "sequence_not_found" };
    }

    for (const sequenceStep of sequence.steps) {
      if (sequenceStep.delayHours > 0) {
        await step.sleep(`delay-step-${sequenceStep.stepOrder}`, `${sequenceStep.delayHours}h`);
      }

      const latestAttempt = await step.run(
        `refresh-attempt-${sequenceStep.stepOrder}`,
        async () =>
          db.recoveryAttempt.findUnique({
            where: { id: recoveryAttemptId },
          }),
      );

      if (!latestAttempt || latestAttempt.status !== "pending") {
        return {
          stopped: true,
          reason: "attempt_not_pending",
          atStep: sequenceStep.stepOrder,
        };
      }

      const toEmail = await step.run(`resolve-email-${sequenceStep.stepOrder}`, async () =>
        resolveCustomerEmail({
          workspaceId,
          stripeCustomerId: latestAttempt.stripeCustomerId ?? stripeCustomerId,
          invoiceEmailHint: customerEmail,
        }),
      );

      if (!toEmail) {
        // No resolvable email: skip sending this step.
        await step.run(`log-skip-${sequenceStep.stepOrder}`, async () =>
          sendDunningEmail({
            workspaceId,
            recoveryAttemptId,
            toEmail: undefined,
            subject: sequenceStep.subjectTemplate,
            body: sequenceStep.bodyTemplate,
            templateKey: `sequence_${sequence.id}_step_${sequenceStep.stepOrder}`,
            metadata: {
              sequenceId: sequence.id,
              sequenceStepId: sequenceStep.id,
              stepOrder: sequenceStep.stepOrder,
              skippedByWorkflow: true,
              skipReason: "missing_customer_email",
            },
          }),
        );
        continue;
      }

      const paymentToken = await step.run(
        `gen-token-${sequenceStep.stepOrder}`,
        async () =>
          generatePaymentUpdateToken({
            workspaceId,
            recoveryAttemptId,
          }),
      );

      await step.run(`send-step-${sequenceStep.stepOrder}`, async () =>
        sendDunningEmail({
          workspaceId,
          recoveryAttemptId,
          toEmail,
          subject: sequenceStep.subjectTemplate,
          body: sequenceStep.bodyTemplate,
          paymentUpdateUrl: paymentToken.url,
          templateKey: `sequence_${sequence.id}_step_${sequenceStep.stepOrder}`,
          metadata: {
            sequenceId: sequence.id,
            sequenceStepId: sequenceStep.id,
            stepOrder: sequenceStep.stepOrder,
          },
        }),
      );
    }

    await step.run("notify-recovery-started", async () =>
      sendNotification({
        workspaceId,
        event: "recovery_started",
        data: {
          stripeCustomerId,
          stripeInvoiceId: attempt.stripeInvoiceId,
          amountDueCents: attempt.amountDueCents,
          declineType: attempt.declineType,
        },
      }),
    );

    return {
      deliveredSteps: sequence.steps.length,
    };
  },
);

export const recoverySucceededFunction = inngest.createFunction(
  { id: "recovery-succeeded-finalize" },
  { event: "recovery/succeeded" },
  async ({ event, step }) => {
    const { workspaceId, stripeInvoiceId } = event.data;
    const closedAttempt = await step.run("close-recovery", async () => {
      const attempt = await db.recoveryAttempt.findUnique({
        where: {
          workspaceId_stripeInvoiceId: {
            workspaceId,
            stripeInvoiceId,
          },
        },
      });
      if (!attempt) return null;
      if (attempt.status === "recovered") return attempt;
      return db.recoveryAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "recovered",
          endedAt: new Date(),
        },
      });
    });

    if (closedAttempt) {
      await step.run("notify-recovery-succeeded", async () =>
        sendNotification({
          workspaceId,
          event: "recovery_succeeded",
          data: {
            stripeInvoiceId,
            recoveredAmountCents: closedAttempt.recoveredAmountCents ?? closedAttempt.amountDueCents,
          },
        }),
      );
    }

    return { done: true };
  },
);

export const preDunningCandidateFunction = inngest.createFunction(
  { id: "predunning-candidate-notify" },
  { event: "predunning/candidate" },
  async ({ event, step }) => {
    const { workspaceId, stripeCustomerId, stripeSubscriptionId, expirationDate } = event.data;

    const toEmail = await step.run("resolve-predunning-email", async () =>
      resolveCustomerEmail({
        workspaceId,
        stripeCustomerId,
        invoiceEmailHint: null,
      }),
    );

    if (!toEmail) {
      await step.run("log-skip-predunning-email", async () =>
        sendDunningEmail({
          workspaceId,
          toEmail: undefined,
          subject: "Heads up: your card will expire soon",
          body: `Your payment method for subscription ${stripeSubscriptionId} is expected to expire around ${expirationDate}. Please update it to avoid service interruption.`,
          templateKey: "predunning_default",
          metadata: {
            stripeCustomerId,
            stripeSubscriptionId,
            expirationDate,
            skippedByWorkflow: true,
            skipReason: "missing_customer_email",
          },
        }),
      );
      return { sent: false, skipped: true, reason: "missing_customer_email" };
    }

    await step.run("send-predunning-email", async () =>
      sendDunningEmail({
        workspaceId,
        toEmail,
        subject: "Heads up: your card will expire soon",
        body: `Your payment method for subscription ${stripeSubscriptionId} is expected to expire around ${expirationDate}. Please update it to avoid service interruption.`,
        templateKey: "predunning_default",
        metadata: {
          stripeCustomerId,
          stripeSubscriptionId,
          expirationDate,
        },
      }),
    );

    await step.run("notify-predunning-sent", async () =>
      sendNotification({
        workspaceId,
        event: "predunning_sent",
        data: { stripeCustomerId, stripeSubscriptionId, expirationDate },
      }),
    );

    return { sent: true, skipped: false };
  },
);

export const inngestFunctions = [
  recoveryStartedFunction,
  recoverySucceededFunction,
  preDunningCandidateFunction,
];
