import { addHours } from "date-fns";
import { z } from "zod";
import { ProblemError } from "@/lib/problem";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";

const schema = z.object({
  recoveryToken: z.string().min(3),
});

function parseRecoveryToken(token: string) {
  if (token.startsWith("attempt:")) {
    return token.replace("attempt:", "");
  }
  return token;
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
      const session = await stripe.billingPortal.sessions.create({
        customer: attempt.stripeCustomerId,
        return_url: `${env.APP_BASE_URL}/app/recoveries?updated=true`,
      });
      sessionUrl = session.url;
    }

    return ok({
      sessionUrl,
      expiresAt: addHours(new Date(), 1).toISOString(),
    });
  } catch (error) {
    return routeError(error, "/api/customer/update-payment-session");
  }
}
