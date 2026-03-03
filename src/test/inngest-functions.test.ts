import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- helpers --------------------------------------------------- */

function createStepMock() {
  return {
    run: vi.fn(async (_name: string, fn: () => Promise<unknown>) => fn()),
    sleep: vi.fn(async () => {}),
  };
}

/**
 * A minimal stand-in for `inngest.createFunction`.
 * It captures the handler so we can invoke it directly in tests.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
let capturedHandlers: Map<string, Function>;

function createInngestMock() {
  capturedHandlers = new Map();
  return {
    createFunction: vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (config: { id: string }, _trigger: unknown, handler: Function) => {
        capturedHandlers.set(config.id, handler);
        return { id: config.id, handler };
      },
    ),
  };
}

/* ---------- module loader --------------------------------------------- */

async function loadFunctions(deps: {
  recoveryAttemptFindUnique?: ReturnType<typeof vi.fn>;
  recoveryAttemptUpdate?: ReturnType<typeof vi.fn>;
  dunningSequenceFindFirst?: ReturnType<typeof vi.fn>;
  sendDunningEmail?: ReturnType<typeof vi.fn>;
  resolveCustomerEmail?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const inngestMock = createInngestMock();

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: inngestMock,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        findUnique: deps.recoveryAttemptFindUnique ?? vi.fn(),
        update: deps.recoveryAttemptUpdate ?? vi.fn(),
      },
      dunningSequence: {
        findFirst: deps.dunningSequenceFindFirst ?? vi.fn(),
      },
      workspace: {
        findUnique: vi.fn().mockResolvedValue({ billingStatus: "active", trialEndsAt: null }),
      },
      notificationChannel: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      paymentUpdateToken: {
        create: vi.fn().mockResolvedValue({ id: "pt_mock" }),
      },
    },
  }));

  vi.doMock("@/lib/services/email", () => ({
    sendDunningEmail: deps.sendDunningEmail ?? vi.fn(),
  }));

  vi.doMock("@/lib/services/customer-email", () => ({
    resolveCustomerEmail: deps.resolveCustomerEmail ?? vi.fn(),
  }));

  vi.doMock("@/lib/services/payment-tokens", () => ({
    generatePaymentUpdateToken: vi.fn().mockResolvedValue({
      token: "mock_token",
      url: "https://app.test/update-payment/mock_token",
    }),
  }));

  vi.doMock("@/lib/services/notifications", () => ({
    sendNotification: vi.fn().mockResolvedValue(undefined),
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  // Importing the module triggers `createFunction` for each export.
  await import("@/inngest/functions");

  return {
    inngestMock,
    getHandler: (id: string) => {
      const handler = capturedHandlers.get(id);
      if (!handler) throw new Error(`Handler "${id}" not registered`);
      return handler;
    },
    sendDunningEmail: deps.sendDunningEmail!,
    resolveCustomerEmail: deps.resolveCustomerEmail!,
    recoveryAttemptFindUnique: deps.recoveryAttemptFindUnique!,
    recoveryAttemptUpdate: deps.recoveryAttemptUpdate!,
    dunningSequenceFindFirst: deps.dunningSequenceFindFirst!,
  };
}

/* ====================================================================== */
/*  recoveryStartedFunction                                               */
/* ====================================================================== */

describe("recoveryStartedFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEventData = {
    workspaceId: "ws_1",
    recoveryAttemptId: "ra_1",
    stripeCustomerId: "cus_1",
    customerEmail: "hint@example.com",
  };

  it("skips when recovery attempt not found", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ skipped: true, reason: "attempt_not_found" });
    expect(step.run).toHaveBeenCalledWith("load-recovery-attempt", expect.any(Function));
  });

  it("skips when no enabled sequence exists", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: "ra_1", status: "pending" });
    const findFirst = vi.fn().mockResolvedValue(null);
    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ skipped: true, reason: "sequence_not_found" });
  });

  it("skips when sequence has no steps", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: "ra_1", status: "pending" });
    const findFirst = vi.fn().mockResolvedValue({ id: "seq_1", steps: [] });
    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ skipped: true, reason: "sequence_not_found" });
  });

  it("sends email for each step in sequence", async () => {
    const sequenceSteps = [
      {
        id: "ss_1",
        stepOrder: 1,
        delayHours: 0,
        subjectTemplate: "Subject 1",
        bodyTemplate: "Body 1",
      },
      {
        id: "ss_2",
        stepOrder: 2,
        delayHours: 24,
        subjectTemplate: "Subject 2",
        bodyTemplate: "Body 2",
      },
    ];

    const findUnique = vi.fn().mockResolvedValue({
      id: "ra_1",
      status: "pending",
      stripeCustomerId: "cus_1",
    });
    const findFirst = vi.fn().mockResolvedValue({
      id: "seq_1",
      steps: sequenceSteps,
    });
    const resolveEmail = vi.fn().mockResolvedValue("resolved@example.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ deliveredSteps: 2 });

    // Step 1 has delayHours 0 so no sleep, step 2 has delayHours 24 so sleep is called.
    expect(step.sleep).toHaveBeenCalledTimes(1);
    expect(step.sleep).toHaveBeenCalledWith("delay-step-2", "24h");

    // sendDunningEmail called once per step
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        toEmail: "resolved@example.com",
        subject: "Subject 1",
        body: "Body 1",
        templateKey: "sequence_seq_1_step_1",
        metadata: {
          sequenceId: "seq_1",
          sequenceStepId: "ss_1",
          stepOrder: 1,
        },
      }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        toEmail: "resolved@example.com",
        subject: "Subject 2",
        body: "Body 2",
        templateKey: "sequence_seq_1_step_2",
        metadata: {
          sequenceId: "seq_1",
          sequenceStepId: "ss_2",
          stepOrder: 2,
        },
      }),
    );
  });

  it("stops early when attempt status changes from pending", async () => {
    const sequenceSteps = [
      {
        id: "ss_1",
        stepOrder: 1,
        delayHours: 0,
        subjectTemplate: "Subject 1",
        bodyTemplate: "Body 1",
      },
      {
        id: "ss_2",
        stepOrder: 2,
        delayHours: 0,
        subjectTemplate: "Subject 2",
        bodyTemplate: "Body 2",
      },
    ];

    // First call: load-recovery-attempt (returns pending)
    // Second call: refresh-attempt-1 (returns pending)
    // Third call: refresh-attempt-2 (returns recovered -> stops)
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ id: "ra_1", status: "pending", stripeCustomerId: "cus_1" })
      .mockResolvedValueOnce({ id: "ra_1", status: "pending", stripeCustomerId: "cus_1" })
      .mockResolvedValueOnce({ id: "ra_1", status: "recovered", stripeCustomerId: "cus_1" });

    const findFirst = vi.fn().mockResolvedValue({
      id: "seq_1",
      steps: sequenceSteps,
    });
    const resolveEmail = vi.fn().mockResolvedValue("resolved@example.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({
      stopped: true,
      reason: "attempt_not_pending",
      atStep: 2,
    });

    // Only the first step's email should have been sent
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(resolveEmail).toHaveBeenCalledTimes(1);
  });

  it("stops when trial is expired", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: {
          findUnique: vi.fn().mockResolvedValue({ id: "ra_1", status: "pending" }),
        },
        dunningSequence: {
          findFirst: vi.fn().mockResolvedValue({
            id: "seq_1",
            steps: [{ id: "ss_1", stepOrder: 1, delayHours: 0, subjectTemplate: "S", bodyTemplate: "B" }],
          }),
        },
        workspace: {
          findUnique: vi.fn().mockResolvedValue({
            billingStatus: "free",
            trialEndsAt: new Date(Date.now() - 86_400_000), // expired yesterday
          }),
        },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn().mockResolvedValue({ id: "pt_mock" }) },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: vi.fn() }));
    vi.doMock("@/lib/services/customer-email", () => ({ resolveCustomerEmail: vi.fn() }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn().mockResolvedValue({ token: "t", url: "u" }),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification: vi.fn() }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("recovery-started-sequence")!;
    const step = createStepMock();

    const result = await handler({ event: { data: baseEventData }, step });

    expect(result).toEqual({ stopped: true, reason: "trial_expired", atStep: 1 });
  });

  it("continues when trial is still active", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });
    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: {
          findUnique: vi.fn().mockResolvedValue({ id: "ra_1", status: "pending", stripeCustomerId: "cus_1" }),
        },
        dunningSequence: {
          findFirst: vi.fn().mockResolvedValue({
            id: "seq_1",
            steps: [{ id: "ss_1", stepOrder: 1, delayHours: 0, subjectTemplate: "S", bodyTemplate: "B" }],
          }),
        },
        workspace: {
          findUnique: vi.fn().mockResolvedValue({
            billingStatus: "free",
            trialEndsAt: new Date(Date.now() + 5 * 86_400_000), // 5 days left
          }),
        },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn().mockResolvedValue({ id: "pt_mock" }) },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: sendEmail }));
    vi.doMock("@/lib/services/customer-email", () => ({
      resolveCustomerEmail: vi.fn().mockResolvedValue("user@test.com"),
    }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn().mockResolvedValue({ token: "t", url: "https://app/update/t" }),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification: vi.fn() }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("recovery-started-sequence")!;
    const step = createStepMock();

    const result = await handler({ event: { data: baseEventData }, step });

    expect(result).toEqual({ deliveredSteps: 1 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("stops when attempt is deleted mid-run (null from refresh)", async () => {
    const sequenceSteps = [
      { id: "ss_1", stepOrder: 1, delayHours: 0, subjectTemplate: "S1", bodyTemplate: "B1" },
    ];

    // First call: load-recovery-attempt (returns pending)
    // Second call: refresh-attempt-1 (returns null = deleted)
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ id: "ra_1", status: "pending", stripeCustomerId: "cus_1" })
      .mockResolvedValueOnce(null);

    const findFirst = vi.fn().mockResolvedValue({ id: "seq_1", steps: sequenceSteps });
    const sendEmail = vi.fn();

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({ event: { data: baseEventData }, step });

    expect(result).toEqual({ stopped: true, reason: "attempt_not_pending", atStep: 1 });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("passes payment update URL to email send", async () => {
    const sequenceSteps = [
      { id: "ss_1", stepOrder: 1, delayHours: 0, subjectTemplate: "S", bodyTemplate: "B" },
    ];

    const findUnique = vi.fn().mockResolvedValue({
      id: "ra_1", status: "pending", stripeCustomerId: "cus_1",
    });
    const findFirst = vi.fn().mockResolvedValue({ id: "seq_1", steps: sequenceSteps });
    const resolveEmail = vi.fn().mockResolvedValue("user@test.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentUpdateUrl: "https://app.test/update-payment/mock_token",
      }),
    );
  });

  it("calls sleep with correct duration format for multi-step delays", async () => {
    const sequenceSteps = [
      { id: "ss_1", stepOrder: 1, delayHours: 0, subjectTemplate: "S1", bodyTemplate: "B1" },
      { id: "ss_2", stepOrder: 2, delayHours: 72, subjectTemplate: "S2", bodyTemplate: "B2" },
      { id: "ss_3", stepOrder: 3, delayHours: 168, subjectTemplate: "S3", bodyTemplate: "B3" },
    ];

    const findUnique = vi.fn().mockResolvedValue({
      id: "ra_1", status: "pending", stripeCustomerId: "cus_1",
    });
    const findFirst = vi.fn().mockResolvedValue({ id: "seq_1", steps: sequenceSteps });
    const resolveEmail = vi.fn().mockResolvedValue("u@test.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({ event: { data: baseEventData }, step });

    expect(result).toEqual({ deliveredSteps: 3 });
    // Step 1: no sleep (delayHours 0)
    // Step 2: sleep 72h
    // Step 3: sleep 168h
    expect(step.sleep).toHaveBeenCalledTimes(2);
    expect(step.sleep).toHaveBeenCalledWith("delay-step-2", "72h");
    expect(step.sleep).toHaveBeenCalledWith("delay-step-3", "168h");
    expect(sendEmail).toHaveBeenCalledTimes(3);
  });

  it("handles missing customer email (logs skip, continues to next step)", async () => {
    const sequenceSteps = [
      {
        id: "ss_1",
        stepOrder: 1,
        delayHours: 0,
        subjectTemplate: "Subject 1",
        bodyTemplate: "Body 1",
      },
      {
        id: "ss_2",
        stepOrder: 2,
        delayHours: 0,
        subjectTemplate: "Subject 2",
        bodyTemplate: "Body 2",
      },
    ];

    const findUnique = vi.fn().mockResolvedValue({
      id: "ra_1",
      status: "pending",
      stripeCustomerId: "cus_1",
    });
    const findFirst = vi.fn().mockResolvedValue({
      id: "seq_1",
      steps: sequenceSteps,
    });
    // First step: no email; second step: email resolves
    const resolveEmail = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("found@example.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      dunningSequenceFindFirst: findFirst,
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("recovery-started-sequence");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ deliveredSteps: 2 });

    // sendDunningEmail called twice: once to log skip, once to actually send
    expect(sendEmail).toHaveBeenCalledTimes(2);

    // First call: skip log with undefined toEmail and skippedByWorkflow metadata
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        toEmail: undefined,
        subject: "Subject 1",
        body: "Body 1",
        templateKey: "sequence_seq_1_step_1",
        metadata: {
          sequenceId: "seq_1",
          sequenceStepId: "ss_1",
          stepOrder: 1,
          skippedByWorkflow: true,
          skipReason: "missing_customer_email",
        },
      }),
    );

    // Second call: actual send with resolved email
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        toEmail: "found@example.com",
        subject: "Subject 2",
        body: "Body 2",
        templateKey: "sequence_seq_1_step_2",
        metadata: {
          sequenceId: "seq_1",
          sequenceStepId: "ss_2",
          stepOrder: 2,
        },
      }),
    );
  });
});

