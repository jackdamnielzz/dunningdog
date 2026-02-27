import { describe, expect, it, vi } from "vitest";

async function loadCronAuth(envOverrides: {
  NODE_ENV?: "development" | "test" | "production";
  CRON_SECRET?: string;
}) {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: {
      NODE_ENV: envOverrides.NODE_ENV ?? "test",
      CRON_SECRET: envOverrides.CRON_SECRET,
    },
  }));

  const cronAuth = await import("@/lib/cron-auth");
  return cronAuth;
}

describe("cron authorization", () => {
  it("allows local/dev execution when CRON_SECRET is unset", async () => {
    const cronAuth = await loadCronAuth({ NODE_ENV: "development", CRON_SECRET: undefined });
    const request = new Request("http://localhost/api/cron/pre-dunning");

    expect(() => cronAuth.assertCronAuthorized(request)).not.toThrow();
  });

  it("throws in production when CRON_SECRET is missing", async () => {
    const cronAuth = await loadCronAuth({ NODE_ENV: "production", CRON_SECRET: undefined });
    const request = new Request("https://app.example.com/api/cron/pre-dunning");

    expect(() => cronAuth.assertCronAuthorized(request)).toThrow(
      "Cron authorization misconfigured",
    );
  });

  it("rejects requests with invalid bearer secret", async () => {
    const cronAuth = await loadCronAuth({
      NODE_ENV: "production",
      CRON_SECRET: "super-secret-value",
    });
    const request = new Request("https://app.example.com/api/cron/pre-dunning", {
      headers: {
        authorization: "Bearer wrong-secret",
      },
    });

    expect(() => cronAuth.assertCronAuthorized(request)).toThrow(
      "Unauthorized cron request",
    );
  });

  it("accepts requests with matching bearer secret", async () => {
    const cronAuth = await loadCronAuth({
      NODE_ENV: "production",
      CRON_SECRET: "super-secret-value",
    });
    const request = new Request("https://app.example.com/api/cron/pre-dunning", {
      headers: {
        authorization: "Bearer super-secret-value",
      },
    });

    expect(() => cronAuth.assertCronAuthorized(request)).not.toThrow();
  });

  it("accepts requests with matching x-cron-secret header", async () => {
    const cronAuth = await loadCronAuth({
      NODE_ENV: "production",
      CRON_SECRET: "super-secret-value",
    });
    const request = new Request("https://app.example.com/api/cron/pre-dunning", {
      headers: {
        "x-cron-secret": "super-secret-value",
      },
    });

    expect(() => cronAuth.assertCronAuthorized(request)).not.toThrow();
  });
});
