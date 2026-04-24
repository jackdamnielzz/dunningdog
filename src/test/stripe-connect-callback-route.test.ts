import { describe, expect, it, vi } from "vitest";

type LoadOptions = {
  oauthState?: {
    state: string;
    workspaceId: string;
    expiresAt: Date;
  } | null;
  stripeSecretKey?: string;
};

const WORKSPACE = {
  id: "ws_test_123",
  name: "Test Workspace",
  ownerUserId: "user_1",
  timezone: "UTC",
  billingPlan: "starter",
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const CONNECTED_ACCOUNT = {
  id: "csa_1",
  workspaceId: "ws_test_123",
  stripeAccountId: "acct_demo_st_123",
  livemode: false,
  scopes: ["read_write"],
  connectedAt: new Date("2025-06-01"),
  disconnectedAt: null,
};

async function loadRoute(options: LoadOptions = {}) {
  vi.resetModules();

  const findUnique = vi.fn().mockResolvedValue(options.oauthState ?? null);
  const upsert = vi.fn().mockResolvedValue(CONNECTED_ACCOUNT);
  const deleteState = vi.fn().mockResolvedValue(undefined);
  const ensureWorkspaceExists = vi.fn().mockResolvedValue(WORKSPACE);
  const reportAnalyticsEvent = vi.fn();

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
      STRIPE_SECRET_KEY: options.stripeSecretKey,
    },
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      stripeOAuthState: {
        findUnique,
        delete: deleteState,
      },
      connectedStripeAccount: {
        upsert,
      },
    },
  }));

  vi.doMock("@/lib/auth", () => ({
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/crypto", () => ({
    encryptText: (text: string) => text,
  }));

  vi.doMock("@/lib/stripe/oauth", () => ({
    exchangeOAuthCode: vi.fn(),
  }));

  vi.doMock("@/lib/observability", () => ({
    reportAnalyticsEvent,
  }));

  const route = await import("@/app/api/stripe/connect/callback/route");
  return {
    route,
    findUnique,
    upsert,
    deleteState,
    ensureWorkspaceExists,
    reportAnalyticsEvent,
  };
}

describe("stripe connect callback route", () => {
  it("returns 400 when state param is missing", async () => {
    const { route } = await loadRoute();
    const response = await route.GET(
      new Request("http://localhost/api/stripe/connect/callback?code=demo_code"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("AUTH_OAUTH_STATE_INVALID");
  });

  it("returns 400 when state is not found in DB", async () => {
    const { route } = await loadRoute({ oauthState: null });
    const response = await route.GET(
      new Request("http://localhost/api/stripe/connect/callback?code=demo_code&state=unknown_state"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("AUTH_OAUTH_STATE_INVALID");
  });

  it("returns 400 when state is expired", async () => {
    const { route } = await loadRoute({
      oauthState: {
        state: "expired_state",
        workspaceId: "ws_test_123",
        expiresAt: new Date("2020-01-01"),
      },
    });
    const response = await route.GET(
      new Request("http://localhost/api/stripe/connect/callback?code=demo_code&state=expired_state"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("AUTH_OAUTH_STATE_INVALID");
  });

  it("returns JSON with connected account for valid demo flow", async () => {
    const { route, upsert, deleteState } = await loadRoute({
      oauthState: {
        state: "valid_state",
        workspaceId: "ws_test_123",
        expiresAt: new Date(Date.now() + 600_000),
      },
    });
    const response = await route.GET(
      new Request("http://localhost/api/stripe/connect/callback?code=demo_code&state=valid_state", {
        headers: { accept: "application/json" },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.connectedAccount).toBeDefined();
    expect(payload.connectedAccount.workspaceId).toBe("ws_test_123");
    expect(payload.connectedAccount.stripeAccountId).toBe("acct_demo_st_123");
    expect(payload.workspace).toBeDefined();
    expect(payload.workspace.id).toBe("ws_test_123");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(deleteState).toHaveBeenCalledTimes(1);
  });

  it("returns 302 redirect by default (browser flow)", async () => {
    const { route } = await loadRoute({
      oauthState: {
        state: "valid_state",
        workspaceId: "ws_test_123",
        expiresAt: new Date(Date.now() + 600_000),
      },
    });
    const response = await route.GET(
      new Request(
        "http://localhost/api/stripe/connect/callback?code=demo_code&state=valid_state",
      ),
    );

    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("http://localhost:3000/app/settings");
    expect(location).toContain("connected=1");
    expect(location).toContain("workspaceId=ws_test_123");
  });
});
