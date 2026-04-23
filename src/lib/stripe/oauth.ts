import { env } from "@/lib/env";

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  stripe_user_id?: string;
  scope?: string;
  livemode?: boolean;
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
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
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
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
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
