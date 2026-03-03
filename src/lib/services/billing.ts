import type Stripe from "stripe";
import type { BillingPlan } from "@prisma/client";
import { db } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { ProblemError } from "@/lib/problem";
import { reportAnalyticsEvent } from "@/lib/observability";

import { log } from "@/lib/logger";

const priceByPlan: Record<BillingPlan, string | undefined> = {
  starter: env.STRIPE_PRICE_STARTER_ID,
  pro: env.STRIPE_PRICE_PRO_ID,
  growth: env.STRIPE_PRICE_GROWTH_ID,
};

const planByPriceId = Object.entries(priceByPlan).reduce<
  Partial<Record<string, BillingPlan>>
>((acc, [plan, priceId]) => {
  if (priceId) {
    acc[priceId] = plan as BillingPlan;
  }
  return acc;
}, {});

export async function setWorkspaceBillingPlan(workspaceId: string, plan: BillingPlan) {
  return await db.workspace.update({
    where: { id: workspaceId },
    data: { billingPlan: plan },
  });
}

export async function createBillingCheckoutSession(params: {
  workspaceId: string;
  plan: BillingPlan;
}) {
  const stripe = getStripeClient();
  const priceId = priceByPlan[params.plan];

  if (!stripe || !priceId || isDemoMode) {
    await setWorkspaceBillingPlan(params.workspaceId, params.plan);
    reportAnalyticsEvent({
      event: "billing_plan_updated",
      distinctId: params.workspaceId,
      properties: {
        workspaceId: params.workspaceId,
        plan: params.plan,
        source: "demo",
      },
    });
    return {
      mode: "demo" as const,
      checkoutUrl: `${env.APP_BASE_URL}/app/settings?billing=demo&plan=${params.plan}`,
      sessionId: null,
    };
  }

  const workspace = await db.workspace.findUnique({
    where: { id: params.workspaceId },
    select: { stripeCustomerId: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: params.workspaceId,
    ...(workspace?.stripeCustomerId ? { customer: workspace.stripeCustomerId } : {}),
    success_url: `${env.APP_BASE_URL}/app/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_BASE_URL}/app/settings?billing=canceled`,
    metadata: {
      workspaceId: params.workspaceId,
      billingPlan: params.plan,
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new ProblemError({
      title: "Checkout session creation failed",
      status: 502,
      code: "STRIPE_CHECKOUT_SESSION_FAILED",
      detail: "Stripe did not provide a checkout URL.",
    });
  }

  return {
    mode: "stripe" as const,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

export async function confirmBillingCheckoutSession(
  workspaceId: string,
  sessionId: string,
) {
  const stripe = getStripeClient();
  if (!stripe || isDemoMode) {
    return null;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });

  if (!session) {
    return null;
  }

  const sessionWorkspaceId =
    session.metadata?.workspaceId ?? session.client_reference_id ?? undefined;

  if (sessionWorkspaceId && sessionWorkspaceId !== workspaceId) {
    throw new ProblemError({
      title: "Workspace access denied",
      status: 403,
      code: "AUTH_FORBIDDEN",
      detail: `Checkout session ${sessionId} does not belong to workspace ${workspaceId}.`,
    });
  }

  if (session.status !== "complete" && session.payment_status !== "paid") {
    return null;
  }

  const metadataPlan = session.metadata?.billingPlan;
  let plan: BillingPlan | undefined =
    metadataPlan === "starter" || metadataPlan === "pro" || metadataPlan === "growth"
      ? metadataPlan
      : undefined;

  if (!plan) {
    const firstPriceId = session.line_items?.data[0]?.price?.id;
    if (firstPriceId) {
      plan = planByPriceId[firstPriceId];
    }
  }

  if (!plan) {
    return null;
  }

  const updated = await setWorkspaceBillingPlan(workspaceId, plan);
  reportAnalyticsEvent({
    event: "billing_plan_updated",
    distinctId: workspaceId,
    properties: {
      workspaceId,
      plan,
      source: "stripe",
      sessionId,
    },
  });
  return updated;
}

export async function createBillingPortalSession(params: {
  workspaceId: string;
  returnUrl: string;
}) {
  const stripe = getStripeClient();
  if (!stripe || isDemoMode) {
    return { portalUrl: params.returnUrl };
  }

  const workspace = await db.workspace.findUnique({
    where: { id: params.workspaceId },
    select: { stripeCustomerId: true },
  });

  if (!workspace?.stripeCustomerId) {
    throw new ProblemError({
      title: "No billing account found",
      status: 404,
      code: "BILLING_CUSTOMER_NOT_FOUND",
      detail: "This workspace has no Stripe billing account. Complete a checkout first.",
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: params.returnUrl,
  });

  return { portalUrl: session.url };
}

function resolvePlanFromEvent(event: Stripe.Event): BillingPlan | undefined {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadataPlan = session.metadata?.billingPlan;
    if (metadataPlan === "starter" || metadataPlan === "pro" || metadataPlan === "growth") {
      return metadataPlan;
    }
  }
  return undefined;
}

export async function handleBillingWebhookEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspaceId ?? session.client_reference_id;
    if (!workspaceId || !session.customer) return;

    const plan = resolvePlanFromEvent(event);

    await db.workspace.update({
      where: { id: workspaceId },
      data: {
        stripeCustomerId: String(session.customer),
        billingSubscriptionId: session.subscription ? String(session.subscription) : undefined,
        billingStatus: "active",
        trialEndsAt: null,
        ...(plan ? { billingPlan: plan } : {}),
      },
    });

    log("info", "Billing checkout completed via webhook", { workspaceId, plan });
    reportAnalyticsEvent({
      event: "billing_plan_updated",
      distinctId: workspaceId,
      properties: { workspaceId, plan, source: "webhook" },
    });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = String(sub.customer);
    await db.workspace.updateMany({
      where: { stripeCustomerId: customerId },
      data: { billingStatus: sub.status },
    });
    log("info", "Billing subscription updated via webhook", { customerId, status: sub.status });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = String(sub.customer);
    await db.workspace.updateMany({
      where: { stripeCustomerId: customerId },
      data: { billingStatus: "canceled", billingSubscriptionId: null },
    });
    log("info", "Billing subscription deleted via webhook", { customerId });
  }
}
