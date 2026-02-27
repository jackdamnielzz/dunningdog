import { describe, expect, it, vi } from "vitest";

describe("crypto utilities", () => {
  it("encrypts and decrypts round-trip", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: { ENCRYPTION_KEY: "test-encryption-key-123456" },
    }));

    const { encryptText, decryptText } = await import("@/lib/crypto");

    const plainText = "hello world";
    const encrypted = encryptText(plainText);

    expect(encrypted).toContain(".");
    expect(decryptText(encrypted)).toBe(plainText);
  });

  it("throws on invalid payload format", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: { ENCRYPTION_KEY: "test-encryption-key-123456" },
    }));

    const { decryptText } = await import("@/lib/crypto");

    expect(() => decryptText("missing.parts")).toThrow("Invalid encrypted payload format.");
  });
});
