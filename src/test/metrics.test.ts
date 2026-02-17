import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadMetrics() {
  vi.resetModules();

  const aggregateMock = vi.fn();
  const atRiskCountMock = vi.fn();
  const upsertMock = vi.fn().mockResolvedValue({
    id: "metric_1",
    recoveryRate: 50,
  });

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        aggregate: aggregateMock,
      },
      subscriptionAtRisk: {
        count: atRiskCountMock,
      },
      metricSnapshot: {
        upsert: upsertMock,
      },
    },
  }));

  const metrics = await import("@/lib/services/metrics");
  return {
    metrics,
    aggregateMock,
    atRiskCountMock,
    upsertMock,
  };
}

describe("metrics service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a monthly snapshot with computed recovery rate", async () => {
    const { metrics, aggregateMock, atRiskCountMock, upsertMock } = await loadMetrics();

    aggregateMock
      .mockResolvedValueOnce({ _sum: { amountDueCents: 4000 } })
      .mockResolvedValueOnce({ _sum: { recoveredAmountCents: 1000 } });
    atRiskCountMock.mockResolvedValueOnce(2);

    await metrics.generateCurrentMonthSnapshot("ws_1");

    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          workspaceId: "ws_1",
          failedRevenueCents: 4000,
          recoveredRevenueCents: 1000,
          recoveryRate: 25,
          atRiskCount: 2,
        }),
      }),
    );
  });
});
