import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

/**
 * Handles Supabase email confirmation links (password reset, email verification).
 *
 * Supabase sends links like:
 *   /auth/confirm?token_hash=...&type=recovery&redirect_to=/reset-password
 *
 * This route exchanges the token_hash via the Supabase verify endpoint,
 * then redirects to the target page with the access token in the hash.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const redirectTo = searchParams.get("redirect_to") ?? searchParams.get("next");
  const baseUrl = env.APP_BASE_URL ?? "https://dunningdog.com";

  if (!tokenHash || !type) {
    log("warn", "Auth confirm called without token_hash or type", {
      hasTokenHash: Boolean(tokenHash),
      hasType: Boolean(type),
    });
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    log("error", "Auth confirm: Supabase not configured");
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  try {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      log("warn", "Auth confirm: Supabase verify failed", {
        status: response.status,
        body: body.slice(0, 200),
      });
      return NextResponse.redirect(`${baseUrl}/forgot-password`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!payload.access_token) {
      log("warn", "Auth confirm: No access_token in verify response");
      return NextResponse.redirect(`${baseUrl}/forgot-password`);
    }

    // For recovery type, redirect to reset-password with the access token
    if (type === "recovery") {
      const target = redirectTo ?? "/reset-password";
      const hash = new URLSearchParams({
        access_token: payload.access_token,
        ...(payload.refresh_token ? { refresh_token: payload.refresh_token } : {}),
        type: "recovery",
      }).toString();
      return NextResponse.redirect(`${baseUrl}${target}#${hash}`);
    }

    // For other types (signup, email_change), redirect to login or app
    return NextResponse.redirect(`${baseUrl}/login`);
  } catch (error) {
    log("error", "Auth confirm: unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(`${baseUrl}/login`);
  }
}
