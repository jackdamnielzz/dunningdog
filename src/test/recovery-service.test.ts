import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

// --- Mocks ---

let upsertRecoveryAttempt: ReturnType<typeof vi.fn>;
let upsertSubscriptionAtRisk: ReturnType<typeof vi.fn>;
let findUniqueRecoveryAttempt: ReturnType<typeof vi.fn>;
let updateRecoveryAttempt: ReturnType<typeof vi.fn>;
let createRecoveryOutcome: ReturnType<typeof vi.fn>;
let deleteManySubscriptionAtRisk: ReturnType<typeof vi.fn>;
let findFirstDunningSequence: ReturnType<typeof vi.fn>;
let createDunningSequence: ReturnType<typeof vi.fn>;
let createStripeEvent: ReturnType<typeof vi.fn>;
let findUniqueStripeEvent: ReturnType<typeof vi.fn>;
let updateStripeEvent: ReturnType<typeof vi.fn>;
let inngestSend: ReturnType<typeof vi.fn>;

async function loadRecovery() {
  vi.resetModules();

  upsertRecoveryAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    workspaceId: "ws_1",
    stripeInvoiceId: "in_fail_1",
    stripeCustomerId: "cus_123",
    declineType: "soft",
    status: "pending",
    amountDueCents: 4900,
  });

  upsertSubscriptionAtRisk = vi.fn().mockResolvedValue({});

  findUniqueRecoveryAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    workspaceId: "ws_1",
    stripeInvoiceId: "in_fail_1",
    stripeCustomerId: "cus_123",
    status: "pending",
  });

  updateRecoveryAttempt = vi.fn().mockImplementation(async ({ data }) => ({
    id: "ra_1",
    ...data,
  }));

  createRecoveryOutcome = vi.fn().mockResolvedValue({});
  deleteManySubscriptionAtRisk = vi.fn().mockResolvedValue({ count: 1 });

  findFirstDunningSequence = vi.fn().mockResolvedValue({
    id: "seq_1",
    workspaceId: "ws_1",
    steps: [],
  });
  createDunningSequence = vi.fn().mockResolvedValue({
    id: "seq_new",
    workspaceId: "ws_1",
    steps: [],
  });

  createStripeEvent = vi.fn().mockResolvedValue({
    id: "se_1",
    stripeEventId: "evt_1",
    processingStatus: "received",
  });
  findUniqueStripeEvent = vi.fn().mockResolvedValue(null);
  updateStripeEvent = vi.fn().mockResolvedValue({});

  inngestSend = vi.fn().mockResolvedValue({ ids: ["inngest_1"] });

  vi.doMock("@/lib/db", () => ({
    db: {
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
      stripeEvent: {
        create: createStripeEvent,
        findUnique: findUniqueStripeEvent,
        update: updateStripeEvent,
      },
    },
  }));

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: { send: inngestSend },
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException: vi.fn(),
    reportAnalyticsEvent: vi.fn(),
  }));

  const recovery = await import("@/lib/services/recovery");
  return recovery;
}

// --- Helper factory for Stripe events ---

function makeInvoicePaymentFailedEvent(overrides: Partial<{
  eventId: string;
  invoiceId: string;
  customerId: string;
  subscriptionId: string;
  amountDue: number;
  declineCode: string | null;
  customerEmail: string | null;
}> = {}): Stripe.Event {
  const charge = overrides.declineCode !== undefined
    ? { outcome: { network_status: overrides.declineCode } }
    : undefined;

  return {
    id: overrides.eventId ?? "evt_fail_1",
    type: "invoice.payment_failed",
    account: "acct_1",
    data: {
      object: {
        id: overrides.invoiceId ?? "in_fail_1",
        customer: overrides.customerId ?? "cus_123",
        subscription: overrides.subscriptionId ?? "sub_1",
        amount_due: overrides.amountDue ?? 4900,
        created: 1700000000,
        charge,
        customer_email: overrides.customerEmail ?? "test@example.com",
      },
    },
  } as unknown as Stripe.Event;
}

function makeInvoicePaymentSucceededEvent(overrides: Partial<{
  eventId: string;
  invoiceId: string;
  amountPaid: number;
}> = {}): Stripe.Event {
  return {
    id: overrides.eventId ?? "evt_success_1",
    type: "invoice.payment_succeeded",
    account: "acct_1",
    data: {
      object: {
        id: overrides.invoiceId ?? "in_fail_1",
        customer: "cus_123",
        subscription: "sub_1",
        amount_paid: overrides.amountPaid ?? 4900,
        amount_due: 4900,
      },
    },
  } as unknown as Stripe.Event;
}

