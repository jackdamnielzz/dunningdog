import { db } from "@/lib/db";
import { getResendClient } from "@/lib/resend";
import { env, isDemoMode } from "@/lib/env";
import { log } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

interface SendEmailParams {
  workspaceId: string;
  recoveryAttemptId?: string;
  toEmail?: string;
  subject: string;
  body: string;
  templateKey: string;
  metadata?: Record<string, unknown>;
}

export async function sendDunningEmail(params: SendEmailParams) {
  const to = params.toEmail;

  if (!to) {
    // Prevent silently sending to placeholder addresses in production paths.
    log("warn", "Skipping dunning email send: no recipient email resolved", {
      workspaceId: params.workspaceId,
      recoveryAttemptId: params.recoveryAttemptId,
      templateKey: params.templateKey,
      metadata: params.metadata,
    });

    return db.emailLog.create({
      data: {
        workspaceId: params.workspaceId,
        recoveryAttemptId: params.recoveryAttemptId,
        providerMessageId: null,
        templateKey: params.templateKey,
        deliveryStatus: "failed",
        metadata: {
          ...(params.metadata ?? {}),
          skipped: true,
          skipReason: "missing_to_email",
        } as Prisma.InputJsonValue,
      },
    });
  }

  const resend = getResendClient();

  let deliveryStatus: "sent" | "failed" = "sent";
  let providerMessageId: string | undefined;

  if (!isDemoMode && resend) {
    try {
      const response = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: params.subject,
        text: params.body,
      });
      providerMessageId = response.data?.id;
    } catch (error) {
      deliveryStatus = "failed";
      log("error", "Failed to send dunning email", {
        workspaceId: params.workspaceId,
        recoveryAttemptId: params.recoveryAttemptId,
        error,
      });
    }
  } else {
    log("info", "Demo-mode email send", {
      workspaceId: params.workspaceId,
      recoveryAttemptId: params.recoveryAttemptId,
      subject: params.subject,
    });
  }

  return db.emailLog.create({
    data: {
      workspaceId: params.workspaceId,
      recoveryAttemptId: params.recoveryAttemptId,
      providerMessageId,
      templateKey: params.templateKey,
      deliveryStatus,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
