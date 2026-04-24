import { addMinutes } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureWorkspaceExists, resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { reportAnalyticsEvent } from "@/lib/observability";
import { requireActiveWorkspace } from "@/lib/trial";

const schema = z.object({
  workspaceId: z.string().min(2).optional(),
});

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, schema);
    const workspace = await resolveWorkspaceContextFromRequest(
      request,
      input.workspaceId ?? null,
    );
    await ensureWorkspaceExists(workspace.workspaceId);
    await requireActiveWorkspace(workspace.workspaceId);

    const state = nanoid(32);
    await db.stripeOAuthState.create({
      data: {
        state,
        workspaceId: workspace.workspaceId,
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    const callbackUrl = `${env.APP_BASE_URL}/api/stripe/connect/callback`;
    const browserCallbackUrl = `${callbackUrl}?mode=browser`;
    let redirectUrl = `${callbackUrl}?code=demo_code&state=${state}&mode=browser`;

    if (env.STRIPE_APP_CLIENT_ID) {
      const url = new URL(
        "https://marketplace.stripe.com/oauth/v2/authorize",
      );
      url.searchParams.set("client_id", env.STRIPE_APP_CLIENT_ID);
      url.searchParams.set("redirect_uri", browserCallbackUrl);
      url.searchParams.set("state", state);
      redirectUrl = url.toString();
    }

    reportAnalyticsEvent({
      event: "stripe_connect_started",
      distinctId: workspace.workspaceId,
      properties: {
        workspaceId: workspace.workspaceId,
        oauthMode: env.STRIPE_APP_CLIENT_ID ? "live" : "demo",
      },
    });

    return ok({
      redirectUrl,
      state,
    });
  } catch (error) {
    return routeError(error, "/api/stripe/connect/start");
  }
}
