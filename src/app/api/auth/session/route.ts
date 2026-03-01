import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { ProblemError } from "@/lib/problem";
import { createSupabaseClient } from "@/lib/supabase";
import { normalizeNextPath } from "@/lib/safe-redirect";

const implicitSchema = z.object({
  accessToken: z.string().min(20),
  refreshToken: z.string().min(1).optional(),
  expiresIn: z.coerce.number().int().min(60).max(2_592_000).optional(),
  next: z.string().optional(),
  state: z.string().min(8),
  code: z.undefined().optional(),
});

const pkceSchema = z.object({
  code: z.string().min(1),
  next: z.string().optional(),
  state: z.string().min(8),
  accessToken: z.undefined().optional(),
});

const schema = z.union([pkceSchema, implicitSchema]);

const OAUTH_STATE_COOKIE = "sb-oauth-state";
const PKCE_VERIFIER_COOKIE = "sb-pkce-verifier";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

function buildSessionCookieValue(accessToken: string, refreshToken?: string) {
  const tokenPayload = JSON.stringify({
    access_token: accessToken,
    ...(refreshToken ? { refresh_token: refreshToken } : {}),
  });
  const base64 = Buffer.from(tokenPayload, "utf8").toString("base64");
  return `base64-${base64}`;
}

function readCookieValue(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  for (const segment of cookieHeader.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }

    const splitIndex = trimmed.indexOf("=");
    if (splitIndex <= 0) {
      continue;
    }

    const name = trimmed.slice(0, splitIndex).trim();
    if (name !== cookieName) {
      continue;
    }

    const value = trimmed.slice(splitIndex + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

interface TokenExchangeResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

async function exchangePkceCode(code: string, codeVerifier: string): Promise<TokenExchangeResult> {
  const tokenUrl = `${env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: env.SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    log("error", "PKCE code exchange failed", {
      status: response.status,
      body: body.slice(0, 200),
    });
    throw new ProblemError({
      title: "OAuth code exchange failed",
      status: 401,
      code: "AUTH_PKCE_EXCHANGE_FAILED",
      detail: "Could not exchange the authorization code for a session. Please sign in again.",
    });
  }

  const payload = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new ProblemError({
      title: "OAuth code exchange failed",
      status: 401,
      code: "AUTH_PKCE_EXCHANGE_FAILED",
      detail: "Supabase did not return an access token.",
    });
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
  };
}

export async function POST(request: Request) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new ProblemError({
        title: "Authentication is not configured",
        status: 503,
        code: "AUTH_PROVIDER_MISCONFIGURED",
        detail: "Supabase auth environment values are missing.",
      });
    }

    const input = await parseJsonBody(request, schema);
    const cookieHeader = request.headers.get("cookie");
    const oauthStateCookie = readCookieValue(cookieHeader, OAUTH_STATE_COOKIE);
    log("info", "OAuth session exchange started", {
      next: input.next,
      flow: input.code ? "pkce" : "implicit",
      hasStateCookie: Boolean(oauthStateCookie),
      stateMatches: Boolean(oauthStateCookie && oauthStateCookie === input.state),
    });
    if (!oauthStateCookie || oauthStateCookie !== input.state) {
      log("warn", "OAuth state validation failed", {
        hasStateCookie: Boolean(oauthStateCookie),
      });
      throw new ProblemError({
        title: "OAuth state validation failed",
        status: 401,
        code: "AUTH_OAUTH_INVALID_STATE",
        detail: "The OAuth sign-in state is invalid or expired. Please sign in again.",
      });
    }

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresIn: number | undefined;

    if (input.code) {
      // PKCE flow: exchange code for tokens server-side
      const codeVerifier = readCookieValue(cookieHeader, PKCE_VERIFIER_COOKIE);
      if (!codeVerifier) {
        throw new ProblemError({
          title: "PKCE verifier missing",
          status: 401,
          code: "AUTH_PKCE_VERIFIER_MISSING",
          detail: "The PKCE code verifier cookie is missing or expired. Please sign in again.",
        });
      }

      const tokens = await exchangePkceCode(input.code, codeVerifier);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      expiresIn = tokens.expiresIn;
    } else {
      // Implicit flow (legacy fallback)
      const implicit = input as z.infer<typeof implicitSchema>;
      accessToken = implicit.accessToken;
      refreshToken = implicit.refreshToken;
      expiresIn = implicit.expiresIn;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new ProblemError({
        title: "Authentication is not configured",
        status: 503,
        code: "AUTH_PROVIDER_MISCONFIGURED",
        detail: "Supabase auth environment values are missing.",
      });
    }

    const userResult = await supabase.auth.getUser(accessToken);
    if (userResult.error || !userResult.data.user) {
      log("error", "Supabase auth.getUser failed", {
        err: userResult.error?.message ?? "No user returned",
        code: userResult.error?.code,
      });
      throw new ProblemError({
        title: "OAuth session is invalid",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail: userResult.error?.message ?? "OAuth token is invalid or expired.",
      });
    }

    const nextPath = normalizeNextPath(input.next);
    log("info", "OAuth session established", {
      userId: userResult.data.user.id,
      next: nextPath,
    });
    const response = ok({
      authenticated: true,
      next: nextPath,
      userId: userResult.data.user.id,
    });

    response.cookies.set("sb-auth-token", buildSessionCookieValue(accessToken, refreshToken), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: expiresIn ?? 3600,
    });

    if (refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: 2_592_000,
      });
    } else {
      response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: 0,
      });
    }

    response.cookies.set(OAUTH_STATE_COOKIE, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 0,
    });

    // Clear PKCE verifier cookie
    response.cookies.set(PKCE_VERIFIER_COOKIE, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return routeError(error, "/api/auth/session");
  }
}
