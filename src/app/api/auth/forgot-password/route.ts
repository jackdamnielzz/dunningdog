import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { log } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
});

type SupabaseRecoverResponse = {
  error_description?: string;
  msg?: string;
};

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
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        redirect_to: `${env.APP_BASE_URL}/reset-password`,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as SupabaseRecoverResponse;
      log("warn", "Forgot password provider call failed", {
        status: response.status,
        reason: payload.error_description ?? payload.msg ?? "unknown",
      });
    }

    // Do not reveal whether an account exists for this email.
    return ok({
      sent: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    return routeError(error, "/api/auth/forgot-password");
  }
}

