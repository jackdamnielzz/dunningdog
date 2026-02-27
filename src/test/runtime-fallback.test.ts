import { describe, expect, it, vi } from "vitest";

describe("runtime-fallback", () => {
  it("treats errors as unavailable in demo mode", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: true }));

    const runtimeFallback = await import("@/lib/runtime-fallback");

    expect(runtimeFallback.isDatabaseUnavailableError(null)).toBe(true);
    expect(runtimeFallback.isDatabaseUnavailableError(new Error("anything"))).toBe(true);
  });

  it("detects known prisma error codes", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: false }));

    const runtimeFallback = await import("@/lib/runtime-fallback");

    expect(runtimeFallback.isDatabaseUnavailableError({ code: "P1001" })).toBe(true);
    expect(runtimeFallback.isDatabaseUnavailableError({ code: "P2024" })).toBe(true);
    expect(runtimeFallback.isDatabaseUnavailableError({ code: "OTHER" })).toBe(false);
  });

  it("detects error hints in messages", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: false }));

    const runtimeFallback = await import("@/lib/runtime-fallback");

    expect(runtimeFallback.isDatabaseUnavailableError({ message: "Connection timeout" })).toBe(true);
    expect(runtimeFallback.isDatabaseUnavailableError({ message: "ECONNREFUSED" })).toBe(true);
    expect(runtimeFallback.isDatabaseUnavailableError({ message: "other" })).toBe(false);
  });

  it("describes failures with code + message", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: false }));

    const runtimeFallback = await import("@/lib/runtime-fallback");

    expect(runtimeFallback.describeFailure({ code: "P1001", message: "no connection" })).toBe(
      "P1001: no connection",
    );
    expect(runtimeFallback.describeFailure({ message: "just message" })).toBe("just message");
    expect(runtimeFallback.describeFailure(null)).toBe("unknown error");
  });
});
