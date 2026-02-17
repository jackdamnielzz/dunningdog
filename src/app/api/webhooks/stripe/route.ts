import Stripe from "stripe";
import { ok, routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { ProblemError } from "@/lib/problem";
import { getStripeClient } from "@/lib/stripe/client";
import { SUPPORTED_STRIPE_WEBHOOK_EVENTS } from "@/lib/constants";
import {
  persistStripeEvent,
  processStripeWebhookEvent,
} from "@/lib/services/recovery";
import { inngest } from "@/lib/inngest/client";

async function constructEvent(request: Request, body: string) {
  const signature = request.headers.get("stripe-signature");
  if (!env.STRIPE_WEBHOOK_SECRET) {
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
      detail: "Stripe webhook secret is set but Stripe API key is missing.",
    });
  }

  return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
}

export async function POST(request: Request) {
  const instance = "/api/webhooks/stripe";
  try {
    const body = await request.text();
    const event = await constructEvent(request, body);

    if (!SUPPORTED_STRIPE_WEBHOOK_EVENTS.has(event.type)) {
      return ok({ received: true, eventId: event.id, duplicate: false });
    }

    const stripeAccountId = event.account;
    if (!stripeAccountId) {
      throw new ProblemError({
        title: "Stripe account not connected",
        status: 404,
        code: "STRIPE_ACCOUNT_NOT_CONNECTED",
        detail: "Webhook event did not include account context.",
      });
    }

    const connectedAccount = await db.connectedStripeAccount.findUnique({
      where: { stripeAccountId },
    });
    if (!connectedAccount) {
      throw new ProblemError({
        title: "Stripe account not connected",
        status: 404,
        code: "STRIPE_ACCOUNT_NOT_CONNECTED",
        detail: `No workspace is connected to Stripe account ${stripeAccountId}.`,
      });
    }

    const { duplicate } = await persistStripeEvent({
      workspaceId: connectedAccount.workspaceId,
      eventId: event.id,
      eventType: event.type,
      payload: event as unknown as object,
    });

    if (duplicate) {
      return ok({
        received: true,
        eventId: event.id,
        duplicate: true,
      });
    }

    const result = await processStripeWebhookEvent({
      workspaceId: connectedAccount.workspaceId,
      event,
    });

    if (result.action === "recovery_started" && result.recoveryAttemptId) {
      await inngest.send({
        name: "recovery/started",
        data: {
          workspaceId: connectedAccount.workspaceId,
          recoveryAttemptId: result.recoveryAttemptId,
          stripeInvoiceId: (event.data.object as Stripe.Invoice).id,
        },
      });
    }

    if (result.action === "recovery_succeeded") {
      await inngest.send({
        name: "recovery/succeeded",
        data: {
          workspaceId: connectedAccount.workspaceId,
          stripeInvoiceId: (event.data.object as Stripe.Invoice).id,
        },
      });
    }

    return ok({ received: true, eventId: event.id, duplicate: false });
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
