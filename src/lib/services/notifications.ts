import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import type { NotificationEventKind } from "@prisma/client";

interface NotificationPayload {
  title: string;
  description: string;
  fields?: Array<{ label: string; value: string }>;
  color?: string;
}

function formatSlackPayload(payload: NotificationPayload) {
  const fields = payload.fields?.map((f) => ({
    type: "mrkdwn" as const,
    text: `*${f.label}*\n${f.value}`,
  }));

  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: payload.title },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: payload.description },
      },
      ...(fields && fields.length > 0
        ? [{ type: "section", fields }]
        : []),
    ],
  };
}

function formatDiscordPayload(payload: NotificationPayload) {
  return {
    embeds: [
      {
        title: payload.title,
        description: payload.description,
        color: payload.color
          ? parseInt(payload.color.replace("#", ""), 16)
          : parseInt(DEFAULT_ACCENT_COLOR.replace("#", ""), 16),
        fields: payload.fields?.map((f) => ({
          name: f.label,
          value: f.value,
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function buildPayload(
  event: NotificationEventKind,
  data: Record<string, unknown>,
): NotificationPayload {
  const formatAmount = (cents: unknown) =>
    typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : "N/A";

  switch (event) {
    case "recovery_started":
      return {
        title: "Recovery Started",
        description: `A new payment recovery has been initiated for customer \`${data.stripeCustomerId ?? "unknown"}\`.`,
        fields: [
          { label: "Invoice", value: String(data.stripeInvoiceId ?? "—") },
          { label: "Amount", value: formatAmount(data.amountDueCents) },
          { label: "Decline Type", value: String(data.declineType ?? "—") },
        ],
        color: "#f59e0b",
      };
    case "recovery_succeeded":
      return {
        title: "Payment Recovered!",
        description: `Payment was successfully recovered for invoice \`${data.stripeInvoiceId ?? "unknown"}\`.`,
        fields: [
          { label: "Amount Recovered", value: formatAmount(data.recoveredAmountCents) },
        ],
        color: "#10b981",
      };
    case "recovery_failed":
      return {
        title: "Recovery Failed",
        description: `Recovery attempt for invoice \`${data.stripeInvoiceId ?? "unknown"}\` has failed.`,
        fields: [
          { label: "Amount Lost", value: formatAmount(data.amountDueCents) },
          { label: "Reason", value: String(data.reason ?? "—") },
        ],
        color: "#ef4444",
      };
    case "predunning_sent":
      return {
        title: "Pre-Dunning Alert Sent",
        description: `A pre-dunning notification was sent to customer \`${data.stripeCustomerId ?? "unknown"}\`.`,
        fields: [
          { label: "Subscription", value: String(data.stripeSubscriptionId ?? "—") },
          { label: "Card Expires", value: String(data.expirationDate ?? "—") },
        ],
        color: "#8b5cf6",
      };
  }
}

export async function sendNotification(params: {
  workspaceId: string;
  event: NotificationEventKind;
  data: Record<string, unknown>;
}) {
  const channels = await db.notificationChannel.findMany({
    where: {
      workspaceId: params.workspaceId,
      isEnabled: true,
      events: { has: params.event },
    },
  });

  if (channels.length === 0) return;

  const payload = buildPayload(params.event, params.data);

  await Promise.allSettled(
    channels.map(async (channel) => {
      const body =
        channel.type === "slack"
          ? formatSlackPayload(payload)
          : formatDiscordPayload(payload);

      try {
        const response = await fetch(channel.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          log("warn", "Notification webhook returned non-OK status", {
            channelId: channel.id,
            type: channel.type,
            status: response.status,
          });
        }
      } catch (error) {
        log("error", "Failed to send notification webhook", {
          channelId: channel.id,
          type: channel.type,
          error,
        });
      }
    }),
  );
}

export async function sendTestNotification(channelId: string, workspaceId: string) {
  const channel = await db.notificationChannel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.workspaceId !== workspaceId) return false;

  const payload = buildPayload("recovery_succeeded", {
    stripeInvoiceId: "inv_test_123",
    recoveredAmountCents: 9900,
  });

  const body =
    channel.type === "slack"
      ? formatSlackPayload(payload)
      : formatDiscordPayload(payload);

  const response = await fetch(channel.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.ok;
}