function makeSubscriptionUpdatedEvent(overrides: Partial<{
  eventId: string;
  subscriptionId: string;
  customerId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
}> = {}): Stripe.Event {
  return {
    id: overrides.eventId ?? "evt_sub_1",
    type: "customer.subscription.updated",
    account: "acct_1",
    data: {
      object: {
        id: overrides.subscriptionId ?? "sub_1",
        customer: overrides.customerId ?? "cus_123",
        status: overrides.status ?? "active",
        cancel_at_period_end: overrides.cancelAtPeriodEnd ?? false,
      },
    },
  } as unknown as Stripe.Event;
}

function makePaymentMethodUpdatedEvent(overrides: Partial<{
  eventId: string;
  customerId: string;
}> = {}): Stripe.Event {
  return {
    id: overrides.eventId ?? "evt_pm_1",
    type: "payment_method.automatically_updated",
    account: "acct_1",
    data: {
      object: {
        id: "pm_1",
        customer: overrides.customerId ?? "cus_123",
      },
    },
  } as unknown as Stripe.Event;
}

// --- Tests ---

describe("recovery service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- classifyDeclineType ---

  describe("classifyDeclineType", () => {
    it("classifies hard decline codes correctly", async () => {
      const recovery = await loadRecovery();
      const hardCodes = [
        "do_not_honor",
        "lost_card",
        "stolen_card",
        "pickup_card",
        "restricted_card",
        "invalid_account",
        "expired_card",
      ];
      for (const code of hardCodes) {
        expect(recovery.classifyDeclineType(code)).toBe("hard");
      }
    });

    it("classifies unknown codes as soft decline", async () => {
      const recovery = await loadRecovery();
      expect(recovery.classifyDeclineType("insufficient_funds")).toBe("soft");
      expect(recovery.classifyDeclineType("generic_decline")).toBe("soft");
      expect(recovery.classifyDeclineType("card_velocity_exceeded")).toBe("soft");
    });

    it("defaults to soft when code is null or undefined", async () => {
      const recovery = await loadRecovery();
      expect(recovery.classifyDeclineType(null)).toBe("soft");
      expect(recovery.classifyDeclineType(undefined)).toBe("soft");
      expect(recovery.classifyDeclineType("")).toBe("soft");
    });
  });

  // --- persistStripeEvent ---

  describe("persistStripeEvent", () => {
    it("persists a new event and returns duplicate=false", async () => {
      const recovery = await loadRecovery();
      const result = await recovery.persistStripeEvent({
        workspaceId: "ws_1",
        eventId: "evt_1",
        eventType: "invoice.payment_failed",
        payload: { test: true },
      });

      expect(result.duplicate).toBe(false);
      expect(createStripeEvent).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stripeEventId: "evt_1",
          eventType: "invoice.payment_failed",
          processingStatus: "received",
        }),
      });
    });

    it("returns duplicate=true when event already exists", async () => {
      const recovery = await loadRecovery();
      createStripeEvent.mockRejectedValueOnce(new Error("Unique constraint"));
      findUniqueStripeEvent.mockResolvedValueOnce({
        id: "se_existing",
        stripeEventId: "evt_1",
      });

      const result = await recovery.persistStripeEvent({
        workspaceId: "ws_1",
        eventId: "evt_1",
        eventType: "invoice.payment_failed",
        payload: {},
      });

      expect(result.duplicate).toBe(true);
    });

    it("throws when create fails and no existing event found", async () => {
      const recovery = await loadRecovery();
      createStripeEvent.mockRejectedValueOnce(new Error("DB error"));
      findUniqueStripeEvent.mockResolvedValueOnce(null);

      await expect(
        recovery.persistStripeEvent({
          workspaceId: "ws_1",
          eventId: "evt_1",
          eventType: "invoice.payment_failed",
          payload: {},
        }),
      ).rejects.toMatchObject({
        code: "DUNNING_WEBHOOK_PROCESSING_FAILED",
      });
    });
  });

  // --- ensureDefaultSequence ---

  describe("ensureDefaultSequence", () => {
    it("returns existing sequence when one exists", async () => {
      const recovery = await loadRecovery();
      const result = await recovery.ensureDefaultSequence("ws_1");

      expect(result.id).toBe("seq_1");
      expect(createDunningSequence).not.toHaveBeenCalled();
    });

    it("creates a default 3-step sequence when none exists", async () => {
      const recovery = await loadRecovery();
      findFirstDunningSequence.mockResolvedValueOnce(null);

      await recovery.ensureDefaultSequence("ws_1");

      expect(createDunningSequence).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            workspaceId: "ws_1",
            name: "Default Recovery Sequence",
            isEnabled: true,
            steps: {
              create: expect.arrayContaining([
                expect.objectContaining({ stepOrder: 1, delayHours: 0 }),
                expect.objectContaining({ stepOrder: 2, delayHours: 72 }),
                expect.objectContaining({ stepOrder: 3, delayHours: 168 }),
              ]),
            },
          }),
        }),
      );
    });
  });

  // --- processStripeWebhookEvent: invoice.payment_failed ---

  describe("processStripeWebhookEvent — invoice.payment_failed", () => {
    it("creates a recovery attempt and emits Inngest event", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentFailedEvent();

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("recovery_started");
      expect(upsertRecoveryAttempt).toHaveBeenCalled();
      expect(upsertSubscriptionAtRisk).toHaveBeenCalled();
      expect(inngestSend).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "recovery/started",
          data: expect.objectContaining({
            workspaceId: "ws_1",
            recoveryAttemptId: "ra_1",
            stripeInvoiceId: "in_fail_1",
          }),
        }),
      );
    });

    it("extracts customer email from invoice.customer_email", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentFailedEvent({ customerEmail: "user@test.com" });

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(inngestSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerEmail: "user@test.com",
          }),
        }),
      );
    });

    it("handles missing customer email gracefully", async () => {
      const recovery = await loadRecovery();
      // Build event manually without any email fields
      const event = {
        id: "evt_no_email",
        type: "invoice.payment_failed",
        account: "acct_1",
        data: {
          object: {
            id: "in_no_email",
            customer: "cus_123",
            subscription: "sub_1",
            amount_due: 4900,
            created: 1700000000,
          },
        },
      } as unknown as Stripe.Event;

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(inngestSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerEmail: undefined,
          }),
        }),
      );
    });

    it("marks event as processed on success", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentFailedEvent();

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(updateStripeEvent).toHaveBeenCalledWith({
        where: { stripeEventId: "evt_fail_1" },
        data: expect.objectContaining({
          processingStatus: "processed",
        }),
      });
    });

    it("marks event as failed when Inngest send fails", async () => {
      const recovery = await loadRecovery();
      inngestSend.mockRejectedValueOnce(new Error("Inngest unavailable"));
      const event = makeInvoicePaymentFailedEvent();

      await expect(
        recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event }),
      ).rejects.toThrow("Inngest unavailable");

      expect(updateStripeEvent).toHaveBeenCalledWith({
        where: { stripeEventId: "evt_fail_1" },
        data: expect.objectContaining({
          processingStatus: "failed",
        }),
      });
    });

    it("extracts decline code from charge outcome", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentFailedEvent({ declineCode: "lost_card" });

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(upsertRecoveryAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId_stripeInvoiceId: {
              workspaceId: "ws_1",
              stripeInvoiceId: "in_fail_1",
            },
          }),
        }),
      );
    });

    it("handles invoice with string customer ID", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentFailedEvent({ customerId: "cus_str" });

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(upsertRecoveryAttempt).toHaveBeenCalled();
    });
  });

  // --- processStripeWebhookEvent: invoice.payment_succeeded ---

  describe("processStripeWebhookEvent — invoice.payment_succeeded", () => {
    it("marks recovery as succeeded and creates outcome", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentSucceededEvent();

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("recovery_succeeded");
      expect(updateRecoveryAttempt).toHaveBeenCalledWith({
        where: { id: "ra_1" },
        data: expect.objectContaining({
          status: "recovered",
          recoveredAmountCents: 4900,
        }),
      });
      expect(createRecoveryOutcome).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recoveryAttemptId: "ra_1",
          outcome: "recovered",
        }),
      });
    });

    it("deletes subscriptions at risk after recovery", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentSucceededEvent();

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
        where: {
          workspaceId: "ws_1",
          activeRecoveryAttemptId: "ra_1",
        },
      });
    });

    it("returns null recoveryAttemptId when no attempt found", async () => {
      const recovery = await loadRecovery();
      findUniqueRecoveryAttempt.mockResolvedValueOnce(null);
      const event = makeInvoicePaymentSucceededEvent();

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("recovery_succeeded");
      expect(result.recoveryAttemptId).toBeNull();
      expect(updateRecoveryAttempt).not.toHaveBeenCalled();
    });

    it("marks stripe event as processed", async () => {
      const recovery = await loadRecovery();
      const event = makeInvoicePaymentSucceededEvent();

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(updateStripeEvent).toHaveBeenCalledWith({
        where: { stripeEventId: "evt_success_1" },
        data: expect.objectContaining({ processingStatus: "processed" }),
      });
    });
  });

  // --- processStripeWebhookEvent: customer.subscription.updated ---

  describe("processStripeWebhookEvent — customer.subscription.updated", () => {
    it("deletes risk records when subscription is canceled", async () => {
      const recovery = await loadRecovery();
      const event = makeSubscriptionUpdatedEvent({ status: "canceled" });

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("subscription_synced");
      expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
        where: { workspaceId: "ws_1", stripeSubscriptionId: "sub_1" },
      });
    });

    it("deletes risk records when cancel_at_period_end is true", async () => {
      const recovery = await loadRecovery();
      const event = makeSubscriptionUpdatedEvent({ cancelAtPeriodEnd: true });

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
        where: { workspaceId: "ws_1", stripeSubscriptionId: "sub_1" },
      });
    });

    it("upserts risk record when subscription is active", async () => {
      const recovery = await loadRecovery();
      const event = makeSubscriptionUpdatedEvent({ status: "active" });

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(upsertSubscriptionAtRisk).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ws_1_sub_1" },
          create: expect.objectContaining({
            workspaceId: "ws_1",
            stripeSubscriptionId: "sub_1",
            reason: "payment_failed",
          }),
        }),
      );
    });

    it("handles customer as object with id", async () => {
      const recovery = await loadRecovery();
      const event = {
        id: "evt_sub_obj",
        type: "customer.subscription.updated",
        account: "acct_1",
        data: {
          object: {
            id: "sub_2",
            customer: { id: "cus_obj" },
            status: "active",
            cancel_at_period_end: false,
          },
        },
      } as unknown as Stripe.Event;

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(upsertSubscriptionAtRisk).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            stripeCustomerId: "cus_obj",
          }),
        }),
      );
    });
  });

  // --- processStripeWebhookEvent: payment_method.automatically_updated ---

  describe("processStripeWebhookEvent — payment_method.automatically_updated", () => {
    it("deletes card_expiring risk records for the customer", async () => {
      const recovery = await loadRecovery();
      const event = makePaymentMethodUpdatedEvent({ customerId: "cus_pm" });

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("payment_method_updated");
      expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
        where: {
          workspaceId: "ws_1",
          stripeCustomerId: "cus_pm",
          reason: "card_expiring",
        },
      });
    });

    it("handles customer as object with id", async () => {
      const recovery = await loadRecovery();
      const event = {
        id: "evt_pm_obj",
        type: "payment_method.automatically_updated",
        account: "acct_1",
        data: {
          object: {
            id: "pm_2",
            customer: { id: "cus_pm_obj" },
          },
        },
      } as unknown as Stripe.Event;

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(deleteManySubscriptionAtRisk).toHaveBeenCalledWith({
        where: expect.objectContaining({
          stripeCustomerId: "cus_pm_obj",
        }),
      });
    });

    it("skips deletion when customer is null", async () => {
      const recovery = await loadRecovery();
      const event = {
        id: "evt_pm_null",
        type: "payment_method.automatically_updated",
        account: "acct_1",
        data: {
          object: {
            id: "pm_3",
            customer: null,
          },
        },
      } as unknown as Stripe.Event;

      await recovery.processStripeWebhookEvent({ workspaceId: "ws_1", event });

      expect(deleteManySubscriptionAtRisk).not.toHaveBeenCalled();
    });
  });

  // --- processStripeWebhookEvent: unknown event ---

  describe("processStripeWebhookEvent — unknown event type", () => {
    it("returns ignored action for unrecognized events", async () => {
      const recovery = await loadRecovery();
      const event = {
        id: "evt_unknown",
        type: "charge.refunded",
        account: "acct_1",
        data: { object: {} },
      } as unknown as Stripe.Event;

      const result = await recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event,
      });

      expect(result.action).toBe("ignored");
      expect(updateStripeEvent).toHaveBeenCalledWith({
        where: { stripeEventId: "evt_unknown" },
        data: expect.objectContaining({ processingStatus: "processed" }),
      });
    });
  });
});
