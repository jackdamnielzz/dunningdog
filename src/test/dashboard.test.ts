import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startOfMonth, subDays } from "date-fns";

async function loadDashboard() {
  vi.resetModules();

  const recoveryAggregate = vi.fn();
  const atRiskCount = vi.fn();
  const pendingCount = vi.fn();
  const findMany = vi.fn();
  const isDatabaseUnavailableError = vi.fn(() => false);
  const describeFailure = vi.fn(() => "db unavailable");
  const log = vi.fn();
  const getDemoDashboardSummary = vi.fn((workspaceId: string, window: string) => ({
    workspaceId,
    window,
    failedRevenueCents: 12800,
    recoveredRevenueCents: 6400,
    recoveryRate: 50,
    atRiskCount: 3,
    activeSequences: 1,
    generatedAt: new Date("2026-02-25T12:00:00.000Z").toISOString(),
  }));
  const getDemoRecoveryAttempts = vi.fn(() => [
    { id: "demo_1", status: "failed", outcomes: [] },
    { id: "demo_2", status: "pending", outcomes: [] },
  ]);

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        aggregate: recoveryAggregate,
        count: pendingCount,
        findMany,
      },
      subscriptionAtRisk: {
        count: atRiskCount,
      },
    },
  }));

  vi.doMock("@/lib/runtime-fallback", () => ({
    isDatabaseUnavailableError,
    describeFailure,
  }));

  vi.doMock("@/lib/logger", () => ({
    log,
  }));

  vi.doMock("@/lib/demo-data", () => ({
    getDemoDashboardSummary,
    getDemoRecoveryAttempts,
  }));

  const dashboard = await import("@/lib/services/dashboard");
  return {
    dashboard,
    recoveryAggregate,
    atRiskCount,
    pendingCount,
    findMany,
    isDatabaseUnavailableError,
    describeFailure,
    log,
    getDemoDashboardSummary,
    getDemoRecoveryAttempts,
  };
}

describe("dashboard service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-25T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes summary metrics from aggregates", async () => {
    const { dashboard, recoveryAggregate, atRiskCount, pendingCount } =
      await loadDashboard();

    recoveryAggregate
      .mockResolvedValueOnce({
        _sum: { amountDueCents: 10000 },
      })
      .mockResolvedValueOnce({
        _sum: { recoveredAmountCents: 6200 },
      });
    atRiskCount.mockResolvedValueOnce(3);
    pendingCount.mockResolvedValueOnce(4);

    const summary = await dashboard.getDashboardSummary("ws_1", "month");

    expect(summary.failedRevenueCents).toBe(10000);
    expect(summary.recoveredRevenueCents).toBe(6200);
    expect(summary.recoveryRate).toBe(62);
    expect(summary.atRiskCount).toBe(3);
    expect(summary.activeSequences).toBe(4);
  });

  it("uses correct date boundaries for each summary window", async () => {
    const { dashboard, recoveryAggregate, atRiskCount, pendingCount } =
      await loadDashboard();

    recoveryAggregate.mockResolvedValue({
      _sum: { amountDueCents: 0, recoveredAmountCents: 0 },
    });
    atRiskCount.mockResolvedValue(0);
    pendingCount.mockResolvedValue(0);

    const now = new Date("2026-02-25T12:00:00.000Z");
    const windows = [
      { window: "7d" as const, expected: subDays(now, 7) },
      { window: "30d" as const, expected: subDays(now, 30) },
      { window: "90d" as const, expected: subDays(now, 90) },
      { window: "lifetime" as const, expected: new Date(0) },
      { window: "month" as const, expected: startOfMonth(now) },
    ];

    for (const item of windows) {
      await dashboard.getDashboardSummary("ws_1", item.window);
      const firstAggregateForCall = recoveryAggregate.mock.calls.at(-2)?.[0];
      const gte = firstAggregateForCall?.where?.startedAt?.gte as Date;
      expect(gte.toISOString()).toBe(item.expected.toISOString());
    }
  });

  it("returns filtered recoveries with status", async () => {
    const { dashboard, findMany } = await loadDashboard();
    findMany.mockResolvedValueOnce([
      {
        id: "rec_1",
        status: "pending",
        outcomes: [],
      },
    ]);

    const records = await dashboard.getRecoveryAttempts("ws_1", 20, "pending");

    expect(records).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: "ws_1",
          status: "pending",
        }),
      }),
    );
  });

  it("falls back to demo summary when DB is unavailable", async () => {
    const {
      dashboard,
      recoveryAggregate,
      isDatabaseUnavailableError,
      getDemoDashboardSummary,
      log,
    } = await loadDashboard();

    recoveryAggregate.mockRejectedValueOnce(new Error("db down"));
    isDatabaseUnavailableError.mockReturnValueOnce(true);

    const summary = await dashboard.getDashboardSummary("ws_1", "7d");

    expect(getDemoDashboardSummary).toHaveBeenCalledWith("ws_1", "7d");
    expect(summary.workspaceId).toBe("ws_1");
    expect(summary.window).toBe("7d");
    expect(log).toHaveBeenCalledWith(
      "warn",
      "Using demo dashboard summary due to database connectivity issue",
      expect.objectContaining({
        workspaceId: "ws_1",
      }),
    );
  });

  it("throws summary errors when they are not database-availability failures", async () => {
    const { dashboard, recoveryAggregate, isDatabaseUnavailableError } =
      await loadDashboard();

    recoveryAggregate.mockRejectedValueOnce(new Error("broken query"));
    isDatabaseUnavailableError.mockReturnValueOnce(false);

    await expect(dashboard.getDashboardSummary("ws_1", "month")).rejects.toThrow(
      "broken query",
    );
  });

  it("falls back to demo recovery attempts when DB is unavailable", async () => {
    const {
      dashboard,
      findMany,
      isDatabaseUnavailableError,
      getDemoRecoveryAttempts,
      log,
    } = await loadDashboard();

    findMany.mockRejectedValueOnce(new Error("db down"));
    isDatabaseUnavailableError.mockReturnValueOnce(true);
    getDemoRecoveryAttempts.mockReturnValueOnce([
      { id: "demo_1", status: "failed", outcomes: [] },
      { id: "demo_2", status: "pending", outcomes: [] },
    ]);

    const attempts = await dashboard.getRecoveryAttempts("ws_1", 1, "failed");

    expect(attempts).toEqual([{ id: "demo_1", status: "failed", outcomes: [] }]);
    expect(log).toHaveBeenCalledWith(
      "warn",
      "Using demo recovery attempts due to database connectivity issue",
      expect.objectContaining({
        workspaceId: "ws_1",
        status: "failed",
        limit: 1,
      }),
    );
  });

  it("throws recovery list errors when they are not database-availability failures", async () => {
    const { dashboard, findMany, isDatabaseUnavailableError } = await loadDashboard();

    findMany.mockRejectedValueOnce(new Error("broken query"));
    isDatabaseUnavailableError.mockReturnValueOnce(false);

    await expect(dashboard.getRecoveryAttempts("ws_1")).rejects.toThrow("broken query");
  });
});
