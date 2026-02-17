import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadDashboard() {
  vi.resetModules();

  const recoveryAggregate = vi.fn();
  const atRiskCount = vi.fn();
  const pendingCount = vi.fn();
  const findMany = vi.fn();

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

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const dashboard = await import("@/lib/services/dashboard");
  return {
    dashboard,
    recoveryAggregate,
    atRiskCount,
    pendingCount,
    findMany,
  };
}

describe("dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
