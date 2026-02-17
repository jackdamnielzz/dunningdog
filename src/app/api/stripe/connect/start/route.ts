import { addMinutes } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureWorkspaceExists, resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { reportAnalyticsEvent } from "@/lib/observability";

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

    if (env.STRIPE_CONNECT_CLIENT_ID) {
      const url = new URL("https://connect.stripe.com/oauth/authorize");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", env.STRIPE_CONNECT_CLIENT_ID);
      url.searchParams.set("scope", "read_write");
      url.searchParams.set("state", state);
      url.searchParams.set("redirect_uri", browserCallbackUrl);
      redirectUrl = url.toString();
    }

    reportAnalyticsEvent({
      event: "stripe_connect_started",
      distinctId: workspace.workspaceId,
      properties: {
        workspaceId: workspace.workspaceId,
        oauthMode: env.STRIPE_CONNECT_CLIENT_ID ? "live" : "demo",
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
