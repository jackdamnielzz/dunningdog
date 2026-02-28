import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  const resolveWorkspaceContextFromRequest = vi.fn().mockResolvedValue({
    workspaceId: "ws_test_123",
    workspaceName: "Test Workspace",
    userId: "user_1",
    source: "fallback",
  });

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

  const createBillingCheckoutSession = vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/session_abc",
    sessionId: "cs_test_abc",
    mode: "subscription",
  });

  const reportAnalyticsEvent = vi.fn();

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
    },
  }));

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/services/billing", () => ({
    createBillingCheckoutSession,
  }));

  vi.doMock("@/lib/observability", () => ({
    reportAnalyticsEvent,
  }));

  const route = await import("@/app/api/billing/checkout/route");
  return {
    route,
    resolveWorkspaceContextFromRequest,
    ensureWorkspaceExists,
    createBillingCheckoutSession,
    reportAnalyticsEvent,
  };
}

describe("billing checkout route", () => {
  it("returns checkout session URL for valid plan", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "pro" }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.url).toBe("https://checkout.stripe.com/session_abc");
    expect(payload.sessionId).toBe("cs_test_abc");
    expect(payload.workspaceId).toBe("ws_test_123");
  });

  it("returns 400 for invalid plan value", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "enterprise" }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });

  it("returns 400 for missing plan field", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });

  it("passes correct workspace and plan to billing service", async () => {
    const { route, createBillingCheckoutSession } = await loadRoute();
    const request = new Request("http://localhost/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "growth" }),
    });

    await route.POST(request);

    expect(createBillingCheckoutSession).toHaveBeenCalledTimes(1);
    expect(createBillingCheckoutSession).toHaveBeenCalledWith({
      workspaceId: "ws_test_123",
      plan: "growth",
    });
  });
});
