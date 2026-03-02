import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration-level tests for the Stripe webhook route.
 * These test the full route handler with mocked DB and Stripe,
 * covering the flow from webhook receipt through event processing.
 */

let findUniqueAccount: ReturnType<typeof vi.fn>;
let createStripeEvent: ReturnType<typeof vi.fn>;
let findUniqueStripeEvent: ReturnType<typeof vi.fn>;
let updateStripeEvent: ReturnType<typeof vi.fn>;
let upsertRecoveryAttempt: ReturnType<typeof vi.fn>;
let findUniqueRecoveryAttempt: ReturnType<typeof vi.fn>;
let updateRecoveryAttempt: ReturnType<typeof vi.fn>;
let upsertSubscriptionAtRisk: ReturnType<typeof vi.fn>;
let deleteManySubscriptionAtRisk: ReturnType<typeof vi.fn>;
let createRecoveryOutcome: ReturnType<typeof vi.fn>;
let findFirstDunningSequence: ReturnType<typeof vi.fn>;
let createDunningSequence: ReturnType<typeof vi.fn>;
let inngestSend: ReturnType<typeof vi.fn>;

async function loadRoute() {
  vi.resetModules();

  findUniqueAccount = vi.fn().mockResolvedValue({
    workspaceId: "ws_1",
    stripeAccountId: "acct_connected",
  });

  createStripeEvent = vi.fn().mockResolvedValue({
    id: "se_1",
    stripeEventId: "evt_1",
    processingStatus: "received",
  });
  findUniqueStripeEvent = vi.fn().mockResolvedValue(null);
  updateStripeEvent = vi.fn().mockResolvedValue({});

  upsertRecoveryAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    stripeCustomerId: "cus_123",
    stripeInvoiceId: "in_1",
    status: "pending",
  });
  findUniqueRecoveryAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    stripeCustomerId: "cus_123",
  });
  updateRecoveryAttempt = vi.fn().mockImplementation(async ({ data }) => ({
    id: "ra_1",
    ...data,
  }));
  createRecoveryOutcome = vi.fn().mockResolvedValue({});
  deleteManySubscriptionAtRisk = vi.fn().mockResolvedValue({ count: 0 });
  upsertSubscriptionAtRisk = vi.fn().mockResolvedValue({});
  findFirstDunningSequence = vi.fn().mockResolvedValue({
    id: "seq_1",
    steps: [],
  });
  createDunningSequence = vi.fn().mockResolvedValue({ id: "seq_new", steps: [] });

  inngestSend = vi.fn().mockResolvedValue({ ids: [] });

  vi.doMock("@/lib/env", () => ({
    env: {
      STRIPE_WEBHOOK_SECRET: undefined,
    },
    isProduction: false,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException: vi.fn(),
    reportAnalyticsEvent: vi.fn(),
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => null,
  }));

  vi.doMock("@/lib/constants", () => ({
    SUPPORTED_STRIPE_WEBHOOK_EVENTS: new Set([
      "invoice.payment_failed",
      "invoice.payment_succeeded",
      "customer.subscription.updated",
      "payment_method.automatically_updated",
    ]),
    HARD_DECLINE_CODES: new Set([
      "do_not_honor",
      "lost_card",
      "stolen_card",
      "pickup_card",
      "restricted_card",
      "invalid_account",
      "expired_card",
    ]),
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      connectedStripeAccount: {
        findUnique: findUniqueAccount,
      },
      stripeEvent: {
        create: createStripeEvent,
        findUnique: findUniqueStripeEvent,
        update: updateStripeEvent,
      },
      recoveryAttempt: {
        upsert: upsertRecoveryAttempt,
        findUnique: findUniqueRecoveryAttempt,
        update: updateRecoveryAttempt,
      },
      subscriptionAtRisk: {
        upsert: upsertSubscriptionAtRisk,
        deleteMany: deleteManySubscriptionAtRisk,
      },
      recoveryOutcome: {
        create: createRecoveryOutcome,
      },
      dunningSequence: {
        findFirst: findFirstDunningSequence,
        create: createDunningSequence,
      },
    },
  }));

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: { send: inngestSend },
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const route = await import("@/app/api/webhooks/stripe/route");
  return route;
}

function makeWebhookRequest(event: Record<string, unknown>) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  });
}

