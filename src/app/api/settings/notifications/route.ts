import { z } from "zod";
import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";

const instance = "/api/settings/notifications";

const createSchema = z.object({
  type: z.enum(["slack", "discord"]),
  label: z.string().max(80).optional(),
  webhookUrl: z.string().url().max(500),
  events: z
    .array(z.enum(["recovery_started", "recovery_succeeded", "recovery_failed", "predunning_sent"]))
    .min(1),
});

export async function GET(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    const channels = await db.notificationChannel.findMany({
      where: { workspaceId: workspace.workspaceId },
      orderBy: { createdAt: "desc" },
    });
    return ok(channels);
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    const input = await parseJsonBody(request, createSchema);

    const channel = await db.notificationChannel.create({
      data: {
        workspaceId: workspace.workspaceId,
        type: input.type,
        label: input.label ?? "",
        webhookUrl: input.webhookUrl,
        events: input.events,
      },
    });

    return ok(channel, 201);
  } catch (error) {
    return routeError(error, instance);
  }
}
