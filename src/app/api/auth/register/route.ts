import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

type SupabaseTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error_description?: string;
  msg?: string;
};

type SupabaseAdminUserResponse = {
  id?: string;
  msg?: string;
  error_description?: string;
};

type SupabaseSignupResponse = SupabaseTokenResponse & {
  user?: { id?: string };
};

function buildSessionCookieValue(accessToken: string) {
  const tokenPayload = JSON.stringify({ access_token: accessToken });
  const base64 = Buffer.from(tokenPayload, "utf8").toString("base64");
  return `base64-${base64}`;
}

function normalizeNextPath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }
  return path;
}

function isAlreadyRegisteredMessage(message: string | undefined) {
  if (!message) {
    return false;
  }
  return message.toLowerCase().includes("already registered");
}

async function grantPasswordToken(email: string, password: string) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json().catch(() => ({}))) as SupabaseTokenResponse;
  return { response, payload };
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
    const nextPath = normalizeNextPath(input.next);

    let accessToken: string | null = null;
    let expiresIn = 3600;
    let requiresEmailConfirmation = false;

    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      const createResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          email_confirm: true,
        }),
      });

      const createPayload = (await createResponse.json().catch(() => ({}))) as SupabaseAdminUserResponse;
      const adminErrorMessage = createPayload.error_description ?? createPayload.msg;

      if (!createResponse.ok) {
        if (isAlreadyRegisteredMessage(adminErrorMessage)) {
          throw new ProblemError({
            title: "Account already exists",
            status: 409,
            code: "AUTH_CONFLICT",
            detail: "An account with this email already exists. Please sign in.",
          });
        }

        throw new ProblemError({
          title: "Registration failed",
          status: 502,
          code: "AUTH_PROVIDER_ERROR",
          detail: adminErrorMessage ?? "Supabase user provisioning failed.",
        });
      }

      const token = await grantPasswordToken(input.email, input.password);
      if (!token.response.ok || !token.payload.access_token) {
        throw new ProblemError({
          title: "Registration failed",
          status: 502,
          code: "AUTH_PROVIDER_ERROR",
          detail:
            token.payload.error_description ??
            token.payload.msg ??
            "Account was created but sign-in token could not be issued.",
        });
      }

      accessToken = token.payload.access_token;
      expiresIn = Math.max(token.payload.expires_in ?? 3600, 60);
    } else {
      const signupResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
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

      const signupPayload = (await signupResponse.json().catch(() => ({}))) as SupabaseSignupResponse;
      const signupError = signupPayload.error_description ?? signupPayload.msg;
      if (!signupResponse.ok) {
        if (isAlreadyRegisteredMessage(signupError)) {
          throw new ProblemError({
            title: "Account already exists",
            status: 409,
            code: "AUTH_CONFLICT",
            detail: "An account with this email already exists. Please sign in.",
          });
        }

        throw new ProblemError({
          title: "Registration failed",
          status: 502,
          code: "AUTH_PROVIDER_ERROR",
          detail: signupError ?? "Supabase signup failed.",
        });
      }

      if (signupPayload.access_token) {
        accessToken = signupPayload.access_token;
        expiresIn = Math.max(signupPayload.expires_in ?? 3600, 60);
      } else {
        requiresEmailConfirmation = true;
      }
    }

    const response = ok({
      created: true,
      authenticated: Boolean(accessToken),
      requiresEmailConfirmation,
      next: nextPath,
    });

    if (accessToken) {
      response.cookies.set("sb-auth-token", buildSessionCookieValue(accessToken), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: expiresIn,
      });
    }

    return response;
  } catch (error) {
    return routeError(error, "/api/auth/register");
  }
}

