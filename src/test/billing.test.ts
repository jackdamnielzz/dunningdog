import { beforeEach, describe, expect, it, vi } from "vitest";

type BillingMocksOptions = {
  demoMode?: boolean;
  stripeEnabled?: boolean;
};

async function loadBilling(options: BillingMocksOptions = {}) {
  vi.resetModules();

  const workspaceUpdate = vi.fn().mockImplementation(
    async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { billingPlan: "starter" | "pro" | "growth" };
    }) => ({
      id: where.id,
      billingPlan: data.billingPlan,
    }),
  );

  const workspaceFindUnique = vi.fn().mockResolvedValue(null);

  const workspaceUpdateMany = vi.fn().mockResolvedValue({ count: 1 });

  const createSession = vi.fn().mockResolvedValue({
    id: "cs_123",
    url: "https://checkout.stripe.test/session",
  });

  const retrieveSession = vi.fn().mockResolvedValue({
    id: "cs_123",
    status: "complete",
    payment_status: "paid",
    customer: "cus_test123",
    subscription: "sub_test123",
    metadata: {
      workspaceId: "ws_1",
      billingPlan: "growth",
    },
    client_reference_id: "ws_1",
    line_items: {
      data: [],
    },
  });

  const createPortalSession = vi.fn().mockResolvedValue({
    url: "https://billing.stripe.test/portal",
  });

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
      STRIPE_PRICE_STARTER_ID: "price_starter",
      STRIPE_PRICE_PRO_ID: "price_pro",
      STRIPE_PRICE_GROWTH_ID: "price_growth",
      SENTRY_DSN: undefined,
      POSTHOG_KEY: undefined,
      POSTHOG_HOST: "https://eu.i.posthog.com",
      NODE_ENV: "test",
    },
    isDemoMode: options.demoMode ?? false,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      workspace: {
        update: workspaceUpdate,
        findUnique: workspaceFindUnique,
        updateMany: workspaceUpdateMany,
      },
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () =>
      options.stripeEnabled
        ? {
            checkout: {
              sessions: {
                create: createSession,
                retrieve: retrieveSession,
              },
            },
            billingPortal: {
              sessions: {
                create: createPortalSession,
              },
            },
          }
        : null,
  }));

  const analyticsMock = vi.fn();
  vi.doMock("@/lib/observability", () => ({
    reportAnalyticsEvent: analyticsMock,
  }));

  const billing = await import("@/lib/services/billing");

  return {
    billing,
    workspaceUpdate,
    workspaceFindUnique,
    workspaceUpdateMany,
    createSession,
    retrieveSession,
    createPortalSession,
    analyticsMock,
  };
}

