import Stripe from "stripe";
import { ok, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { SUPPORTED_BILLING_WEBHOOK_EVENTS } from "@/lib/constants";
import { handleBillingWebhookEvent } from "@/lib/services/billing";
import { assertWebhookRequestHeaders, constructStripeEvent } from "@/lib/webhooks";

export async function POST(request: Request) {
  const instance = "/api/webhooks/stripe-billing";
  try {
    assertWebhookRequestHeaders(request);
    const body = await request.text();
    const event = await constructStripeEvent(request, body, env.STRIPE_BILLING_WEBHOOK_SECRET, "Stripe billing");

    if (!SUPPORTED_BILLING_WEBHOOK_EVENTS.has(event.type)) {
      return ok({ received: true, eventId: event.id, handled: false });
    }

    await handleBillingWebhookEvent(event);

    return ok({ received: true, eventId: event.id, handled: true });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return routeError(
        new ProblemError({
          title: "Invalid webhook signature",
          status: 401,
          code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
          detail: "Stripe signature verification failed.",
        }),
        instance,
      );
    }
    return routeError(error, instance);
  }
}
