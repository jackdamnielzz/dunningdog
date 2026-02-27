import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { createSupabaseClient } from "@/lib/supabase";

const schema = z.object({
  accessToken: z.string().min(20),
  refreshToken: z.string().min(20).optional(),
  expiresIn: z.coerce.number().int().min(60).max(2_592_000).optional(),
  next: z.string().optional(),
  state: z.string().min(8),
});

const OAUTH_STATE_COOKIE = "sb-oauth-state";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

function buildSessionCookieValue(accessToken: string, refreshToken?: string) {
  const tokenPayload = JSON.stringify({
    access_token: accessToken,
    ...(refreshToken ? { refresh_token: refreshToken } : {}),
  });
  const base64 = Buffer.from(tokenPayload, "utf8").toString("base64");
  return `base64-${base64}`;
}

function normalizeNextPath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }
  return path;
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
    const oauthStateCookie = readCookieValue(request.headers.get("cookie"), OAUTH_STATE_COOKIE);
    if (!oauthStateCookie || oauthStateCookie !== input.state) {
      throw new ProblemError({
        title: "OAuth state validation failed",
        status: 401,
        code: "AUTH_OAUTH_INVALID_STATE",
        detail: "The OAuth sign-in state is invalid or expired. Please sign in again.",
      });
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

    const userResult = await supabase.auth.getUser(input.accessToken);
    if (userResult.error || !userResult.data.user) {
      throw new ProblemError({
        title: "OAuth session is invalid",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail: userResult.error?.message ?? "OAuth token is invalid or expired.",
      });
    }

    const nextPath = normalizeNextPath(input.next);
    const response = ok({
      authenticated: true,
      next: nextPath,
      userId: userResult.data.user.id,
    });

    response.cookies.set("sb-auth-token", buildSessionCookieValue(input.accessToken, input.refreshToken), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: input.expiresIn ?? 3600,
    });

    if (input.refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, input.refreshToken, {
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

    return response;
  } catch (error) {
    return routeError(error, "/api/auth/session");
  }
}
