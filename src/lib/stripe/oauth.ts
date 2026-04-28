import { env } from "@/lib/env";

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  stripe_user_id?: string;
  scope?: string;
  livemode?: boolean;
}

/**
 * The Stripe Apps OAuth /v1/oauth/token endpoint must be authenticated with
 * the **app publisher** account's secret key (the account that owns the
 * Stripe App), not the main DunningDog SaaS account's key. They are different
 * accounts with different secret keys. Falls back to STRIPE_SECRET_KEY for
 * environments where the publisher key isn't set yet.
 */
function getAppPublisherKey(): string | undefined {
  return env.STRIPE_APP_PUBLISHER_SECRET_KEY ?? env.STRIPE_SECRET_KEY;
}

/**
 * Exchange an authorization code for access + refresh tokens
 * using Stripe Apps OAuth 2.0 (direct HTTP POST, not legacy Connect SDK).
 */
export async function exchangeOAuthCode(
  code: string,
): Promise<OAuthTokenResponse> {
  const response = await fetch("https://api.stripe.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAppPublisherKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Stripe OAuth token exchange failed: ${error.error_description || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Refresh an expired access token using Stripe Apps OAuth 2.0.
 */
export async function refreshOAuthToken(
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  const response = await fetch("https://api.stripe.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAppPublisherKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Stripe OAuth token refresh failed: ${error.error_description || response.statusText}`,
    );
  }

  return response.json();
}
