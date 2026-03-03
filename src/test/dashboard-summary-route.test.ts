import { describe, expect, it, vi } from "vitest";

const SNAPSHOT = {
  id: "snap_1",
  workspaceId: "ws_test_123",
  periodStart: new Date("2025-06-01"),
  periodEnd: new Date("2025-06-30"),
  failedRevenueCents: 50000,
  recoveredRevenueCents: 35000,
  recoveryRate: 0.7,
  atRiskCount: 3,
  generatedAt: new Date("2025-06-30T12:00:00Z"),
};

const AT_RISK_ITEMS = [
  {
    id: "risk_1",
    workspaceId: "ws_test_123",
    stripeCustomerId: "cus_abc",
    stripeSubscriptionId: "sub_abc",
    reason: "payment_failed",
    riskDetectedAt: new Date("2025-06-15"),
    expirationDate: new Date("2025-07-15"),
    activeRecoveryAttemptId: "ra_1",
  },
  {
    id: "risk_2",
    workspaceId: "ws_test_123",
    stripeCustomerId: "cus_def",
    stripeSubscriptionId: "sub_def",
    reason: "payment_failed",
    riskDetectedAt: new Date("2025-06-10"),
    expirationDate: null,
    activeRecoveryAttemptId: null,
  },
];

const SUMMARY = {
  window: "month" as const,
  failedRevenueCents: 50000,
  recoveredRevenueCents: 35000,
  recoveryRate: 0.7,
  atRiskCount: 3,
  activeSequences: 2,
  recentRecoveries: [],
};

type LoadOptions = {
  latestSnapshot?: typeof SNAPSHOT | null;
  atRiskPreview?: typeof AT_RISK_ITEMS;
  summaryOverrides?: Partial<Omit<typeof SUMMARY, "window">> & { window?: string };
};

async function loadRoute(options: LoadOptions = {}) {
  vi.resetModules();

  const getWorkspaceIdFromRequest = vi.fn().mockResolvedValue("ws_test_123");
  const ensureWorkspaceExists = vi.fn().mockResolvedValue({
    id: "ws_test_123",
    name: "Test Workspace",
    ownerUserId: "user_1",
    timezone: "UTC",
    billingPlan: "starter",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  });

  const getDashboardSummary = vi.fn().mockResolvedValue({
    ...SUMMARY,
    ...options.summaryOverrides,
  });

  const findFirst = vi
    .fn()
    .mockResolvedValue(options.latestSnapshot === undefined ? SNAPSHOT : options.latestSnapshot);
  const findMany = vi
    .fn()
    .mockResolvedValue(options.atRiskPreview ?? AT_RISK_ITEMS);

  vi.doMock("@/lib/auth", () => ({
    getWorkspaceIdFromRequest,
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/trial", () => ({
    requireActiveWorkspace: vi.fn().mockResolvedValue(undefined),
  }));

  vi.doMock("@/lib/services/dashboard", () => ({
    getDashboardSummary,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      metricSnapshot: {
        findFirst,
      },
      subscriptionAtRisk: {
        findMany,
      },
    },
  }));

  const route = await import("@/app/api/dashboard/summary/route");
  return {
    route,
    getWorkspaceIdFromRequest,
    ensureWorkspaceExists,
    getDashboardSummary,
    findFirst,
    findMany,
  };
}

describe("dashboard summary route", () => {
  it("returns summary with metrics for default window", async () => {
    const { route, getDashboardSummary } = await loadRoute();
    const response = await route.GET(
      new Request("http://localhost/api/dashboard/summary?workspaceId=ws_test_123"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.window).toBe("month");
    expect(payload.failedRevenueCents).toBe(50000);
    expect(payload.recoveredRevenueCents).toBe(35000);
    expect(payload.recoveryRate).toBe(0.7);
    expect(getDashboardSummary).toHaveBeenCalledWith("ws_test_123", "month");
  });

  it("returns summary with custom window param (7d)", async () => {
    const { route, getDashboardSummary } = await loadRoute({
      summaryOverrides: { window: "7d" },
    });
    const response = await route.GET(
      new Request("http://localhost/api/dashboard/summary?workspaceId=ws_test_123&window=7d"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.window).toBe("7d");
    expect(getDashboardSummary).toHaveBeenCalledWith("ws_test_123", "7d");
  });

  it("includes latestSnapshot when available", async () => {
    const { route } = await loadRoute({ latestSnapshot: SNAPSHOT });
    const response = await route.GET(
      new Request("http://localhost/api/dashboard/summary?workspaceId=ws_test_123"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.latestSnapshot).not.toBeNull();
    expect(payload.latestSnapshot.id).toBe("snap_1");
    expect(payload.latestSnapshot.failedRevenueCents).toBe(50000);
    expect(payload.latestSnapshot.recoveredRevenueCents).toBe(35000);
    expect(payload.latestSnapshot.recoveryRate).toBe(0.7);
    expect(payload.latestSnapshot.periodStart).toBe(SNAPSHOT.periodStart.toISOString());
    expect(payload.latestSnapshot.generatedAt).toBe(SNAPSHOT.generatedAt.toISOString());
  });

  it("returns null latestSnapshot when none exists", async () => {
    const { route } = await loadRoute({ latestSnapshot: null });
    const response = await route.GET(
      new Request("http://localhost/api/dashboard/summary?workspaceId=ws_test_123"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.latestSnapshot).toBeNull();
  });

  it("includes atRiskPreview array", async () => {
    const { route } = await loadRoute({ atRiskPreview: AT_RISK_ITEMS });
    const response = await route.GET(
      new Request("http://localhost/api/dashboard/summary?workspaceId=ws_test_123"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.atRiskPreview).toHaveLength(2);
    expect(payload.atRiskPreview[0].id).toBe("risk_1");
    expect(payload.atRiskPreview[0].stripeCustomerId).toBe("cus_abc");
    expect(payload.atRiskPreview[0].reason).toBe("payment_failed");
    expect(payload.atRiskPreview[0].riskDetectedAt).toBe(AT_RISK_ITEMS[0].riskDetectedAt.toISOString());
    expect(payload.atRiskPreview[1].id).toBe("risk_2");
    expect(payload.atRiskPreview[1].expirationDate).toBeNull();
    expect(payload.atRiskPreview[1].activeRecoveryAttemptId).toBeNull();
  });
});
