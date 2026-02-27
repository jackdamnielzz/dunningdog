import { describe, expect, it } from "vitest";
import { cn, currencyFromCents, parseWindow, toIsoDate } from "@/lib/utils";

describe("parseWindow", () => {
  it("returns supported window values", () => {
    expect(parseWindow("7d")).toBe("7d");
    expect(parseWindow("30d")).toBe("30d");
    expect(parseWindow("90d")).toBe("90d");
    expect(parseWindow("lifetime")).toBe("lifetime");
  });

  it("falls back to month for unsupported values", () => {
    expect(parseWindow("invalid")).toBe("month");
    expect(parseWindow(undefined)).toBe("month");
  });
});

describe("misc utils", () => {
  it("merges class names", () => {
    expect(cn("p-2", "text-sm")).toContain("p-2");
  });

  it("formats currency from cents", () => {
    expect(currencyFromCents(1234)).toBe("$12.34");
  });

  it("formats iso date", () => {
    const date = new Date("2024-01-02T03:04:05.000Z");
    expect(toIsoDate(date)).toBe("2024-01-02T03:04:05.000Z");
  });
});
