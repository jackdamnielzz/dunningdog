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

  const createSession = vi.fn().mockResolvedValue({
    id: "cs_123",
    url: "https://checkout.stripe.test/session",
  });

  const retrieveSession = vi.fn().mockResolvedValue({
    id: "cs_123",
    status: "complete",
    payment_status: "paid",
    metadata: {
      workspaceId: "ws_1",
      billingPlan: "growth",
    },
    client_reference_id: "ws_1",
    line_items: {
      data: [],
    },
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
    createSession,
    retrieveSession,
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
      data: { billingPlan: "growth" },
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
      data: { billingPlan: "pro" },
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
});