describe("billing service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses demo flow and updates plan when Stripe is unavailable", async () => {
    const { billing, workspaceUpdate } = await loadBilling({
      stripeEnabled: false,
    });

    const result = await billing.createBillingCheckoutSession({
      workspaceId: "ws_1",
      plan: "pro",
    });

    expect(result.mode).toBe("demo");
    expect(result.checkoutUrl).toContain("billing=demo");
    expect(workspaceUpdate).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: { billingPlan: "pro" },
    });
  });

  it("creates a Stripe checkout session when Stripe billing is configured", async () => {
    const { billing, createSession, workspaceUpdate } = await loadBilling({
      stripeEnabled: true,
    });

    const result = await billing.createBillingCheckoutSession({
      workspaceId: "ws_1",
      plan: "growth",
    });

    expect(result.mode).toBe("stripe");
    expect(result.checkoutUrl).toBe("https://checkout.stripe.test/session");
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(workspaceUpdate).not.toHaveBeenCalled();
  });

  it("throws when Stripe does not return a checkout URL", async () => {
    const { billing, createSession } = await loadBilling({
      stripeEnabled: true,
    });

    createSession.mockResolvedValueOnce({
      id: "cs_999",
      url: null,
    });

    await expect(
      billing.createBillingCheckoutSession({
        workspaceId: "ws_1",
        plan: "starter",
      }),
    ).rejects.toMatchObject({
      code: "STRIPE_CHECKOUT_SESSION_FAILED",
      status: 502,
    });
  });

  it("confirms a completed Stripe checkout and persists the plan", async () => {
    const { billing, workspaceUpdate, retrieveSession } = await loadBilling({
      stripeEnabled: true,
    });

    const updated = await billing.confirmBillingCheckoutSession("ws_1", "cs_123");

    expect(retrieveSession).toHaveBeenCalledWith("cs_123", {
      expand: ["line_items.data.price"],
    });
    expect(updated).toEqual({
      id: "ws_1",
      billingPlan: "growth",
    });
    expect(workspaceUpdate).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: {
        billingPlan: "growth",
        billingStatus: "active",
        trialEndsAt: null,
        stripeCustomerId: "cus_test123",
        billingSubscriptionId: "sub_test123",
      },
    });
  });

  it("returns null when session is incomplete", async () => {
    const { billing, retrieveSession, workspaceUpdate } = await loadBilling({
      stripeEnabled: true,
    });

    retrieveSession.mockResolvedValueOnce({
      id: "cs_pending",
      status: "open",
      payment_status: "unpaid",
      metadata: {
        workspaceId: "ws_1",
        billingPlan: "starter",
      },
      client_reference_id: "ws_1",
      line_items: { data: [] },
    });

    const result = await billing.confirmBillingCheckoutSession("ws_1", "cs_pending");

    expect(result).toBeNull();
    expect(workspaceUpdate).not.toHaveBeenCalled();
  });

  it("rejects checkout confirmation when workspace mismatch is detected", async () => {
    const { billing, retrieveSession } = await loadBilling({
      stripeEnabled: true,
    });

    retrieveSession.mockResolvedValueOnce({
      id: "cs_unauthorized",
      status: "complete",
      payment_status: "paid",
      metadata: {
        workspaceId: "ws_other",
        billingPlan: "starter",
      },
      client_reference_id: "ws_other",
      line_items: { data: [] },
    });

    await expect(
      billing.confirmBillingCheckoutSession("ws_1", "cs_unauthorized"),
    ).rejects.toMatchObject({
      code: "AUTH_FORBIDDEN",
      status: 403,
    });
  });

  it("falls back to line item price id when metadata plan is missing", async () => {
    const { billing, retrieveSession, workspaceUpdate } = await loadBilling({
      stripeEnabled: true,
    });

    retrieveSession.mockResolvedValueOnce({
      id: "cs_price",
      status: "complete",
      payment_status: "paid",
      metadata: {
        workspaceId: "ws_1",
      },
      client_reference_id: "ws_1",
      line_items: {
        data: [
          {
            price: { id: "price_pro" },
          },
        ],
      },
    });

    const updated = await billing.confirmBillingCheckoutSession("ws_1", "cs_price");

    expect(updated).toEqual({
      id: "ws_1",
      billingPlan: "pro",
    });
    expect(workspaceUpdate).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: {
        billingPlan: "pro",
        billingStatus: "active",
        trialEndsAt: null,
      },
    });
  });

  it("returns null when price id does not map to a plan", async () => {
    const { billing, retrieveSession, workspaceUpdate } = await loadBilling({
      stripeEnabled: true,
    });

    retrieveSession.mockResolvedValueOnce({
      id: "cs_unknown",
      status: "complete",
      payment_status: "paid",
      metadata: {
        workspaceId: "ws_1",
      },
      client_reference_id: "ws_1",
      line_items: {
        data: [
          {
            price: { id: "price_unknown" },
          },
        ],
      },
    });

    const result = await billing.confirmBillingCheckoutSession("ws_1", "cs_unknown");

    expect(result).toBeNull();
    expect(workspaceUpdate).not.toHaveBeenCalled();
  });

  it("returns returnUrl for billing portal in demo mode", async () => {
    const { billing } = await loadBilling({ stripeEnabled: false });

    const result = await billing.createBillingPortalSession({
      workspaceId: "ws_1",
      returnUrl: "http://localhost:3000/app/settings",
    });

    expect(result.portalUrl).toBe("http://localhost:3000/app/settings");
  });

  it("creates a Stripe billing portal session when customer exists", async () => {
    const { billing, workspaceFindUnique, createPortalSession } = await loadBilling({
      stripeEnabled: true,
    });

    workspaceFindUnique.mockResolvedValueOnce({ stripeCustomerId: "cus_123" });

    const result = await billing.createBillingPortalSession({
      workspaceId: "ws_1",
      returnUrl: "http://localhost:3000/app/settings",
    });

    expect(result.portalUrl).toBe("https://billing.stripe.test/portal");
    expect(createPortalSession).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "http://localhost:3000/app/settings",
    });
  });

  it("throws when workspace has no Stripe customer for billing portal", async () => {
    const { billing, workspaceFindUnique } = await loadBilling({
      stripeEnabled: true,
    });

    workspaceFindUnique.mockResolvedValueOnce(null);

    await expect(
      billing.createBillingPortalSession({
        workspaceId: "ws_1",
        returnUrl: "http://localhost:3000/app/settings",
      }),
    ).rejects.toMatchObject({
      code: "BILLING_CUSTOMER_NOT_FOUND",
      status: 404,
    });
  });

  it("handles checkout.session.completed webhook event", async () => {
    const { billing, workspaceUpdate, analyticsMock } = await loadBilling({
      stripeEnabled: true,
    });

    await billing.handleBillingWebhookEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { workspaceId: "ws_1", billingPlan: "pro" },
          client_reference_id: "ws_1",
          customer: "cus_456",
          subscription: "sub_789",
        },
      },
    } as never);

    expect(workspaceUpdate).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: {
        stripeCustomerId: "cus_456",
        billingSubscriptionId: "sub_789",
        billingStatus: "active",
        billingPlan: "pro",
        trialEndsAt: null,
      },
    });
    expect(analyticsMock).toHaveBeenCalledWith(
      expect.objectContaining({ event: "billing_plan_updated" }),
    );
  });

  it("handles customer.subscription.updated webhook event", async () => {
    const { billing, workspaceUpdateMany } = await loadBilling({
      stripeEnabled: true,
    });

    await billing.handleBillingWebhookEvent({
      type: "customer.subscription.updated",
      data: {
        object: {
          customer: "cus_456",
          status: "past_due",
        },
      },
    } as never);

    expect(workspaceUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_456" },
      data: { billingStatus: "past_due" },
    });
  });

  it("handles customer.subscription.deleted webhook event", async () => {
    const { billing, workspaceUpdateMany } = await loadBilling({
      stripeEnabled: true,
    });

    await billing.handleBillingWebhookEvent({
      type: "customer.subscription.deleted",
      data: {
        object: {
          customer: "cus_456",
        },
      },
    } as never);

    expect(workspaceUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_456" },
      data: { billingStatus: "canceled", billingSubscriptionId: null },
    });
  });

  it("passes existing stripeCustomerId to Stripe checkout when available", async () => {
    const { billing, workspaceFindUnique, createSession } = await loadBilling({
      stripeEnabled: true,
    });

    workspaceFindUnique.mockResolvedValueOnce({ stripeCustomerId: "cus_existing" });

    await billing.createBillingCheckoutSession({
      workspaceId: "ws_1",
      plan: "pro",
    });

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
  });
});
