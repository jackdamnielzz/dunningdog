import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";

const schema = z.object({
  accessToken: z.string().min(20),
  password: z.string().min(8),
});

type SupabaseResetResponse = {
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
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        password: input.password,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as SupabaseResetResponse;
      throw new ProblemError({
        title: "Reset link is invalid or expired",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail:
          payload.error_description ??
          payload.msg ??
          "Request a new password reset link and try again.",
      });
    }

    const res = ok({
      updated: true,
      next: "/app",
    });

    res.cookies.set("sb-auth-token", buildSessionCookieValue(input.accessToken), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 3600,
    });

    return res;
  } catch (error) {
    return routeError(error, "/api/auth/reset-password");
  }
}