/* ====================================================================== */
/*  recoverySucceededFunction                                             */
/* ====================================================================== */

describe("recoverySucceededFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEventData = {
    workspaceId: "ws_1",
    stripeInvoiceId: "inv_1",
  };

  it("marks attempt as recovered", async () => {
    const updatedAttempt = {
      id: "ra_1",
      status: "recovered",
      endedAt: new Date(),
    };
    const findUnique = vi.fn().mockResolvedValue({
      id: "ra_1",
      status: "pending",
    });
    const update = vi.fn().mockResolvedValue(updatedAttempt);

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      recoveryAttemptUpdate: update,
    });

    const handler = getHandler("recovery-succeeded-finalize");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ done: true });
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_stripeInvoiceId: {
          workspaceId: "ws_1",
          stripeInvoiceId: "inv_1",
        },
      },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "ra_1" },
      data: {
        status: "recovered",
        endedAt: expect.any(Date),
      },
    });
  });

  it("returns null when attempt not found", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const update = vi.fn();

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      recoveryAttemptUpdate: update,
    });

    const handler = getHandler("recovery-succeeded-finalize");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    // step.run returns whatever the inner fn returns; the inner fn returns null.
    // The outer function still returns { done: true }.
    expect(result).toEqual({ done: true });
    expect(update).not.toHaveBeenCalled();
  });

  it("no-ops when attempt already recovered", async () => {
    const existingAttempt = {
      id: "ra_1",
      status: "recovered",
      endedAt: new Date(),
    };
    const findUnique = vi.fn().mockResolvedValue(existingAttempt);
    const update = vi.fn();

    const { getHandler } = await loadFunctions({
      recoveryAttemptFindUnique: findUnique,
      recoveryAttemptUpdate: update,
    });

    const handler = getHandler("recovery-succeeded-finalize");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ done: true });
    expect(update).not.toHaveBeenCalled();
  });

  it("sends notification after closing recovery", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const closedAttempt = {
      id: "ra_1",
      status: "recovered",
      amountDueCents: 4999,
      recoveredAmountCents: 4999,
      endedAt: new Date(),
    };

    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: {
          findUnique: vi.fn().mockResolvedValue({ id: "ra_1", status: "pending" }),
          update: vi.fn().mockResolvedValue(closedAttempt),
        },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: vi.fn() }));
    vi.doMock("@/lib/services/customer-email", () => ({ resolveCustomerEmail: vi.fn() }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("recovery-succeeded-finalize")!;
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendNotification).toHaveBeenCalledWith({
      workspaceId: "ws_1",
      event: "recovery_succeeded",
      data: {
        stripeInvoiceId: "inv_1",
        recoveredAmountCents: 4999,
      },
    });
  });

  it("does not send notification when attempt not found", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendNotification = vi.fn();

    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: vi.fn() }));
    vi.doMock("@/lib/services/customer-email", () => ({ resolveCustomerEmail: vi.fn() }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("recovery-succeeded-finalize")!;
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("uses recoveredAmountCents when available, falls back to amountDueCents", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const closedAttempt = {
      id: "ra_1",
      status: "recovered",
      amountDueCents: 9999,
      recoveredAmountCents: null,
      endedAt: new Date(),
    };

    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: {
          findUnique: vi.fn().mockResolvedValue({ id: "ra_1", status: "pending" }),
          update: vi.fn().mockResolvedValue(closedAttempt),
        },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: vi.fn() }));
    vi.doMock("@/lib/services/customer-email", () => ({ resolveCustomerEmail: vi.fn() }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("recovery-succeeded-finalize")!;
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recoveredAmountCents: 9999,
        }),
      }),
    );
  });
});

