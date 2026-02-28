import { db } from "@/lib/db";
import { getSmtpTransporter } from "@/lib/smtp";
import { env, isDemoMode } from "@/lib/env";
import { log } from "@/lib/logger";
import { getBranding } from "@/lib/services/branding";
import { renderDunningEmailHtml } from "@/lib/services/email-template";
import type { Prisma } from "@prisma/client";

interface SendEmailParams {
  workspaceId: string;
  recoveryAttemptId?: string;
  toEmail?: string;
  subject: string;
  body: string;
  templateKey: string;
  paymentUpdateUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function sendDunningEmail(params: SendEmailParams) {
  const to = params.toEmail;

  if (!to) {
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

  const branding = await getBranding(params.workspaceId).catch(() => null);
  const html = renderDunningEmailHtml({
    subject: params.subject,
    body: params.body,
    branding,
    paymentUpdateUrl: params.paymentUpdateUrl,
  });

  const fromName = branding?.companyName ?? "DunningDog";
  const from = `${fromName} <${env.SMTP_FROM_EMAIL}>`;

  const transporter = getSmtpTransporter();

  let deliveryStatus: "sent" | "failed" = "sent";
  let providerMessageId: string | undefined;

  if (!isDemoMode && transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: params.subject,
        text: params.body,
        html,
      });
      providerMessageId = info.messageId;
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
