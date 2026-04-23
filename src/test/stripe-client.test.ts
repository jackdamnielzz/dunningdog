import { describe, expect, it, vi } from "vitest";

type EnvOverrides = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_APP_CLIENT_ID?: string;
};

async function loadStripeClient(overrides: EnvOverrides = {}, isDemoMode = false) {
  vi.resetModules();

  const stripeCtor = vi.fn(function StripeMock(
    this: { key: string; options: Record<string, unknown> },
    key: string,
    options: Record<string, unknown>,
  ) {
    this.key = key;
    this.options = options;
  });

  vi.doMock("stripe", () => ({
    default: stripeCtor,
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      STRIPE_SECRET_KEY: overrides.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: overrides.STRIPE_WEBHOOK_SECRET,
      STRIPE_APP_CLIENT_ID: overrides.STRIPE_APP_CLIENT_ID,
    },
    isDemoMode,
  }));

  const stripeClient = await import("@/lib/stripe/client");

  return { stripeClient, stripeCtor };
}

describe("stripe client helpers", () => {
  it("returns null when stripe key is missing", async () => {
    const { stripeClient, stripeCtor } = await loadStripeClient({
      STRIPE_SECRET_KEY: undefined,
    });

    expect(stripeClient.getStripeClient()).toBeNull();
    expect(stripeCtor).not.toHaveBeenCalled();
  });

  it("creates and caches stripe client with expected api version", async () => {
    const { stripeClient, stripeCtor } = await loadStripeClient({
      STRIPE_SECRET_KEY: "sk_test_123",
    });

    const first = stripeClient.getStripeClient();
    const second = stripeClient.getStripeClient();

    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(stripeCtor).toHaveBeenCalledTimes(1);
    expect(stripeCtor).toHaveBeenCalledWith("sk_test_123", {
      apiVersion: "2026-01-28.clover",
    });
  });

  it("throws when requireStripeClient is called without configuration", async () => {
    const { stripeClient } = await loadStripeClient({
      STRIPE_SECRET_KEY: undefined,
    });

    expect(() => stripeClient.requireStripeClient()).toThrow("Stripe is not configured.");
  });

  it("reports stripe configuration only when key, webhook secret, and client id exist", async () => {
    const configured = await loadStripeClient({
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      STRIPE_APP_CLIENT_ID: "ca_123",
    });
    expect(configured.stripeClient.isStripeConfigured()).toBe(true);

    const missingField = await loadStripeClient({
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: undefined,
      STRIPE_APP_CLIENT_ID: "ca_123",
    });
    expect(missingField.stripeClient.isStripeConfigured()).toBe(false);
  });

  it("can only use real stripe outside demo mode and with a secret key", async () => {
    const real = await loadStripeClient(
      {
        STRIPE_SECRET_KEY: "sk_test_123",
      },
      false,
    );
    expect(real.stripeClient.canUseRealStripe()).toBe(true);

    const demo = await loadStripeClient(
      {
        STRIPE_SECRET_KEY: "sk_test_123",
      },
      true,
    );
    expect(demo.stripeClient.canUseRealStripe()).toBe(false);

    const noKey = await loadStripeClient({}, false);
    expect(noKey.stripeClient.canUseRealStripe()).toBe(false);
  });
});
