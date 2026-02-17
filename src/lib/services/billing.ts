import type { BillingPlan } from "@prisma/client";
import { db } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { ProblemError } from "@/lib/problem";
import { reportAnalyticsEvent } from "@/lib/observability";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoWorkspace } from "@/lib/demo-data";
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
  try {
    return await db.workspace.update({
      where: { id: workspaceId },
      data: { billingPlan: plan },
    });
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    log("warn", "Using demo workspace for billing plan update due to database issue", {
      workspaceId,
      plan,
      reason: describeFailure(error),
    });

    return {
      ...getDemoWorkspace(workspaceId),
      billingPlan: plan,
    };
  }
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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: params.workspaceId,
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
