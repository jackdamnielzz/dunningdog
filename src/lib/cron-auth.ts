import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function readProvidedSecret(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.headers.get("x-cron-secret");
}

export function assertCronAuthorized(request: Request) {
  const expectedSecret = env.CRON_SECRET;

  if (!expectedSecret) {
    if (env.NODE_ENV === "production") {
      throw new ProblemError({
        title: "Cron authorization misconfigured",
        status: 500,
        code: "AUTH_UNAUTHORIZED",
        detail: "CRON_SECRET must be configured in production.",
      });
    }
    return;
  }

  const providedSecret = readProvidedSecret(request);
  if (!providedSecret || !safeCompare(providedSecret, expectedSecret)) {
    throw new ProblemError({
      title: "Unauthorized cron request",
      status: 401,
      code: "AUTH_UNAUTHORIZED",
      detail: "Missing or invalid cron secret.",
    });
  }
}
