import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ProblemError, problemResponse } from "@/lib/problem";

type SupportedProvider = "google" | "microsoft";

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

    const authorizeUrl = new URL(`${env.SUPABASE_URL}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", mapToSupabaseProvider(provider));
    authorizeUrl.searchParams.set("redirect_to", callbackUrl);

    return NextResponse.redirect(authorizeUrl, { status: 302 });
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

