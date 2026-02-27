import { describe, expect, it, vi } from "vitest";

type LoadOptions = {
  isProduction: boolean;
  stripeWebhookSecret?: string;
};

async function loadRoute(options: LoadOptions) {
  vi.resetModules();

  const captureException = vi.fn().mockResolvedValue(undefined);

  vi.doMock("@/lib/env", () => ({
    env: {
      STRIPE_WEBHOOK_SECRET: options.stripeWebhookSecret,
    },
    isProduction: options.isProduction,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => null,
  }));

  vi.doMock("@/lib/constants", () => ({
    SUPPORTED_STRIPE_WEBHOOK_EVENTS: new Set(["invoice.payment_failed"]),
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      connectedStripeAccount: {
        findUnique: vi.fn(),
      },
    },
  }));

  vi.doMock("@/lib/services/recovery", () => ({
    persistStripeEvent: vi.fn(),
    processStripeWebhookEvent: vi.fn(),
  }));

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: { send: vi.fn() },
  }));

  const route = await import("@/app/api/webhooks/stripe/route");
  return { route, captureException };
}

describe("stripe webhook route", () => {
  it("rejects non-json webhook payloads", async () => {
    const { route } = await loadRoute({ isProduction: false });

    const response = await route.POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({
      code: "VALIDATION_REQUEST_BODY_INVALID",
    });
  });

  it("fails in production when webhook secret is missing", async () => {
    const { route } = await loadRoute({ isProduction: true, stripeWebhookSecret: undefined });

    const response = await route.POST(
      new Request("https://app.example.com/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: "evt_1",
          type: "invoice.payment_failed",
          account: "acct_1",
          data: { object: { id: "in_1" } },
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
    });
  });

  it("accepts unsupported events in non-production without signature verification", async () => {
    const { route } = await loadRoute({ isProduction: false, stripeWebhookSecret: undefined });

    const response = await route.POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: "evt_1",
          type: "customer.created",
          data: { object: {} },
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      received: true,
      eventId: "evt_1",
      duplicate: false,
    });
  });

  it("rejects signed-mode requests when signature header is missing", async () => {
    const { route } = await loadRoute({
      isProduction: false,
      stripeWebhookSecret: "whsec_123",
    });

    const response = await route.POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: "evt_1",
          type: "invoice.payment_failed",
          account: "acct_1",
          data: { object: { id: "in_1" } },
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "AUTH_WEBHOOK_SIGNATURE_INVALID",
    });
  });
});