/* ====================================================================== */
/*  preDunningCandidateFunction                                           */
/* ====================================================================== */

describe("preDunningCandidateFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEventData = {
    workspaceId: "ws_1",
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    expirationDate: "2026-03-15",
  };

  it("sends pre-dunning email when email is resolvable", async () => {
    const resolveEmail = vi.fn().mockResolvedValue("customer@example.com");
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("predunning-candidate-notify");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ sent: true, skipped: false });
    expect(resolveEmail).toHaveBeenCalledWith({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
      invoiceEmailHint: null,
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        toEmail: "customer@example.com",
        subject: "Heads up: your card will expire soon",
        body: "Your payment method for subscription sub_1 is expected to expire around 2026-03-15. Please update it to avoid service interruption.",
        templateKey: "predunning_default",
        metadata: {
          stripeCustomerId: "cus_1",
          stripeSubscriptionId: "sub_1",
          expirationDate: "2026-03-15",
        },
      }),
    );
  });

  it("skips sending when no email found", async () => {
    const resolveEmail = vi.fn().mockResolvedValue(null);
    const sendEmail = vi.fn().mockResolvedValue({ id: "log_1" });

    const { getHandler } = await loadFunctions({
      resolveCustomerEmail: resolveEmail,
      sendDunningEmail: sendEmail,
    });

    const handler = getHandler("predunning-candidate-notify");
    const step = createStepMock();

    const result = await handler({
      event: { data: baseEventData },
      step,
    });

    expect(result).toEqual({ sent: false, skipped: true, reason: "missing_customer_email" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_1",
        toEmail: undefined,
        subject: "Heads up: your card will expire soon",
        templateKey: "predunning_default",
        metadata: {
          stripeCustomerId: "cus_1",
          stripeSubscriptionId: "sub_1",
          expirationDate: "2026-03-15",
          skippedByWorkflow: true,
          skipReason: "missing_customer_email",
        },
      }),
    );
  });

  it("sends notification after successful pre-dunning email", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendNotification = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: { findUnique: vi.fn(), update: vi.fn() },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({
      sendDunningEmail: vi.fn().mockResolvedValue({ id: "log_1" }),
    }));
    vi.doMock("@/lib/services/customer-email", () => ({
      resolveCustomerEmail: vi.fn().mockResolvedValue("cust@test.com"),
    }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("predunning-candidate-notify")!;
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendNotification).toHaveBeenCalledWith({
      workspaceId: "ws_1",
      event: "predunning_sent",
      data: {
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
        expirationDate: "2026-03-15",
      },
    });
  });

  it("does not send notification when email is skipped", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    const sendNotification = vi.fn();

    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: { findUnique: vi.fn(), update: vi.fn() },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({
      sendDunningEmail: vi.fn().mockResolvedValue({ id: "log_1" }),
    }));
    vi.doMock("@/lib/services/customer-email", () => ({
      resolveCustomerEmail: vi.fn().mockResolvedValue(null),
    }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    await import("@/inngest/functions");
    const handler = capturedHandlers.get("predunning-candidate-notify")!;
    const step = createStepMock();

    await handler({ event: { data: baseEventData }, step });

    expect(sendNotification).not.toHaveBeenCalled();
  });
});

