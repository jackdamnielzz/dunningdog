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

  const recovery = await import("@/lib/services/recovery");

  return {
    recovery,
    dunningSequenceFindFirst,
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

  it("processes failed invoice webhooks and marks event as processed", async () => {
    const {
      recovery,
      dunningSequenceFindFirst,
      recoveryAttemptUpsert,
      subscriptionAtRiskUpsert,
      stripeEventUpdate,
    } = await loadRecovery();

    dunningSequenceFindFirst.mockResolvedValueOnce({
      id: "seq_1",
      steps: [],
    });
    recoveryAttemptUpsert.mockResolvedValueOnce({
      id: "attempt_99",
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
          },
        },
      } as never,
    });

    expect(result).toEqual({
      action: "recovery_started",
      recoveryAttemptId: "attempt_99",
    });
    expect(stripeEventUpdate).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_1" },
      data: expect.objectContaining({
        processingStatus: "processed",
      }),
    });
  });
});
