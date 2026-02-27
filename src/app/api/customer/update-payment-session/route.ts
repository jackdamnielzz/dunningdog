import { addHours } from "date-fns";
import { z } from "zod";
import { ProblemError } from "@/lib/problem";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { log } from "@/lib/logger";

const schema = z.object({
  recoveryToken: z.string().min(3),
});

function parseRecoveryToken(token: string) {
  if (token.startsWith("attempt:")) {
    return token.replace("attempt:", "");
  }
  return token;
}

function isMissingCustomerError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const stripeError = error as {
    code?: unknown;
    message?: unknown;
  };
  const code = typeof stripeError.code === "string" ? stripeError.code.toLowerCase() : "";
  const message = typeof stripeError.message === "string" ? stripeError.message.toLowerCase() : "";
  return (
    code === "resource_missing" ||
    code === "no_such_customer" ||
    message.includes("no such customer")
  );
}

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, schema);
    const attemptId = parseRecoveryToken(input.recoveryToken);

    const attempt = await db.recoveryAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new ProblemError({
        title: "Recovery attempt not found",
        status: 404,
        code: "DUNNING_RECOVERY_ATTEMPT_NOT_FOUND",
        detail: "The provided recovery token is invalid or expired.",
      });
    }

    const stripe = getStripeClient();
    let sessionUrl = `${env.APP_BASE_URL}/app/recoveries?updated=true&attemptId=${attempt.id}`;

    if (stripe && attempt.stripeCustomerId.startsWith("cus_")) {
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: attempt.stripeCustomerId,
          return_url: `${env.APP_BASE_URL}/app/recoveries?updated=true`,
        });
        sessionUrl = session.url;
      } catch (error) {
        if (!isMissingCustomerError(error)) {
          throw error;
        }

        log("warn", "Falling back to in-app payment update URL because Stripe customer was not found", {
          recoveryAttemptId: attempt.id,
          stripeCustomerId: attempt.stripeCustomerId,
        });
      }
    }

    return ok({
      sessionUrl,
      expiresAt: addHours(new Date(), 1).toISOString(),
    });
  } catch (error) {
    return routeError(error, "/api/customer/update-payment-session");
  }
}
