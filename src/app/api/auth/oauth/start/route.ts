import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { env } from "@/lib/env";
import { ProblemError, problemResponse } from "@/lib/problem";

type SupportedProvider = "google" | "microsoft";
const OAUTH_STATE_COOKIE = "sb-oauth-state";
const OAUTH_STATE_TTL_SECONDS = 10 * 60;

function createOAuthState() {
  return randomBytes(24).toString("hex");
}

function normalizeNextPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }
  return path;
}

function parseProvider(value: string | null): SupportedProvider {
  if (value === "google" || value === "microsoft") {
    return value;
  }

  throw new ProblemError({
    title: "Unsupported OAuth provider",
    status: 400,
    code: "AUTH_PROVIDER_UNSUPPORTED",
    detail: "Supported providers are google and microsoft.",
  });
}

function mapToSupabaseProvider(provider: SupportedProvider) {
  if (provider === "microsoft") {
    return "azure";
  }
  return provider;
}

export async function GET(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ProblemError({
        title: "Authentication is not configured",
        status: 503,
        code: "AUTH_PROVIDER_MISCONFIGURED",
        detail: "Supabase auth environment values are missing.",
      });
    }

    const url = new URL(request.url);
    const provider = parseProvider(url.searchParams.get("provider"));
    const nextPath = normalizeNextPath(url.searchParams.get("next"));
    const callbackUrl = `${env.APP_BASE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const state = createOAuthState();

    const authorizeUrl = new URL(`${env.SUPABASE_URL}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", mapToSupabaseProvider(provider));
    authorizeUrl.searchParams.set("redirect_to", callbackUrl);
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl, { status: 302 });
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: OAUTH_STATE_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    if (error instanceof ProblemError) {
      return problemResponse(error, "/api/auth/oauth/start");
    }
    return problemResponse(
      new ProblemError({
        title: "Unexpected internal error",
        status: 500,
        code: "INTERNAL_UNEXPECTED",
        detail: "Could not start OAuth sign-in.",
      }),
      "/api/auth/oauth/start",
    );
  }
}
