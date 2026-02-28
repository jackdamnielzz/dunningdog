import { describe, expect, it, vi } from "vitest";

type LoadOptions = {
  stripeConnectClientId?: string;
};

async function loadRoute(options: LoadOptions = {}) {
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

  const stripeOAuthStateCreate = vi.fn().mockResolvedValue({
    state: "deterministic_state_value",
    workspaceId: "ws_test_123",
    expiresAt: new Date(Date.now() + 600_000),
  });

  const reportAnalyticsEvent = vi.fn();

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
      STRIPE_CONNECT_CLIENT_ID: options.stripeConnectClientId,
    },
  }));

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      stripeOAuthState: {
        create: stripeOAuthStateCreate,
      },
    },
  }));

  vi.doMock("@/lib/observability", () => ({
    reportAnalyticsEvent,
  }));

  vi.doMock("nanoid", () => ({
    nanoid: () => "deterministic_state_value",
  }));

  const route = await import("@/app/api/stripe/connect/start/route");
  return {
    route,
    resolveWorkspaceContextFromRequest,
    ensureWorkspaceExists,
    stripeOAuthStateCreate,
    reportAnalyticsEvent,
  };
}

describe("stripe connect start route", () => {
  it("returns demo redirect URL when STRIPE_CONNECT_CLIENT_ID is not set", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/stripe/connect/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.state).toBe("deterministic_state_value");
    expect(payload.redirectUrl).toContain("/api/stripe/connect/callback");
    expect(payload.redirectUrl).toContain("code=demo_code");
    expect(payload.redirectUrl).toContain("state=deterministic_state_value");
  });

  it("returns Stripe authorize URL when STRIPE_CONNECT_CLIENT_ID is set", async () => {
    const { route } = await loadRoute({
      stripeConnectClientId: "ca_test_abc123",
    });
    const request = new Request("http://localhost/api/stripe/connect/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.state).toBe("deterministic_state_value");
    expect(payload.redirectUrl).toContain("https://connect.stripe.com/oauth/authorize");
    expect(payload.redirectUrl).toContain("client_id=ca_test_abc123");
    expect(payload.redirectUrl).toContain("state=deterministic_state_value");
    expect(payload.redirectUrl).toContain("scope=read_write");
  });

  it("creates OAuth state in database", async () => {
    const { route, stripeOAuthStateCreate } = await loadRoute();
    const request = new Request("http://localhost/api/stripe/connect/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    await route.POST(request);

    expect(stripeOAuthStateCreate).toHaveBeenCalledTimes(1);
    expect(stripeOAuthStateCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        state: "deterministic_state_value",
        workspaceId: "ws_test_123",
        expiresAt: expect.any(Date),
      }),
    });
  });

  it("returns error when body is invalid JSON", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/stripe/connect/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not valid json{{{",
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });
});
