import { z } from "zod";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { ProblemError } from "@/lib/problem";
import { validatePaymentUpdateToken, markTokenUsed } from "@/lib/services/payment-tokens";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { log } from "@/lib/logger";

const schema = z.object({
  token: z.string().min(10),
});

const instance = "/api/customer/setup-intent";

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, schema);
    const tokenData = await validatePaymentUpdateToken(input.token);

    if (!tokenData) {
      throw new ProblemError({
        title: "Token invalid or expired",
        status: 404,
        code: "DUNNING_RECOVERY_ATTEMPT_NOT_FOUND",
        detail: "This payment update link has expired or has already been used.",
      });
    }

    const attempt = await db.recoveryAttempt.findUnique({
      where: { id: tokenData.recoveryAttemptId },
      select: { stripeCustomerId: true, id: true },
    });

    if (!attempt) {
      throw new ProblemError({
        title: "Recovery attempt not found",
        status: 404,
        code: "DUNNING_RECOVERY_ATTEMPT_NOT_FOUND",
        detail: "The associated recovery attempt could not be found.",
      });
    }

    const stripe = getStripeClient();
    let portalUrl = `${env.APP_BASE_URL}/update-payment/${input.token}?status=success`;

    if (stripe && attempt.stripeCustomerId.startsWith("cus_")) {
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: attempt.stripeCustomerId,
          return_url: `${env.APP_BASE_URL}/update-payment/${input.token}?status=success`,
        });
        portalUrl = session.url;
      } catch (error) {
        log("warn", "Failed to create billing portal session for payment update", {
          recoveryAttemptId: attempt.id,
          stripeCustomerId: attempt.stripeCustomerId,
          error,
        });
      }
    }

    await markTokenUsed(input.token);

    return ok({ portalUrl });
  } catch (error) {
    return routeError(error, instance);
  }
}
