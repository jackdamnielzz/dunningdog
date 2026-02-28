import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";

/* ---------- module loader ------------------------------------------------ */

async function loadApiKeys(deps?: {
  create?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  updateMany?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const create = deps?.create ?? vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => ({
    id: "ak_1",
    ...args.data,
    createdAt: new Date(),
  }));
  const findUnique = deps?.findUnique ?? vi.fn().mockResolvedValue(null);
  const findMany = deps?.findMany ?? vi.fn().mockResolvedValue([]);
  const update = deps?.update ?? vi.fn().mockResolvedValue({ id: "ak_1" });
  const updateMany = deps?.updateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  vi.doMock("@/lib/db", () => ({
    db: {
      apiKey: { create, findUnique, findMany, update, updateMany },
    },
  }));

  const apiKeys = await import("@/lib/services/api-keys");
  return { apiKeys, create, findUnique, findMany, update, updateMany };
}

/* ======================================================================== */
/*  Feature 6: API access                                                    */
/* ======================================================================== */

describe("Feature 6: API access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateApiKey", () => {
    it("generates a key with dd_live_ prefix", async () => {
      const { apiKeys } = await loadApiKeys();

      const result = await apiKeys.generateApiKey({
        workspaceId: "ws_1",
        label: "My API Key",
        scopes: ["read:dashboard"],
      });

      expect(result.key).toMatch(/^dd_live_[0-9a-f]{48}$/);
      expect(result.prefix).toBe(result.key.slice(0, 16));
      expect(result.label).toBe("My API Key");
      expect(result.scopes).toEqual(["read:dashboard"]);
      expect(result.lastUsedAt).toBeNull();
      expect(result.id).toBe("ak_1");
    });

    it("stores hashed key (not raw key) in the database", async () => {
      const create = vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => ({
        id: "ak_1",
        ...args.data,
        createdAt: new Date(),
      }));
      const { apiKeys } = await loadApiKeys({ create });

      const result = await apiKeys.generateApiKey({
        workspaceId: "ws_1",
        label: "Hashed Key",
        scopes: ["read:dashboard"],
      });

      const callArg = create.mock.calls[0][0];
      const expectedHash = createHash("sha256").update(result.key).digest("hex");
      expect(callArg.data.hashedKey).toBe(expectedHash);
      // Raw key should NOT be stored
      expect(callArg.data.hashedKey).not.toBe(result.key);
    });

    it("generates unique keys on each call", async () => {
      const { apiKeys } = await loadApiKeys();

      const result1 = await apiKeys.generateApiKey({
        workspaceId: "ws_1",
        label: "Key 1",
        scopes: ["read:dashboard"],
      });
      const result2 = await apiKeys.generateApiKey({
        workspaceId: "ws_1",
        label: "Key 2",
        scopes: ["read:dashboard"],
      });

      expect(result1.key).not.toBe(result2.key);
    });

    it("stores workspace ID and scopes correctly", async () => {
      const create = vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => ({
        id: "ak_1",
        ...args.data,
        createdAt: new Date(),
      }));
      const { apiKeys } = await loadApiKeys({ create });

      await apiKeys.generateApiKey({
        workspaceId: "ws_test",
        label: "Full Scope Key",
        scopes: ["read:dashboard", "read:recoveries", "write:sequences"],
      });

      const callArg = create.mock.calls[0][0];
      expect(callArg.data.workspaceId).toBe("ws_test");
      expect(callArg.data.scopes).toEqual(["read:dashboard", "read:recoveries", "write:sequences"]);
    });
  });

  describe("validateApiKey", () => {
    it("validates a correct API key and returns workspace info", async () => {
      const testKey = "dd_live_" + "a".repeat(48);
      const testHash = createHash("sha256").update(testKey).digest("hex");

      const findUnique = vi.fn().mockResolvedValue({
        id: "ak_1",
        workspaceId: "ws_1",
        hashedKey: testHash,
        scopes: ["read:dashboard"],
        revokedAt: null,
      });
      const update = vi.fn().mockResolvedValue({});
      const { apiKeys } = await loadApiKeys({ findUnique, update });

      const result = await apiKeys.validateApiKey(testKey);

      expect(result).toEqual({
        workspaceId: "ws_1",
        scopes: ["read:dashboard"],
        apiKeyId: "ak_1",
      });
      expect(findUnique).toHaveBeenCalledWith({
        where: { hashedKey: testHash },
      });
    });

    it("returns null for keys without dd_live_ prefix", async () => {
      const { apiKeys, findUnique } = await loadApiKeys();

      const result = await apiKeys.validateApiKey("invalid_prefix_key");

      expect(result).toBeNull();
      expect(findUnique).not.toHaveBeenCalled();
    });

    it("returns null when key not found in database", async () => {
      const findUnique = vi.fn().mockResolvedValue(null);
      const { apiKeys } = await loadApiKeys({ findUnique });

      const result = await apiKeys.validateApiKey("dd_live_" + "b".repeat(48));

      expect(result).toBeNull();
    });

    it("returns null for revoked keys", async () => {
      const testKey = "dd_live_" + "c".repeat(48);
      const testHash = createHash("sha256").update(testKey).digest("hex");

      const findUnique = vi.fn().mockResolvedValue({
        id: "ak_revoked",
        workspaceId: "ws_1",
        hashedKey: testHash,
        scopes: ["read:dashboard"],
        revokedAt: new Date(), // revoked
      });
      const { apiKeys } = await loadApiKeys({ findUnique });

      const result = await apiKeys.validateApiKey(testKey);

      expect(result).toBeNull();
    });

    it("updates lastUsedAt on successful validation (fire-and-forget)", async () => {
      const testKey = "dd_live_" + "d".repeat(48);
      const testHash = createHash("sha256").update(testKey).digest("hex");

      const findUnique = vi.fn().mockResolvedValue({
        id: "ak_tracked",
        workspaceId: "ws_1",
        hashedKey: testHash,
        scopes: ["read:dashboard"],
        revokedAt: null,
      });
      const update = vi.fn().mockResolvedValue({});
      const { apiKeys } = await loadApiKeys({ findUnique, update });

      await apiKeys.validateApiKey(testKey);

      // Fire-and-forget, but update should still be called
      expect(update).toHaveBeenCalledWith({
        where: { id: "ak_tracked" },
        data: { lastUsedAt: expect.any(Date) },
      });
    });
  });

  describe("revokeApiKey", () => {
    it("sets revokedAt on the API key", async () => {
      const updateMany = vi.fn().mockResolvedValue({ count: 1 });
      const { apiKeys } = await loadApiKeys({ updateMany });

      await apiKeys.revokeApiKey("ak_1", "ws_1");

      expect(updateMany).toHaveBeenCalledWith({
        where: { id: "ak_1", workspaceId: "ws_1" },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("scopes revocation to workspace (prevents cross-workspace revocation)", async () => {
      const updateMany = vi.fn().mockResolvedValue({ count: 0 });
      const { apiKeys } = await loadApiKeys({ updateMany });

      await apiKeys.revokeApiKey("ak_1", "ws_attacker");

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ak_1", workspaceId: "ws_attacker" },
        }),
      );
    });
  });

  describe("listApiKeys", () => {
    it("returns non-revoked keys without hashes", async () => {
      const findMany = vi.fn().mockResolvedValue([
        {
          id: "ak_1",
          prefix: "dd_live_abcdef01",
          label: "Production Key",
          scopes: ["read:dashboard"],
          lastUsedAt: new Date("2026-02-01T12:00:00Z"),
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: "ak_2",
          prefix: "dd_live_12345678",
          label: "Dev Key",
          scopes: ["read:dashboard", "read:recoveries"],
          lastUsedAt: null,
          createdAt: new Date("2026-01-15T10:00:00Z"),
        },
      ]);
      const { apiKeys } = await loadApiKeys({ findMany });

      const result = await apiKeys.listApiKeys("ws_1");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "ak_1",
        prefix: "dd_live_abcdef01",
        label: "Production Key",
        scopes: ["read:dashboard"],
        lastUsedAt: "2026-02-01T12:00:00.000Z",
        createdAt: "2026-01-01T10:00:00.000Z",
      });
      expect(result[1].lastUsedAt).toBeNull();

      // Verify query filters out revoked keys
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: "ws_1", revokedAt: null },
        }),
      );
    });

    it("returns empty array when no keys exist", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { apiKeys } = await loadApiKeys({ findMany });

      const result = await apiKeys.listApiKeys("ws_empty");

      expect(result).toEqual([]);
    });
  });

  describe("API_KEY_SCOPES", () => {
    it("exports expected scope values", async () => {
      const { apiKeys } = await loadApiKeys();

      expect(apiKeys.API_KEY_SCOPES).toContain("read:dashboard");
      expect(apiKeys.API_KEY_SCOPES).toContain("read:recoveries");
      expect(apiKeys.API_KEY_SCOPES).toContain("read:sequences");
      expect(apiKeys.API_KEY_SCOPES).toContain("write:sequences");
      expect(apiKeys.API_KEY_SCOPES).toContain("read:settings");
    });
  });
});
