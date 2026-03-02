import { beforeEach, describe, expect, it, vi } from "vitest";

// --- /api/customer/update-payment-session ---

async function loadUpdatePaymentSession() {
  vi.resetModules();

  const findUniqueAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    stripeCustomerId: "cus_123",
    workspaceId: "ws_1",
    status: "pending",
  });

  const createPortalSession = vi.fn().mockResolvedValue({
    url: "https://billing.stripe.test/portal",
  });

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
    },
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        findUnique: findUniqueAttempt,
      },
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => ({
      billingPortal: {
        sessions: {
          create: createPortalSession,
        },
      },
    }),
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const route = await import("@/app/api/customer/update-payment-session/route");
  return { route, findUniqueAttempt, createPortalSession };
}

async function loadUpdatePaymentSessionNoStripe() {
  vi.resetModules();

  const findUniqueAttempt = vi.fn().mockResolvedValue({
    id: "ra_1",
    stripeCustomerId: "cus_demo_123",
    workspaceId: "ws_1",
    status: "pending",
  });

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
    },
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        findUnique: findUniqueAttempt,
      },
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => null,
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const route = await import("@/app/api/customer/update-payment-session/route");
  return { route, findUniqueAttempt };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/customer/update-payment-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("update-payment-session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns portal URL for valid token with real customer", async () => {
    const { route } = await loadUpdatePaymentSession();
    const response = await route.POST(makeRequest({ recoveryToken: "attempt:ra_1" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessionUrl).toBe("https://billing.stripe.test/portal");
    expect(payload.expiresAt).toBeDefined();
  });

  it("parses token with attempt: prefix", async () => {
    const { route, findUniqueAttempt } = await loadUpdatePaymentSession();
    await route.POST(makeRequest({ recoveryToken: "attempt:ra_1" }));

    expect(findUniqueAttempt).toHaveBeenCalledWith({
      where: { id: "ra_1" },
    });
  });

  it("parses token without prefix", async () => {
    const { route, findUniqueAttempt } = await loadUpdatePaymentSession();
    await route.POST(makeRequest({ recoveryToken: "ra_1" }));

    expect(findUniqueAttempt).toHaveBeenCalledWith({
      where: { id: "ra_1" },
    });
  });

  it("returns 404 when recovery attempt not found", async () => {
    const { route, findUniqueAttempt } = await loadUpdatePaymentSession();
    findUniqueAttempt.mockResolvedValueOnce(null);

    const response = await route.POST(makeRequest({ recoveryToken: "ra_missing" }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe("DUNNING_RECOVERY_ATTEMPT_NOT_FOUND");
  });

  it("returns fallback URL when Stripe is not configured", async () => {
    const { route } = await loadUpdatePaymentSessionNoStripe();
    const response = await route.POST(makeRequest({ recoveryToken: "ra_1" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessionUrl).toContain("localhost:3000/app/recoveries");
  });

  it("returns fallback URL for demo customer", async () => {
    const { route } = await loadUpdatePaymentSessionNoStripe();
    const response = await route.POST(makeRequest({ recoveryToken: "ra_1" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessionUrl).not.toContain("stripe");
  });

  it("falls back gracefully when Stripe customer is deleted", async () => {
    const { route, createPortalSession } = await loadUpdatePaymentSession();
    createPortalSession.mockRejectedValueOnce({
      code: "resource_missing",
      message: "No such customer: cus_123",
    });

    const response = await route.POST(makeRequest({ recoveryToken: "ra_1" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessionUrl).toContain("localhost:3000/app/recoveries");
  });

  it("includes expiresAt in response (1 hour from now)", async () => {
    const { route } = await loadUpdatePaymentSession();
    const before = Date.now();
    const response = await route.POST(makeRequest({ recoveryToken: "ra_1" }));
    const payload = await response.json();

    const expiresAt = new Date(payload.expiresAt).getTime();
    const oneHour = 60 * 60 * 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(before + oneHour - 5000);
    expect(expiresAt).toBeLessThanOrEqual(before + oneHour + 5000);
  });

  it("returns 400 for missing recoveryToken", async () => {
    const { route } = await loadUpdatePaymentSession();
    const response = await route.POST(makeRequest({}));

    expect(response.status).toBe(400);
  });
});

// --- /api/customer/setup-intent ---

async function loadSetupIntent(options: {
  tokenValid?: boolean;
  attemptExists?: boolean;
  stripeEnabled?: boolean;
} = {}) {
  vi.resetModules();

  const validateToken = vi.fn().mockResolvedValue(
    options.tokenValid !== false
      ? { workspaceId: "ws_1", recoveryAttemptId: "ra_1" }
      : null,
  );
  const markUsed = vi.fn().mockResolvedValue(undefined);

  const findUniqueAttempt = vi.fn().mockResolvedValue(
    options.attemptExists !== false
      ? { id: "ra_1", stripeCustomerId: "cus_123" }
      : null,
  );

  const createPortalSession = vi.fn().mockResolvedValue({
    url: "https://billing.stripe.test/portal-setup",
  });

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
    },
  }));

  vi.doMock("@/lib/services/payment-tokens", () => ({
    validatePaymentUpdateToken: validateToken,
    markTokenUsed: markUsed,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        findUnique: findUniqueAttempt,
      },
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () =>
      options.stripeEnabled !== false
        ? {
            billingPortal: {
              sessions: { create: createPortalSession },
            },
          }
        : null,
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const route = await import("@/app/api/customer/setup-intent/route");
  return { route, validateToken, markUsed, findUniqueAttempt, createPortalSession };
}

function makeSetupIntentRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/customer/setup-intent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("setup-intent route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns portal URL for valid token", async () => {
    const { route } = await loadSetupIntent();
    const response = await route.POST(
      makeSetupIntentRequest({ token: "abc123def456" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.portalUrl).toBe("https://billing.stripe.test/portal-setup");
  });

  it("marks token as used after success", async () => {
    const { route, markUsed } = await loadSetupIntent();
    await route.POST(makeSetupIntentRequest({ token: "abc123def456" }));

    expect(markUsed).toHaveBeenCalledWith("abc123def456");
  });

  it("returns 404 for invalid token", async () => {
    const { route } = await loadSetupIntent({ tokenValid: false });
    const response = await route.POST(
      makeSetupIntentRequest({ token: "expired_token_123" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe("DUNNING_RECOVERY_ATTEMPT_NOT_FOUND");
  });

  it("returns 404 when recovery attempt not found", async () => {
    const { route } = await loadSetupIntent({ attemptExists: false });
    const response = await route.POST(
      makeSetupIntentRequest({ token: "valid_token_123" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe("DUNNING_RECOVERY_ATTEMPT_NOT_FOUND");
  });

  it("returns fallback URL when Stripe is not configured", async () => {
    const { route } = await loadSetupIntent({ stripeEnabled: false });
    const response = await route.POST(
      makeSetupIntentRequest({ token: "valid_token_123" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.portalUrl).toContain("localhost:3000/update-payment/");
  });

  it("returns fallback when portal creation fails", async () => {
    const { route, createPortalSession } = await loadSetupIntent();
    createPortalSession.mockRejectedValueOnce(new Error("Stripe error"));

    const response = await route.POST(
      makeSetupIntentRequest({ token: "valid_token_123" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.portalUrl).toContain("localhost:3000/update-payment/");
  });

  it("returns 400 for token shorter than 10 characters", async () => {
    const { route } = await loadSetupIntent();
    const response = await route.POST(
      makeSetupIntentRequest({ token: "short" }),
    );

    expect(response.status).toBe(400);
  });
});
