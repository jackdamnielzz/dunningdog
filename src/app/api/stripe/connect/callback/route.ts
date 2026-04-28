import { addHours } from "date-fns";
import { ProblemError } from "@/lib/problem";
import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encryptText } from "@/lib/crypto";
import { ensureWorkspaceExists } from "@/lib/auth";
import { exchangeOAuthCode } from "@/lib/stripe/oauth";
import { reportAnalyticsEvent } from "@/lib/observability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

    const oauthState = state
      ? await db.stripeOAuthState.findUnique({ where: { state } })
      : null;

    const isAppInitiated = oauthState && oauthState.expiresAt >= new Date();

    if (!isAppInitiated) {
      // Marketplace-initiated install (no app-side state, or expired). The user
      // installed the app from the Stripe App Marketplace without first signing
      // up on dunningdog.com. Redirect them to the register page so they can
      // create an account; once signed in, they can complete the connection
      // through the normal in-app "Connect Stripe" flow.
      return Response.redirect(
        `${env.APP_BASE_URL}/register?ref=stripe-marketplace`,
        302,
      );
    }

    const workspace = await ensureWorkspaceExists(oauthState.workspaceId);

    let stripeAccountId = `acct_demo_${workspace.id.slice(-8)}`;
    let accessToken = `demo_token_${workspace.id}`;
    let refreshToken = "";
    let scope = "read_write";
    let livemode = false;

    if (code && code !== "demo_code" && env.STRIPE_SECRET_KEY) {
      const tokenResponse = await exchangeOAuthCode(code);

      if (!tokenResponse.stripe_user_id) {
        throw new ProblemError({
          title: "Stripe OAuth exchange failed",
          status: 502,
          code: "STRIPE_OAUTH_EXCHANGE_FAILED",
          detail: "Stripe did not return an account identifier.",
        });
      }

      stripeAccountId = tokenResponse.stripe_user_id;
      accessToken = tokenResponse.access_token ?? accessToken;
      refreshToken = tokenResponse.refresh_token ?? "";
      scope = tokenResponse.scope ?? scope;
      livemode = tokenResponse.livemode ?? false;
    }

    const tokenExpiresAt = addHours(new Date(), 1);

    const connectedAccount = await db.connectedStripeAccount.upsert({
      where: { workspaceId: workspace.id },
      update: {
        stripeAccountId,
        accessTokenEnc: encryptText(accessToken),
        refreshTokenEnc: refreshToken ? encryptText(refreshToken) : null,
        tokenExpiresAt,
        scopes: scope.split(" "),
        livemode,
        disconnectedAt: null,
        connectedAt: new Date(),
      },
      create: {
        workspaceId: workspace.id,
        stripeAccountId,
        accessTokenEnc: encryptText(accessToken),
        refreshTokenEnc: refreshToken ? encryptText(refreshToken) : null,
        tokenExpiresAt,
        scopes: scope.split(" "),
        livemode,
      },
    });

    await db.stripeOAuthState.delete({
      where: { state: oauthState.state },
    });

    const payload = {
      connectedAccount: {
        id: connectedAccount.id,
        workspaceId: connectedAccount.workspaceId,
        stripeAccountId: connectedAccount.stripeAccountId,
        livemode: connectedAccount.livemode,
        scopes: connectedAccount.scopes,
        connectedAt: connectedAccount.connectedAt.toISOString(),
        disconnectedAt: connectedAccount.disconnectedAt?.toISOString() ?? null,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        ownerUserId: workspace.ownerUserId,
        timezone: workspace.timezone,
        billingPlan: workspace.billingPlan,
        isActive: workspace.isActive,
        createdAt: new Date(workspace.createdAt).toISOString(),
        updatedAt: new Date(workspace.updatedAt).toISOString(),
      },
    };

    reportAnalyticsEvent({
      event: "stripe_connect_completed",
      distinctId: workspace.id,
      properties: {
        workspaceId: workspace.id,
        stripeAccountId: connectedAccount.stripeAccountId,
        livemode: connectedAccount.livemode,
      },
    });

    if (wantsJson) {
      return ok(payload);
    }

    return Response.redirect(
      `${env.APP_BASE_URL}/app/settings?connected=1&workspaceId=${workspace.id}`,
      302,
    );
  } catch (error) {
    return routeError(error, "/api/stripe/connect/callback");
  }
}
