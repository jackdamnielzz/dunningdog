import { ProblemError } from "@/lib/problem";
import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encryptText } from "@/lib/crypto";
import { ensureWorkspaceExists } from "@/lib/auth";
import { requireStripeClient } from "@/lib/stripe/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const mode = searchParams.get("mode");

    if (!state) {
      throw new ProblemError({
        title: "Invalid OAuth state",
        status: 400,
        code: "AUTH_OAUTH_STATE_INVALID",
        detail: "Missing state value from Stripe callback.",
      });
    }

    const oauthState = await db.stripeOAuthState.findUnique({
      where: { state },
    });
    if (!oauthState || oauthState.expiresAt < new Date()) {
      throw new ProblemError({
        title: "Invalid OAuth state",
        status: 400,
        code: "AUTH_OAUTH_STATE_INVALID",
        detail: "State is invalid or expired.",
      });
    }

    const workspace = await ensureWorkspaceExists(oauthState.workspaceId);

    let stripeAccountId = `acct_demo_${workspace.id.slice(-8)}`;
    let accessToken = `demo_token_${workspace.id}`;
    let refreshToken = "";
    let scope = "read_write";
    let livemode = false;

    if (code && env.STRIPE_SECRET_KEY && env.STRIPE_CONNECT_CLIENT_SECRET) {
      const stripe = requireStripeClient();
      const tokenResponse = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });

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

    const connectedAccount = await db.connectedStripeAccount.upsert({
      where: { workspaceId: workspace.id },
      update: {
        stripeAccountId,
        accessTokenEnc: encryptText(accessToken),
        refreshTokenEnc: refreshToken ? encryptText(refreshToken) : null,
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
        scopes: scope.split(" "),
        livemode,
      },
    });

    await db.stripeOAuthState.delete({
      where: { state },
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

    if (mode === "browser") {
      return Response.redirect(
        `${env.APP_BASE_URL}/app/settings?connected=1&workspaceId=${workspace.id}`,
        302,
      );
    }

    return ok(payload);
  } catch (error) {
    return routeError(error, "/api/stripe/connect/callback");
  }
}
