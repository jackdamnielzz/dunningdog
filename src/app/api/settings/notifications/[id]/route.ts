import { z } from "zod";
import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { ProblemError } from "@/lib/problem";
import { db } from "@/lib/db";
import { sendTestNotification } from "@/lib/services/notifications";

const instance = "/api/settings/notifications/[id]";

const patchSchema = z.object({
  label: z.string().max(80).optional(),
  webhookUrl: z.string().url().max(500).optional(),
  events: z
    .array(z.enum(["recovery_started", "recovery_succeeded", "recovery_failed", "predunning_sent"]))
    .min(1)
    .optional(),
  isEnabled: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function verifyOwnership(channelId: string, workspaceId: string) {
  const channel = await db.notificationChannel.findUnique({
    where: { id: channelId },
  });
  if (!channel || channel.workspaceId !== workspaceId) {
    throw new ProblemError({
      title: "Notification channel not found",
      status: 404,
      code: "NOTIFICATION_CHANNEL_NOT_FOUND",
      detail: `Channel ${channelId} not found for this workspace.`,
    });
  }
  return channel;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await verifyOwnership(id, workspace.workspaceId);

    const input = await parseJsonBody(request, patchSchema);
    const updated = await db.notificationChannel.update({
      where: { id },
      data: {
        label: input.label,
        webhookUrl: input.webhookUrl,
        events: input.events,
        isEnabled: input.isEnabled,
      },
    });

    return ok(updated);
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await verifyOwnership(id, workspace.workspaceId);

    await db.notificationChannel.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workspace = await resolveWorkspaceContextFromRequest(request);
    const success = await sendTestNotification(id, workspace.workspaceId);
    return ok({ success });
  } catch (error) {
    return routeError(error, instance);
  }
}
