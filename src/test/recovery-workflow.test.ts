import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadRecovery() {
  vi.resetModules();

  const dunningSequenceFindFirst = vi.fn();
  const dunningSequenceCreate = vi.fn();
  const recoveryAttemptUpsert = vi.fn();
  const recoveryAttemptFindUnique = vi.fn();
  const recoveryAttemptUpdate = vi.fn();
  const subscriptionAtRiskUpsert = vi.fn();
  const subscriptionAtRiskDeleteMany = vi.fn();
  const recoveryOutcomeCreate = vi.fn();
  const stripeEventCreate = vi.fn();
  const stripeEventFindUnique = vi.fn();
  const stripeEventUpdate = vi.fn();
  const inngestSend = vi.fn().mockResolvedValue({ id: "inngest_evt_1" });

  vi.doMock("@/lib/db", () => ({
    db: {
      dunningSequence: {
        findFirst: dunningSequenceFindFirst,
        create: dunningSequenceCreate,
      },
      recoveryAttempt: {
        upsert: recoveryAttemptUpsert,
        findUnique: recoveryAttemptFindUnique,
        update: recoveryAttemptUpdate,
      },
      subscriptionAtRisk: {
        upsert: subscriptionAtRiskUpsert,
        deleteMany: subscriptionAtRiskDeleteMany,
      },
      recoveryOutcome: {
        create: recoveryOutcomeCreate,
      },
      stripeEvent: {
        create: stripeEventCreate,
        findUnique: stripeEventFindUnique,
        update: stripeEventUpdate,
      },
    },
  }));

  vi.doMock("@/lib/runtime-fallback", () => ({
    isDatabaseUnavailableError: vi.fn(() => false),
    describeFailure: vi.fn(() => "db unavailable"),
  }));

  vi.doMock("@/lib/demo-data", () => ({
    getDemoSequence: vi.fn((workspaceId: string) => ({
      id: `demo-${workspaceId}`,
      workspaceId,
      name: "Demo sequence",
      steps: [],
    })),
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: {
      send: inngestSend,
    },
  }));

  const recovery = await import("@/lib/services/recovery");

  return {
    recovery,
    inngestSend,
    dunningSequenceFindFirst,
    dunningSequenceCreate,
    recoveryAttemptUpsert,
    recoveryAttemptFindUnique,
    recoveryAttemptUpdate,
    subscriptionAtRiskUpsert,
    subscriptionAtRiskDeleteMany,
    recoveryOutcomeCreate,
    stripeEventCreate,
    stripeEventFindUnique,
    stripeEventUpdate,
  };
}

