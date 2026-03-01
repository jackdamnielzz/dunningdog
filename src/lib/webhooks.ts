import Stripe from "stripe";
import { env, isProduction } from "@/lib/env";
import { ProblemError } from "@/lib/problem";
import { getStripeClient } from "@/lib/stripe/client";

export const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

export function assertWebhookRequestHeaders(request: Request) {
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

export async function constructStripeEvent(
  request: Request,
  body: string,
  webhookSecret: string | undefined,
  label: string,
) {
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret) {
    if (isProduction) {
      throw new ProblemError({
        title: `${label} webhook secret missing`,
        status: 500,
        code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
        detail: `${label} webhook secret must be configured in production.`,
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
      detail: `${label} webhook secret is set but Stripe API key is missing.`,
    });
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
