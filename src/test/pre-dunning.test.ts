import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadPreDunning(isDemoMode: boolean) {
  vi.resetModules();

  const findManyMock = vi.fn();
  const upsertMock = vi.fn().mockResolvedValue({
    id: "ws_1_demo_predunning",
    workspaceId: "ws_1",
    reason: "card_expiring",
  });

  vi.doMock("@/lib/db", () => ({
    db: {
      subscriptionAtRisk: {
        findMany: findManyMock,
        upsert: upsertMock,
      },
    },
  }));

  vi.doMock("@/lib/env", () => ({
    isDemoMode,
    env: {
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://localhost/dunningdog",
      RESEND_FROM_EMAIL: "billing@dunningdog.com",
      POSTHOG_HOST: "https://eu.i.posthog.com",
      ENCRYPTION_KEY: "development-only-encryption-key",
    },
  }));

  const preDunning = await import("@/lib/services/preDunning");
  return {
    preDunning,
    findManyMock,
    upsertMock,
  };
}

describe("pre-dunning service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only entries expiring within the threshold window", async () => {
    const { preDunning, findManyMock } = await loadPreDunning(false);
    findManyMock.mockResolvedValueOnce([
      {
        id: "risk_1",
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "risk_2",
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    const results = await preDunning.runPreDunningScan("ws_1");
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("risk_1");
  });

  it("creates a demo at-risk record when no candidates exist in demo mode", async () => {
    const { preDunning, findManyMock, upsertMock } = await loadPreDunning(true);
    findManyMock.mockResolvedValueOnce([]);

    const results = await preDunning.runPreDunningScan("ws_1");
    expect(results).toHaveLength(1);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });
});
