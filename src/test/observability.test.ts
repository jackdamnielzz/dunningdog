import { beforeEach, describe, expect, it, vi } from "vitest";

const baseEnv = {
  NODE_ENV: "test",
  SENTRY_DSN: undefined as string | undefined,
  APP_RELEASE: undefined as string | undefined,
  OBSERVABILITY_TIMEOUT_MS: 1000,
  POSTHOG_KEY: undefined as string | undefined,
  POSTHOG_HOST: "https://eu.i.posthog.com",
};

async function loadObservability(overrides: Partial<typeof baseEnv>) {
  vi.resetModules();
  const env = { ...baseEnv, ...overrides };

  vi.doMock("@/lib/env", () => ({ env }));

  const observability = await import("@/lib/observability");

  return { observability, env };
}

describe("observability", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("skips captureException when Sentry is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({ SENTRY_DSN: undefined });

    await observability.captureException(new Error("boom"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips captureException when sentry DSN is invalid", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({ SENTRY_DSN: "not-a-valid-url" });

    await observability.captureException(new Error("boom"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a Sentry envelope when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({
      SENTRY_DSN: "https://public@sentry.io/12345",
      APP_RELEASE: "sha_test_1",
    });

    await observability.captureException("string error", { context: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toContain("/api/12345/envelope/");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual(
      expect.objectContaining({
        "content-type": "application/x-sentry-envelope",
      }),
    );
    expect(options?.signal).toBeDefined();
    expect(String(options?.body)).toContain("\"environment\":\"test\"");
    expect(String(options?.body)).toContain("\"release\":\"sha_test_1\"");
    expect(String(options?.body)).toContain("\"source\":\"server\"");
  });

  it("skips captureEvent when PostHog is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({ POSTHOG_KEY: undefined });

    await observability.captureEvent({ event: "signup", distinctId: "user_1" });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a PostHog capture event when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({
      POSTHOG_KEY: "ph_key",
      APP_RELEASE: "sha_test_2",
    });

    await observability.captureEvent({
      event: "signup",
      distinctId: "user_2",
      properties: { plan: "starter" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("https://eu.i.posthog.com/capture/");
    expect(options?.method).toBe("POST");
    expect(String(options?.body)).toContain("ph_key");
    expect(String(options?.body)).toContain("signup");
    expect(String(options?.body)).toContain("\"source\":\"server\"");
    expect(String(options?.body)).toContain("\"release\":\"sha_test_2\"");
  });

  it("swallows telemetry network failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({
      SENTRY_DSN: "https://public@sentry.io/12345",
      POSTHOG_KEY: "ph_key",
    });

    await expect(observability.captureException(new Error("boom"))).resolves.toBeUndefined();
    await expect(
      observability.captureEvent({ event: "signup", distinctId: "user_3" }),
    ).resolves.toBeUndefined();
  });

  it("report helpers send telemetry through configured channels", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { observability } = await loadObservability({
      SENTRY_DSN: "https://public@sentry.io/12345",
      POSTHOG_KEY: "ph_key",
    });

    observability.reportLoggedError("failed job", { job: "sync" });
    observability.reportAnalyticsEvent({
      event: "workflow_started",
      distinctId: "workspace_1",
      properties: { source: "cron" },
    });

    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
