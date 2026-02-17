import { describe, expect, it } from "vitest";
import { parseWindow } from "@/lib/utils";

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