/* ====================================================================== */
/*  inngestFunctions export                                                */
/* ====================================================================== */

describe("inngestFunctions export", () => {
  it("exports exactly 3 registered functions", async () => {
    vi.resetModules();

    const inngestMock = createInngestMock();
    vi.doMock("@/lib/inngest/client", () => ({ inngest: inngestMock }));
    vi.doMock("@/lib/db", () => ({
      db: {
        recoveryAttempt: { findUnique: vi.fn(), update: vi.fn() },
        dunningSequence: { findFirst: vi.fn() },
        workspace: { findUnique: vi.fn() },
        notificationChannel: { findMany: vi.fn().mockResolvedValue([]) },
        paymentUpdateToken: { create: vi.fn() },
      },
    }));
    vi.doMock("@/lib/services/email", () => ({ sendDunningEmail: vi.fn() }));
    vi.doMock("@/lib/services/customer-email", () => ({ resolveCustomerEmail: vi.fn() }));
    vi.doMock("@/lib/services/payment-tokens", () => ({
      generatePaymentUpdateToken: vi.fn(),
    }));
    vi.doMock("@/lib/services/notifications", () => ({ sendNotification: vi.fn() }));
    vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));

    const mod = await import("@/inngest/functions");

    expect(mod.inngestFunctions).toHaveLength(3);
    expect(inngestMock.createFunction).toHaveBeenCalledTimes(3);

    const registeredIds = [...capturedHandlers.keys()];
    expect(registeredIds).toContain("recovery-started-sequence");
    expect(registeredIds).toContain("recovery-succeeded-finalize");
    expect(registeredIds).toContain("predunning-candidate-notify");
  });
});
