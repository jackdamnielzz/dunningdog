import { describe, expect, it, vi } from "vitest";

type LoadOptions = {
  attempt:
    | {
        id: string;
        stripeCustomerId: string;
      }
    | null;
  stripeSessionUrl?: string;
  stripeError?: unknown;
};

async function loadRoute(options: LoadOptions) {
  vi.resetModules();

  const findUnique = vi.fn().mockResolvedValue(options.attempt);
  const createSession = vi.fn();
  const log = vi.fn();

  if (options.stripeError) {
    createSession.mockRejectedValue(options.stripeError);
  } else if (options.stripeSessionUrl) {
    createSession.mockResolvedValue({ url: options.stripeSessionUrl });
  }

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: {
        findUnique,
      },
    },
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => ({
      billingPortal: {
        sessions: {
          create: createSession,
        },
      },
    }),
  }));

  vi.doMock("@/lib/logger", () => ({ log }));

  const route = await import("@/app/api/customer/update-payment-session/route");
  return { route, findUnique, createSession, log };
}

describe("update payment session route", () => {
  it("returns 404 when recovery attempt does not exist", async () => {
    const { route } = await loadRoute({ attempt: null });
    const request = new Request("http://localhost/api/customer/update-payment-session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ recoveryToken: "attempt:missing" }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe("DUNNING_RECOVERY_ATTEMPT_NOT_FOUND");
  });

  it("falls back to in-app URL when Stripe customer is missing", async () => {
    const { route, createSession, log } = await loadRoute({
      attempt: {
        id: "attempt_1",
        stripeCustomerId: "cus_missing",
      },
      stripeError: {
        code: "resource_missing",
        message: "No such customer: 'cus_missing'",
      },
    });
    const request = new Request("http://localhost/api/customer/update-payment-session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ recoveryToken: "attempt:attempt_1" }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessionUrl).toBe(
      "http://localhost:3000/app/recoveries?updated=true&attemptId=attempt_1",
    );
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      "warn",
      expect.stringContaining("Falling back"),
      expect.objectContaining({
        recoveryAttemptId: "attempt_1",
        stripeCustomerId: "cus_missing",
      }),
    );
  });
});

