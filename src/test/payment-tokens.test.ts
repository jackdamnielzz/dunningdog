import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- module loader ------------------------------------------------ */

async function loadPaymentTokens(deps?: {
  create?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const create = deps?.create ?? vi.fn().mockResolvedValue({ id: "pt_1" });
  const findUnique = deps?.findUnique ?? vi.fn().mockResolvedValue(null);
  const update = deps?.update ?? vi.fn().mockResolvedValue({ id: "pt_1" });

  vi.doMock("@/lib/db", () => ({
    db: {
      paymentUpdateToken: { create, findUnique, update },
    },
  }));

  vi.doMock("@/lib/env", () => ({
    env: { APP_BASE_URL: "https://app.test" },
  }));

  const tokens = await import("@/lib/services/payment-tokens");
  return { tokens, create, findUnique, update };
}

/* ======================================================================== */
/*  Feature 4: White-label payment update page                               */
/* ======================================================================== */

describe("Feature 4: Payment update tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePaymentUpdateToken", () => {
    it("creates a token with 72-hour default expiry", async () => {
      const create = vi.fn().mockResolvedValue({ id: "pt_1" });
      const { tokens } = await loadPaymentTokens({ create });

      const result = await tokens.generatePaymentUpdateToken({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
      });

      expect(result.token).toBeDefined();
      expect(result.token.length).toBe(48); // 24 bytes = 48 hex chars
      expect(result.url).toBe(`https://app.test/update-payment/${result.token}`);

      expect(create).toHaveBeenCalledTimes(1);
      const callArg = create.mock.calls[0][0];
      expect(callArg.data.workspaceId).toBe("ws_1");
      expect(callArg.data.recoveryAttemptId).toBe("ra_1");
      expect(callArg.data.token).toBe(result.token);

      // Verify expiry is approximately 72 hours from now
      const expiresAt = callArg.data.expiresAt as Date;
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (60 * 60 * 1000);
      expect(hoursUntilExpiry).toBeGreaterThan(71);
      expect(hoursUntilExpiry).toBeLessThanOrEqual(72);
    });

    it("creates a token with custom expiry", async () => {
      const create = vi.fn().mockResolvedValue({ id: "pt_1" });
      const { tokens } = await loadPaymentTokens({ create });

      await tokens.generatePaymentUpdateToken({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        expiresInHours: 24,
      });

      const callArg = create.mock.calls[0][0];
      const expiresAt = callArg.data.expiresAt as Date;
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (60 * 60 * 1000);
      expect(hoursUntilExpiry).toBeGreaterThan(23);
      expect(hoursUntilExpiry).toBeLessThanOrEqual(24);
    });

    it("generates unique tokens on each call", async () => {
      const create = vi.fn().mockResolvedValue({ id: "pt_1" });
      const { tokens } = await loadPaymentTokens({ create });

      const result1 = await tokens.generatePaymentUpdateToken({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
      });
      const result2 = await tokens.generatePaymentUpdateToken({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
      });

      expect(result1.token).not.toBe(result2.token);
    });
  });

  describe("validatePaymentUpdateToken", () => {
    it("returns token data for a valid, unexpired, unused token", async () => {
      const findUnique = vi.fn().mockResolvedValue({
        token: "abc123",
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        usedAt: null,
      });
      const { tokens } = await loadPaymentTokens({ findUnique });

      const result = await tokens.validatePaymentUpdateToken("abc123");

      expect(result).toEqual({
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
      });
    });

    it("returns null for non-existent token", async () => {
      const findUnique = vi.fn().mockResolvedValue(null);
      const { tokens } = await loadPaymentTokens({ findUnique });

      const result = await tokens.validatePaymentUpdateToken("nonexistent");

      expect(result).toBeNull();
    });

    it("returns null for expired token", async () => {
      const findUnique = vi.fn().mockResolvedValue({
        token: "expired_token",
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        usedAt: null,
      });
      const { tokens } = await loadPaymentTokens({ findUnique });

      const result = await tokens.validatePaymentUpdateToken("expired_token");

      expect(result).toBeNull();
    });

    it("returns null for already-used token", async () => {
      const findUnique = vi.fn().mockResolvedValue({
        token: "used_token",
        workspaceId: "ws_1",
        recoveryAttemptId: "ra_1",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        usedAt: new Date(), // already used
      });
      const { tokens } = await loadPaymentTokens({ findUnique });

      const result = await tokens.validatePaymentUpdateToken("used_token");

      expect(result).toBeNull();
    });
  });

  describe("markTokenUsed", () => {
    it("sets usedAt timestamp on the token", async () => {
      const update = vi.fn().mockResolvedValue({ id: "pt_1" });
      const { tokens } = await loadPaymentTokens({ update });

      await tokens.markTokenUsed("abc123");

      expect(update).toHaveBeenCalledWith({
        where: { token: "abc123" },
        data: { usedAt: expect.any(Date) },
      });
    });
  });
});
