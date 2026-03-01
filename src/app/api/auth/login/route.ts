import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { normalizeNextPath } from "@/lib/safe-redirect";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

type SupabaseLoginResponse = {
  access_token?: string;
  expires_in?: number;
  error_description?: string;
  msg?: string;
};

function buildSessionCookieValue(accessToken: string) {
  const tokenPayload = JSON.stringify({ access_token: accessToken });
  const base64 = Buffer.from(tokenPayload, "utf8").toString("base64");
  return `base64-${base64}`;
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
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as SupabaseLoginResponse;
    if (!response.ok || !payload.access_token) {
      throw new ProblemError({
        title: "Authentication failed",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail:
          payload.error_description ??
          payload.msg ??
          "Email or password is invalid.",
      });
    }

    const res = ok({
      authenticated: true,
      next: normalizeNextPath(input.next),
    });

    res.cookies.set("sb-auth-token", buildSessionCookieValue(payload.access_token), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: Math.max(payload.expires_in ?? 3600, 60),
    });

    return res;
  } catch (error) {
    return routeError(error, "/api/auth/login");
  }
}

