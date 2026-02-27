import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { env } from "@/lib/env";

const schema = z.object({
  accessToken: z.string().min(20),
  next: z.string().optional(),
});

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

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, schema);
    const nextPath = normalizeNextPath(input.next);
    const response = ok({
      authenticated: true,
      next: nextPath,
    });

    response.cookies.set("sb-auth-token", buildSessionCookieValue(input.accessToken), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    return routeError(error, "/api/auth/session");
  }
}