describe("recovery workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts a recovery attempt from failed invoice and marks subscription at risk", async () => {
    const { recovery, recoveryAttemptUpsert, subscriptionAtRiskUpsert } =
      await loadRecovery();

    recoveryAttemptUpsert.mockResolvedValueOnce({
      id: "attempt_1",
    });
    subscriptionAtRiskUpsert.mockResolvedValueOnce({
      id: "risk_1",
    });

    const attempt = await recovery.upsertRecoveryAttemptFromFailedInvoice("ws_1", {
      id: "in_1",
      amount_due: 1500,
      customer: "cus_1",
      subscription: "sub_1",
      created: 1_700_000_000,
      charge: {
        outcome: {
          network_status: "expired_card",
        },
      },
    } as never);

    expect(attempt.id).toBe("attempt_1");
    expect(recoveryAttemptUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          workspaceId: "ws_1",
          stripeInvoiceId: "in_1",
          declineType: "hard",
        }),
      }),
    );
    expect(subscriptionAtRiskUpsert).toHaveBeenCalledTimes(1);
  });

  it("creates a default sequence when none exists", async () => {
    const { recovery, dunningSequenceFindFirst, dunningSequenceCreate } =
      await loadRecovery();

    dunningSequenceFindFirst.mockResolvedValueOnce(null);
    dunningSequenceCreate.mockResolvedValueOnce({
      id: "seq_default",
      steps: [{ id: "step_1" }],
    });

    const result = await recovery.ensureDefaultSequence("ws_1");

    expect(dunningSequenceCreate).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("seq_default");
  });

  it("marks an existing recovery attempt as recovered", async () => {
    const {
      recovery,
      recoveryAttemptFindUnique,
      recoveryAttemptUpdate,
      recoveryOutcomeCreate,
      subscriptionAtRiskDeleteMany,
    } = await loadRecovery();

    recoveryAttemptFindUnique.mockResolvedValueOnce({
      id: "attempt_1",
    });
    recoveryAttemptUpdate.mockResolvedValueOnce({
      id: "attempt_1",
      status: "recovered",
    });

    const updated = await recovery.markRecoverySucceeded("ws_1", {
      id: "in_1",
      amount_paid: 1500,
      amount_due: 1500,
    } as never);

    expect(updated?.status).toBe("recovered");
    expect(recoveryOutcomeCreate).toHaveBeenCalledTimes(1);
    expect(subscriptionAtRiskDeleteMany).toHaveBeenCalledWith({
      where: {
        workspaceId: "ws_1",
        activeRecoveryAttemptId: "attempt_1",
      },
    });
  });

  it("returns null when no recovery attempt exists", async () => {
    const { recovery, recoveryAttemptFindUnique, recoveryAttemptUpdate } =
      await loadRecovery();

    recoveryAttemptFindUnique.mockResolvedValueOnce(null);

    const result = await recovery.markRecoverySucceeded("ws_1", {
      id: "in_missing",
    } as never);

    expect(result).toBeNull();
    expect(recoveryAttemptUpdate).not.toHaveBeenCalled();
  });

  it("returns duplicate=true when a Stripe event already exists", async () => {
    const { recovery, stripeEventCreate, stripeEventFindUnique } = await loadRecovery();

    stripeEventCreate.mockRejectedValueOnce(new Error("duplicate key"));
    stripeEventFindUnique.mockResolvedValueOnce({
      id: "evt_1",
      stripeEventId: "evt_stripe_1",
    });

    const result = await recovery.persistStripeEvent({
      workspaceId: "ws_1",
      eventId: "evt_stripe_1",
      eventType: "invoice.payment_failed",
      payload: { id: "evt_stripe_1" },
    });

    expect(result.duplicate).toBe(true);
    expect(result.stripeEvent.id).toBe("evt_1");
  });

  it("throws when persistStripeEvent fails without a duplicate", async () => {
    const { recovery, stripeEventCreate, stripeEventFindUnique } = await loadRecovery();

    stripeEventCreate.mockRejectedValueOnce(new Error("db failure"));
    stripeEventFindUnique.mockResolvedValueOnce(null);

    await expect(
      recovery.persistStripeEvent({
        workspaceId: "ws_1",
        eventId: "evt_missing",
        eventType: "invoice.payment_failed",
        payload: { id: "evt_missing" },
      }),
    ).rejects.toMatchObject({
      code: "DUNNING_WEBHOOK_PROCESSING_FAILED",
      status: 500,
    });
  });

  it("processes failed invoice webhooks and marks event as processed", async () => {
    const {
      recovery,
      dunningSequenceFindFirst,
      recoveryAttemptUpsert,
      subscriptionAtRiskUpsert,
      stripeEventUpdate,
      inngestSend,
    } = await loadRecovery();

    dunningSequenceFindFirst.mockResolvedValueOnce({
      id: "seq_1",
      steps: [],
    });
    recoveryAttemptUpsert.mockResolvedValueOnce({
      id: "attempt_99",
      stripeCustomerId: "cus_1",
    });
    subscriptionAtRiskUpsert.mockResolvedValueOnce({
      id: "risk_1",
    });
    stripeEventUpdate.mockResolvedValueOnce({
      id: "evt_internal",
    });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_1",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "in_1",
            amount_due: 4000,
            customer: "cus_1",
            subscription: "sub_1",
            created: 1_700_000_000,
            customer_email: "billing@example.com",
          },
        },
      } as never,
    });

    expect(result).toEqual({
      action: "recovery_started",
      recoveryAttemptId: "attempt_99",
    });

    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_1:recovery_started",
        name: "recovery/started",
        data: expect.objectContaining({
          workspaceId: "ws_1",
          recoveryAttemptId: "attempt_99",
          stripeInvoiceId: "in_1",
          customerEmail: "billing@example.com",
        }),
      }),
    );

    expect(stripeEventUpdate).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_1" },
      data: expect.objectContaining({
        processingStatus: "processed",
      }),
    });
  });

  it("marks stripe event failed if recovery started emission fails", async () => {
    const {
      recovery,
      dunningSequenceFindFirst,
      recoveryAttemptUpsert,
      subscriptionAtRiskUpsert,
      stripeEventUpdate,
      inngestSend,
    } = await loadRecovery();

    dunningSequenceFindFirst.mockResolvedValueOnce({
      id: "seq_1",
      steps: [],
    });
    recoveryAttemptUpsert.mockResolvedValueOnce({
      id: "attempt_1",
      stripeCustomerId: "cus_1",
    });
    subscriptionAtRiskUpsert.mockResolvedValueOnce({ id: "risk_1" });
    stripeEventUpdate.mockResolvedValue({ id: "evt_internal" });
    inngestSend.mockRejectedValueOnce(new Error("inngest down"));

    await expect(
      recovery.processStripeWebhookEvent({
        workspaceId: "ws_1",
        event: {
          id: "evt_2",
          type: "invoice.payment_failed",
          data: {
            object: {
              id: "in_2",
              amount_due: 4000,
              customer: "cus_1",
              subscription: "sub_1",
              created: 1_700_000_000,
            },
          },
        } as never,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(stripeEventUpdate).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_2" },
      data: expect.objectContaining({
        processingStatus: "failed",
      }),
    });
  });

  it("processes payment_succeeded and returns recovery_succeeded", async () => {
    const { recovery, recoveryAttemptFindUnique, recoveryAttemptUpdate, stripeEventUpdate } =
      await loadRecovery();

    recoveryAttemptFindUnique.mockResolvedValueOnce({ id: "attempt_3" });
    recoveryAttemptUpdate.mockResolvedValueOnce({
      id: "attempt_3",
      status: "recovered",
    });
    stripeEventUpdate.mockResolvedValueOnce({ id: "evt_internal" });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_3",
        type: "invoice.payment_succeeded",
        data: { object: { id: "in_3", amount_paid: 2500 } },
      } as never,
    });

    expect(result).toEqual({
      action: "recovery_succeeded",
      recoveryAttemptId: "attempt_3",
    });
    expect(stripeEventUpdate).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_3" },
      data: expect.objectContaining({
        processingStatus: "processed",
      }),
    });
  });

  it("clears at-risk subscriptions when cancel_at_period_end is true", async () => {
    const { recovery, subscriptionAtRiskDeleteMany, stripeEventUpdate } = await loadRecovery();

    stripeEventUpdate.mockResolvedValueOnce({ id: "evt_internal" });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_4",
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_1",
            customer: "cus_1",
            cancel_at_period_end: true,
            status: "active",
          },
        },
      } as never,
    });

    expect(result).toEqual({ action: "subscription_synced" });
    expect(subscriptionAtRiskDeleteMany).toHaveBeenCalledWith({
      where: { workspaceId: "ws_1", stripeSubscriptionId: "sub_1" },
    });
  });

  it("upserts at-risk subscription when subscription remains active", async () => {
    const { recovery, subscriptionAtRiskUpsert, stripeEventUpdate } = await loadRecovery();

    stripeEventUpdate.mockResolvedValueOnce({ id: "evt_internal" });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_5",
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_2",
            customer: "cus_2",
            cancel_at_period_end: false,
            status: "active",
          },
        },
      } as never,
    });

    expect(result).toEqual({ action: "subscription_synced" });
    expect(subscriptionAtRiskUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ws_1_sub_2" },
        create: expect.objectContaining({
          workspaceId: "ws_1",
          stripeSubscriptionId: "sub_2",
          stripeCustomerId: "cus_2",
        }),
      }),
    );
  });

  it("removes card_expiring risks when payment method updates", async () => {
    const { recovery, subscriptionAtRiskDeleteMany, stripeEventUpdate } = await loadRecovery();

    stripeEventUpdate.mockResolvedValueOnce({ id: "evt_internal" });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_6",
        type: "payment_method.automatically_updated",
        data: {
          object: {
            id: "pm_1",
            customer: "cus_9",
          },
        },
      } as never,
    });

    expect(result).toEqual({ action: "payment_method_updated" });
    expect(subscriptionAtRiskDeleteMany).toHaveBeenCalledWith({
      where: {
        workspaceId: "ws_1",
        stripeCustomerId: "cus_9",
        reason: "card_expiring",
      },
    });
  });

  it("returns ignored for unsupported event types", async () => {
    const { recovery, stripeEventUpdate } = await loadRecovery();

    stripeEventUpdate.mockResolvedValueOnce({ id: "evt_internal" });

    const result = await recovery.processStripeWebhookEvent({
      workspaceId: "ws_1",
      event: {
        id: "evt_7",
        type: "charge.refunded",
        data: { object: { id: "ch_1" } },
      } as never,
    });

    expect(result).toEqual({ action: "ignored" });
    expect(stripeEventUpdate).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_7" },
      data: expect.objectContaining({
        processingStatus: "processed",
      }),
    });
  });
});
