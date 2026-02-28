import Stripe from "stripe";
import { ok, routeError } from "@/lib/api";
import { env, isProduction } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { getStripeClient } from "@/lib/stripe/client";
import { SUPPORTED_BILLING_WEBHOOK_EVENTS } from "@/lib/constants";
import { handleBillingWebhookEvent } from "@/lib/services/billing";

const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

function assertWebhookRequestHeaders(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ProblemError({
      title: "Invalid webhook content type",
      status: 415,
      code: "VALIDATION_REQUEST_BODY_INVALID",
      detail: "Stripe webhook payload must be application/json.",
    });
  }

  const contentLengthRaw = request.headers.get("content-length");
  if (!contentLengthRaw) return;
  const contentLength = Number(contentLengthRaw);
  if (!Number.isFinite(contentLength)) return;

  if (contentLength > MAX_WEBHOOK_BODY_BYTES) {
    throw new ProblemError({
      title: "Webhook payload too large",
      status: 413,
      code: "RATE_LIMIT_REQUEST_TOO_LARGE",
      detail: `Webhook payload exceeds ${MAX_WEBHOOK_BODY_BYTES} bytes.`,
    });
  }
}

async function constructEvent(request: Request, body: string) {
  const signature = request.headers.get("stripe-signature");
  if (!env.STRIPE_BILLING_WEBHOOK_SECRET) {
    if (isProduction) {
      throw new ProblemError({
        title: "Stripe billing webhook secret missing",
        status: 500,
        code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
        detail: "STRIPE_BILLING_WEBHOOK_SECRET must be configured in production.",
      });
    }
    return JSON.parse(body) as Stripe.Event;
  }
  if (!signature) {
    throw new ProblemError({
      title: "Invalid webhook signature",
      status: 401,
      code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
      detail: "Missing Stripe signature header.",
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new ProblemError({
      title: "Stripe is not configured",
      status: 500,
      code: "STRIPE_ACCOUNT_NOT_CONNECTED",
      detail: "Stripe billing webhook secret is set but Stripe API key is missing.",
    });
  }

  return stripe.webhooks.constructEvent(body, signature, env.STRIPE_BILLING_WEBHOOK_SECRET);
}

export async function POST(request: Request) {
  const instance = "/api/webhooks/stripe-billing";
  try {
    assertWebhookRequestHeaders(request);
    const body = await request.text();
    const event = await constructEvent(request, body);

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