describe("stripe webhook route — integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- invoice.payment_failed full flow ---

  it("processes invoice.payment_failed end-to-end", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_fail_1",
        type: "invoice.payment_failed",
        account: "acct_connected",
        data: {
          object: {
            id: "in_fail_1",
            customer: "cus_123",
            subscription: "sub_1",
            amount_due: 9900,
            created: 1700000000,
            customer_email: "user@example.com",
          },
        },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.received).toBe(true);
    expect(payload.duplicate).toBe(false);

    // Verify recovery attempt created
    expect(upsertRecoveryAttempt).toHaveBeenCalled();

    // Verify subscription at risk created
    expect(upsertSubscriptionAtRisk).toHaveBeenCalled();

    // Verify default sequence ensured
    expect(findFirstDunningSequence).toHaveBeenCalled();

    // Verify Inngest event emitted
    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "recovery/started",
        data: expect.objectContaining({
          workspaceId: "ws_1",
          stripeInvoiceId: "in_fail_1",
          customerEmail: "user@example.com",
        }),
      }),
    );

    // Verify event marked as processed
    expect(updateStripeEvent).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_fail_1" },
      data: expect.objectContaining({ processingStatus: "processed" }),
    });
  });

  // --- invoice.payment_succeeded full flow ---

  it("processes invoice.payment_succeeded end-to-end", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_success_1",
        type: "invoice.payment_succeeded",
        account: "acct_connected",
        data: {
          object: {
            id: "in_fail_1",
            customer: "cus_123",
            subscription: "sub_1",
            amount_paid: 9900,
            amount_due: 9900,
          },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(updateRecoveryAttempt).toHaveBeenCalledWith({
      where: { id: "ra_1" },
      data: expect.objectContaining({
        status: "recovered",
        recoveredAmountCents: 9900,
      }),
    });
    expect(createRecoveryOutcome).toHaveBeenCalled();
    expect(deleteManySubscriptionAtRisk).toHaveBeenCalled();

    // Verify Inngest recovery/succeeded event emitted
    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "recovery/succeeded",
      }),
    );
  });

  // --- Duplicate event handling ---

  it("returns duplicate=true for already-processed event", async () => {
    const route = await loadRoute();
    createStripeEvent.mockRejectedValueOnce(new Error("Unique constraint"));
    findUniqueStripeEvent.mockResolvedValueOnce({
      id: "se_existing",
      stripeEventId: "evt_dup",
    });

    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_dup",
        type: "invoice.payment_failed",
        account: "acct_connected",
        data: {
          object: {
            id: "in_dup",
            customer: "cus_123",
            subscription: "sub_1",
            amount_due: 100,
            created: 1700000000,
          },
        },
      }),
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.duplicate).toBe(true);

    // Should NOT process the event again
    expect(upsertRecoveryAttempt).not.toHaveBeenCalled();
    expect(inngestSend).not.toHaveBeenCalled();
  });

  // --- Account not found ---

  it("returns 404 when no workspace connected to Stripe account", async () => {
    const route = await loadRoute();
    findUniqueAccount.mockResolvedValueOnce(null);

    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_orphan",
        type: "invoice.payment_failed",
        account: "acct_unknown",
        data: {
          object: { id: "in_1", customer: "cus_1", subscription: "sub_1", amount_due: 100, created: 1700000000 },
        },
      }),
    );

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.code).toBe("STRIPE_ACCOUNT_NOT_CONNECTED");
  });

  // --- Missing account context ---

  it("returns 404 when webhook has no account field", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_no_acct",
        type: "invoice.payment_failed",
        data: {
          object: { id: "in_1", customer: "cus_1", subscription: "sub_1", amount_due: 100, created: 1700000000 },
        },
      }),
    );

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.code).toBe("STRIPE_ACCOUNT_NOT_CONNECTED");
  });

  // --- Unsupported event ---

  it("accepts unsupported events without processing", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_unsupported",
        type: "charge.captured",
        data: { object: {} },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.received).toBe(true);

    // Should not touch any DB or Inngest
    expect(findUniqueAccount).not.toHaveBeenCalled();
    expect(upsertRecoveryAttempt).not.toHaveBeenCalled();
  });

  // --- customer.subscription.updated ---

  it("processes subscription cancellation correctly", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_sub_cancel",
        type: "customer.subscription.updated",
        account: "acct_connected",
        data: {
          object: {
            id: "sub_1",
            customer: "cus_123",
            status: "canceled",
            cancel_at_period_end: false,
          },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
      where: { workspaceId: "ws_1", stripeSubscriptionId: "sub_1" },
    });
  });

  // --- payment_method.automatically_updated ---

  it("clears card_expiring risk on payment method update", async () => {
    const route = await loadRoute();
    const response = await route.POST(
      makeWebhookRequest({
        id: "evt_pm_updated",
        type: "payment_method.automatically_updated",
        account: "acct_connected",
        data: {
          object: {
            id: "pm_1",
            customer: "cus_123",
          },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
      where: {
        workspaceId: "ws_1",
        stripeCustomerId: "cus_123",
        reason: "card_expiring",
      },
    });
  });

  // --- Workspace isolation ---

  it("uses the correct workspace from connected account lookup", async () => {
    const route = await loadRoute();
    findUniqueAccount.mockResolvedValueOnce({
      workspaceId: "ws_other",
      stripeAccountId: "acct_other",
    });

    await route.POST(
      makeWebhookRequest({
        id: "evt_other_ws",
        type: "invoice.payment_failed",
        account: "acct_other",
        data: {
          object: {
            id: "in_other",
            customer: "cus_456",
            subscription: "sub_2",
            amount_due: 5000,
            created: 1700000000,
            customer_email: "other@test.com",
          },
        },
      }),
    );

    // Verify workspace is correctly propagated
    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: "ws_other",
        }),
      }),
    );
  });
});
