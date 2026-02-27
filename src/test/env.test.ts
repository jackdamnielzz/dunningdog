import { afterEach, describe, expect, it, vi } from "vitest";

const baseEnv = {
  NODE_ENV: "test",
  APP_BASE_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://localhost/dunningdog",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "anon_key",
  SUPABASE_SERVICE_ROLE_KEY: "service_key",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  STRIPE_CONNECT_CLIENT_ID: "ca_123",
  STRIPE_CONNECT_CLIENT_SECRET: "sk_connect_123",
  STRIPE_PRICE_STARTER_ID: "price_starter",
  STRIPE_PRICE_PRO_ID: "price_pro",
  STRIPE_PRICE_GROWTH_ID: "price_growth",
  RESEND_API_KEY: "re_key",
  RESEND_FROM_EMAIL: "billing@dunningdog.com",
  INNGEST_EVENT_KEY: "inngest_event",
  INNGEST_SIGNING_KEY: "inngest_signing",
  CRON_SECRET: "long-enough-cron-secret",
  POSTHOG_HOST: "https://eu.i.posthog.com",
  ENCRYPTION_KEY: "development-only-encryption-key-32",
  DEMO_MODE: "false",
};

describe("env validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses defaults and derives flags", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_BASE_URL", baseEnv.APP_BASE_URL);
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", baseEnv.NEXT_PUBLIC_APP_BASE_URL);
    vi.stubEnv("DATABASE_URL", baseEnv.DATABASE_URL);
    vi.stubEnv("RESEND_FROM_EMAIL", baseEnv.RESEND_FROM_EMAIL);
    vi.stubEnv("POSTHOG_HOST", baseEnv.POSTHOG_HOST);
    vi.stubEnv("ENCRYPTION_KEY", baseEnv.ENCRYPTION_KEY);
    vi.stubEnv("DEMO_MODE", "false");

    const envModule = await import("@/lib/env");

    expect(envModule.env.NODE_ENV).toBe("test");
    expect(envModule.isDemoMode).toBe(false);
    expect(envModule.isProduction).toBe(false);
  });

  it("throws when required env values are invalid", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_BASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", baseEnv.NEXT_PUBLIC_APP_BASE_URL);
    vi.stubEnv("DATABASE_URL", baseEnv.DATABASE_URL);
    vi.stubEnv("RESEND_FROM_EMAIL", baseEnv.RESEND_FROM_EMAIL);
    vi.stubEnv("POSTHOG_HOST", baseEnv.POSTHOG_HOST);
    vi.stubEnv("ENCRYPTION_KEY", baseEnv.ENCRYPTION_KEY);
    vi.stubEnv("DEMO_MODE", baseEnv.DEMO_MODE);

    await expect(import("@/lib/env")).rejects.toThrow("Environment validation failed.");
  });

  it("throws in production when required provider values are missing", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("DATABASE_URL", baseEnv.DATABASE_URL);
    vi.stubEnv("ENCRYPTION_KEY", baseEnv.ENCRYPTION_KEY);
    vi.stubEnv("DEMO_MODE", "false");

    await expect(import("@/lib/env")).rejects.toThrow("Environment validation failed.");
  });

  it("parses in production when all required values are present", async () => {
    vi.resetModules();
    for (const [key, value] of Object.entries(baseEnv)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_URL", "https://app.example.com");

    const envModule = await import("@/lib/env");

    expect(envModule.isProduction).toBe(true);
    expect(envModule.env.CRON_SECRET).toBe(baseEnv.CRON_SECRET);
  });
});
