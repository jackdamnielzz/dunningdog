import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { env } from "@/lib/env";
import { ProblemError, problemResponse } from "@/lib/problem";
import { normalizeNextPath } from "@/lib/safe-redirect";

type SupportedProvider = "google" | "microsoft";
const OAUTH_STATE_COOKIE = "sb-oauth-state";
const PKCE_VERIFIER_COOKIE = "sb-pkce-verifier";
const OAUTH_STATE_TTL_SECONDS = 10 * 60;

function createOAuthState() {
  return randomBytes(24).toString("hex");
}

function createPkceVerifier() {
  return randomBytes(32).toString("base64url");
}

function computeCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
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
    const state = createOAuthState();
    const callbackUrl = new URL(`${env.APP_BASE_URL}/auth/callback`);
    callbackUrl.searchParams.set("next", nextPath);
    callbackUrl.searchParams.set("app_state", state);

    const codeVerifier = createPkceVerifier();
    const codeChallenge = computeCodeChallenge(codeVerifier);

    const authorizeUrl = new URL(`${env.SUPABASE_URL}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", mapToSupabaseProvider(provider));
    authorizeUrl.searchParams.set("redirect_to", callbackUrl.toString());
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizeUrl, { status: 302 });
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: OAUTH_STATE_TTL_SECONDS,
    });
    response.cookies.set(PKCE_VERIFIER_COOKIE, codeVerifier, {
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
