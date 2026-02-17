import { describe, expect, it } from "vitest";
import { classifyDeclineType } from "@/lib/services/recovery";

describe("classifyDeclineType", () => {
  it("classifies known hard decline codes as hard", () => {
    expect(classifyDeclineType("stolen_card")).toBe("hard");
    expect(classifyDeclineType("expired_card")).toBe("hard");
  });

  it("classifies unknown decline code as soft", () => {
    expect(classifyDeclineType("processing_error")).toBe("soft");
  });

  it("defaults to soft for empty codes", () => {
    expect(classifyDeclineType(undefined)).toBe("soft");
    expect(classifyDeclineType(null)).toBe("soft");
  });
});
