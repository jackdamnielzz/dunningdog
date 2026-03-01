import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadPreDunning(isDemoMode: boolean) {
  vi.resetModules();

  const findManyMock = vi.fn();
  const upsertMock = vi.fn().mockResolvedValue({
    id: "ws_1_demo_predunning",
    workspaceId: "ws_1",
    reason: "card_expiring",
  });

  const connectedStripeAccountFindUnique = vi.fn();
  const stripeSubscriptionsList = vi.fn();
  const stripeCustomersRetrieve = vi.fn();
  const stripePaymentMethodsRetrieve = vi.fn();

  vi.doMock("@/lib/db", () => ({
    db: {
      connectedStripeAccount: {
        findUnique: connectedStripeAccountFindUnique,
      },
      subscriptionAtRisk: {
        findMany: findManyMock,
        upsert: upsertMock,
      },
    },
  }));

  vi.doMock("@/lib/env", () => ({
    isDemoMode,
    env: {
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://localhost/dunningdog",
      SMTP_FROM_EMAIL: "info@dunningdog.com",
      POSTHOG_HOST: "https://eu.i.posthog.com",
      ENCRYPTION_KEY: "development-only-encryption-key",
    },
  }));

  vi.doMock("@/lib/crypto", () => ({
    decryptText: (v: string) => v,
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const isDatabaseUnavailableErrorMock = vi.fn(() => false);
  const describeFailureMock = vi.fn(() => "db unavailable");

  vi.doMock("@/lib/runtime-fallback", () => ({
    isDatabaseUnavailableError: isDatabaseUnavailableErrorMock,
    describeFailure: describeFailureMock,
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => ({
      subscriptions: {
        list: stripeSubscriptionsList,
      },
      customers: {
        retrieve: stripeCustomersRetrieve,
      },
      paymentMethods: {
        retrieve: stripePaymentMethodsRetrieve,
      },
    }),
  }));

  const preDunning = await import("@/lib/services/pre-dunning");
  return {
    preDunning,
    findManyMock,
    upsertMock,
    connectedStripeAccountFindUnique,
    stripeSubscriptionsList,
    stripeCustomersRetrieve,
    stripePaymentMethodsRetrieve,
    isDatabaseUnavailableErrorMock,
    describeFailureMock,
  };
}

describe("pre-dunning service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only entries expiring within the threshold window", async () => {
    const { preDunning, findManyMock } = await loadPreDunning(false);
    findManyMock.mockResolvedValueOnce([
      {
        id: "risk_1",
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "risk_2",
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    const results = await preDunning.runPreDunningScan("ws_1");
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("risk_1");
  });

  it("creates a demo at-risk record when no candidates exist in demo mode", async () => {
    const { preDunning, findManyMock, upsertMock } = await loadPreDunning(true);
    findManyMock.mockResolvedValueOnce([]);

    const results = await preDunning.runPreDunningScan("ws_1");
    expect(results).toHaveLength(1);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });

  it("actively scans Stripe and upserts at-risk records for expiring cards", async () => {
    const {
      preDunning,
      findManyMock,
      upsertMock,
      connectedStripeAccountFindUnique,
      stripeSubscriptionsList,
      stripeCustomersRetrieve,
      stripePaymentMethodsRetrieve,
    } = await loadPreDunning(false);

    connectedStripeAccountFindUnique.mockResolvedValueOnce({
      stripeAccountId: "acct_1",
      accessTokenEnc: "sk_test_connected",
    });

    // First run: scan will upsert, then findMany returns that record.
    findManyMock.mockResolvedValueOnce([
      {
        id: "ws_1_sub_1",
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    stripeSubscriptionsList.mockResolvedValueOnce({
      data: [
        {
          id: "sub_1",
          customer: "cus_1",
          default_payment_method: null,
        },
      ],
      has_more: false,
    });

    stripeCustomersRetrieve.mockResolvedValueOnce({
      id: "cus_1",
      deleted: false,
      invoice_settings: {
        default_payment_method: "pm_1",
      },
    });

    stripePaymentMethodsRetrieve.mockResolvedValueOnce({
      id: "pm_1",
      type: "card",
      card: {
        exp_month: new Date().getUTCMonth() + 1,
        exp_year: new Date().getUTCFullYear(),
      },
    });

    const results = await preDunning.runPreDunningScan("ws_1");

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ws_1_sub_1" },
        create: expect.objectContaining({
          workspaceId: "ws_1",
          stripeSubscriptionId: "sub_1",
          stripeCustomerId: "cus_1",
          reason: "card_expiring",
        }),
      }),
    );
    expect(results).toHaveLength(1);
  });

  it("returns demo candidate when database is unavailable during scan", async () => {
    const {
      preDunning,
      connectedStripeAccountFindUnique,
      findManyMock,
      upsertMock,
      isDatabaseUnavailableErrorMock,
    } = await loadPreDunning(true);

    connectedStripeAccountFindUnique.mockRejectedValueOnce(new Error("db down"));
    isDatabaseUnavailableErrorMock.mockReturnValueOnce(true);
    findManyMock.mockResolvedValueOnce([]);

    const results = await preDunning.runPreDunningScan("ws_1");

    expect(results).toHaveLength(1);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });

  it("continues processing when a subscription item lookup fails", async () => {
    const {
      preDunning,
      connectedStripeAccountFindUnique,
      stripeSubscriptionsList,
      stripeCustomersRetrieve,
      stripePaymentMethodsRetrieve,
      upsertMock,
      findManyMock,
    } = await loadPreDunning(false);

    connectedStripeAccountFindUnique.mockResolvedValueOnce({
      stripeAccountId: "acct_1",
      accessTokenEnc: "sk_test_connected",
    });

    stripeSubscriptionsList.mockResolvedValueOnce({
      data: [
        {
          id: "sub_fail",
          customer: "cus_fail",
          default_payment_method: null,
        },
        {
          id: "sub_ok",
          customer: "cus_ok",
          default_payment_method: null,
        },
      ],
      has_more: false,
    });

    stripeCustomersRetrieve
      .mockRejectedValueOnce(new Error("stripe down"))
      .mockResolvedValueOnce({
        id: "cus_ok",
        deleted: false,
        invoice_settings: { default_payment_method: "pm_ok" },
      });

    stripePaymentMethodsRetrieve.mockResolvedValueOnce({
      id: "pm_ok",
      type: "card",
      card: {
        exp_month: new Date().getUTCMonth() + 1,
        exp_year: new Date().getUTCFullYear(),
      },
    });

    findManyMock.mockResolvedValueOnce([
      {
        id: "ws_1_sub_ok",
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    const results = await preDunning.runPreDunningScan("ws_1");

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ws_1_sub_ok" },
      }),
    );
    expect(results).toHaveLength(1);
  });
});
