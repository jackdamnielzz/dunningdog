import { describe, expect, it, vi } from "vitest";

const WORKSPACE_ID = "ws_test_1";

function makeAttempt(overrides?: Partial<{
  id: string;
  status: string;
  amountDueCents: number;
  recoveredAmountCents: number;
}>) {
  return {
    id: overrides?.id ?? "ra_1",
    workspaceId: WORKSPACE_ID,
    stripeInvoiceId: "in_abc",
    stripeCustomerId: "cus_abc",
    declineType: "insufficient_funds",
    status: overrides?.status ?? "pending",
    amountDueCents: overrides?.amountDueCents ?? 5000,
    recoveredAmountCents: overrides?.recoveredAmountCents ?? 0,
    startedAt: new Date("2026-02-20T10:00:00.000Z"),
    endedAt: null,
    outcomes: [
      {
        id: "out_1",
        workspaceId: WORKSPACE_ID,
        recoveryAttemptId: overrides?.id ?? "ra_1",
        outcome: "email_sent",
        reasonCode: "step_1",
        occurredAt: new Date("2026-02-21T10:00:00.000Z"),
      },
    ],
  };
}

async function loadRoute(opts?: {
  attempts?: ReturnType<typeof makeAttempt>[];
}) {
  vi.resetModules();

  const resolveWorkspaceContextFromRequest = vi.fn().mockResolvedValue({
    workspaceId: WORKSPACE_ID,
    workspaceName: "Test Workspace",
    userId: "user_1",
    source: "authenticated",
  });
  const requireScope = vi.fn();
  const ensureWorkspaceExists = vi.fn().mockResolvedValue({ id: WORKSPACE_ID });
  const getRecoveryAttempts = vi.fn().mockResolvedValue(opts?.attempts ?? []);
  const captureException = vi.fn().mockResolvedValue(undefined);

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    requireScope,
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/trial", () => ({
    requireActiveWorkspace: vi.fn().mockResolvedValue(undefined),
  }));

  vi.doMock("@/lib/services/dashboard", () => ({
    getRecoveryAttempts,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
  }));

  const route = await import("@/app/api/dashboard/recoveries/route");
  return { route, resolveWorkspaceContextFromRequest, requireScope, ensureWorkspaceExists, getRecoveryAttempts };
}

describe("GET /api/dashboard/recoveries", () => {
  it("returns recovery items with default limit", async () => {
    const attempt = makeAttempt();
    const { route, getRecoveryAttempts } = await loadRoute({ attempts: [attempt] });

    const response = await route.GET(
      new Request("http://localhost/api/dashboard/recoveries"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toHaveLength(1);
    expect(payload.nextCursor).toBeNull();
    expect(payload.items[0].attempt.id).toBe("ra_1");
    expect(payload.items[0].attempt.startedAt).toBe("2026-02-20T10:00:00.000Z");
    expect(payload.items[0].latestOutcome).not.toBeNull();
    expect(payload.items[0].latestOutcome.outcome).toBe("email_sent");
    expect(getRecoveryAttempts).toHaveBeenCalledWith(WORKSPACE_ID, 20, undefined);
  });

  it("respects custom limit param", async () => {
    const { route, getRecoveryAttempts } = await loadRoute({ attempts: [] });

    await route.GET(
      new Request("http://localhost/api/dashboard/recoveries?limit=5"),
    );

    expect(getRecoveryAttempts).toHaveBeenCalledWith(WORKSPACE_ID, 5, undefined);
  });

  it("filters by status param", async () => {
    const { route, getRecoveryAttempts } = await loadRoute({ attempts: [] });

    await route.GET(
      new Request("http://localhost/api/dashboard/recoveries?status=recovered"),
    );

    expect(getRecoveryAttempts).toHaveBeenCalledWith(WORKSPACE_ID, 20, "recovered");
  });

  it("clamps limit to max 100", async () => {
    const { route, getRecoveryAttempts } = await loadRoute({ attempts: [] });

    await route.GET(
      new Request("http://localhost/api/dashboard/recoveries?limit=999"),
    );

    expect(getRecoveryAttempts).toHaveBeenCalledWith(WORKSPACE_ID, 100, undefined);
  });

  it("returns empty items array when no recoveries", async () => {
    const { route } = await loadRoute({ attempts: [] });

    const response = await route.GET(
      new Request("http://localhost/api/dashboard/recoveries"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([]);
    expect(payload.nextCursor).toBeNull();
  });
});
