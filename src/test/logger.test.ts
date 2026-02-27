import { afterEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("logs info to console.log", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reportLoggedError = vi.fn();

    vi.doMock("@/lib/observability", () => ({ reportLoggedError }));

    const { log } = await import("@/lib/logger");

    log("info", "hello", { ok: true });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(reportLoggedError).not.toHaveBeenCalled();
  });

  it("logs error to console.error and reports", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reportLoggedError = vi.fn();

    vi.doMock("@/lib/observability", () => ({ reportLoggedError }));

    const { log } = await import("@/lib/logger");

    log("error", "boom", { reason: "bad" });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(reportLoggedError).toHaveBeenCalledWith("boom", { reason: "bad" });
  });
});
