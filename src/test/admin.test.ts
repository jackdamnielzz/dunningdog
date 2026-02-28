import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadAdmin(deps?: {
  adminEmails?: string;
  demoMode?: boolean;
  authenticatedUser?: { id: string; email: string } | null;
}) {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: { ADMIN_EMAILS: deps?.adminEmails ?? undefined },
    isDemoMode: deps?.demoMode ?? false,
  }));

  vi.doMock("@/lib/auth", () => ({
    getAuthenticatedUser: vi.fn().mockResolvedValue(deps?.authenticatedUser ?? null),
  }));

  vi.doMock("@/lib/problem", () => {
    class ProblemError extends Error {
      status: number;
      code: string;
      detail?: string;
      constructor(params: { title: string; status: number; code: string; detail?: string }) {
        super(params.title);
        this.status = params.status;
        this.code = params.code;
        this.detail = params.detail;
      }
    }
    return { ProblemError };
  });

  return import("@/lib/admin");
}

describe("admin module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isAdminEmail", () => {
    it("returns true when email is in ADMIN_EMAILS", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: "admin@example.com,dev@test.com",
      });
      expect(isAdminEmail("admin@example.com")).toBe(true);
      expect(isAdminEmail("dev@test.com")).toBe(true);
    });

    it("is case-insensitive", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: "Admin@Example.com",
      });
      expect(isAdminEmail("admin@example.com")).toBe(true);
      expect(isAdminEmail("ADMIN@EXAMPLE.COM")).toBe(true);
    });

    it("trims whitespace from email list", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: " admin@example.com , dev@test.com ",
      });
      expect(isAdminEmail("admin@example.com")).toBe(true);
      expect(isAdminEmail("dev@test.com")).toBe(true);
    });

    it("returns false when email is not in ADMIN_EMAILS", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: "admin@example.com",
      });
      expect(isAdminEmail("notadmin@example.com")).toBe(false);
    });

    it("returns false when ADMIN_EMAILS is not set", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: undefined,
      });
      expect(isAdminEmail("admin@example.com")).toBe(false);
    });

    it("returns false for empty ADMIN_EMAILS string", async () => {
      const { isAdminEmail } = await loadAdmin({
        adminEmails: "",
      });
      expect(isAdminEmail("admin@example.com")).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("returns true when authenticated user email is admin", async () => {
      const { isAdmin } = await loadAdmin({
        adminEmails: "admin@example.com",
        authenticatedUser: { id: "user_1", email: "admin@example.com" },
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      expect(await isAdmin(headers)).toBe(true);
    });

    it("returns false when authenticated user email is not admin", async () => {
      const { isAdmin } = await loadAdmin({
        adminEmails: "admin@example.com",
        authenticatedUser: { id: "user_1", email: "regular@example.com" },
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      expect(await isAdmin(headers)).toBe(false);
    });

    it("returns false when user is not authenticated", async () => {
      const { isAdmin } = await loadAdmin({
        adminEmails: "admin@example.com",
        authenticatedUser: null,
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      expect(await isAdmin(headers)).toBe(false);
    });

    it("returns true in demo mode regardless of authentication", async () => {
      const { isAdmin } = await loadAdmin({
        demoMode: true,
        authenticatedUser: null,
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      expect(await isAdmin(headers)).toBe(true);
    });
  });

  describe("requireAdmin", () => {
    it("does not throw when user is admin", async () => {
      const { requireAdmin } = await loadAdmin({
        adminEmails: "admin@example.com",
        authenticatedUser: { id: "user_1", email: "admin@example.com" },
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      await expect(requireAdmin(headers)).resolves.toBeUndefined();
    });

    it("throws 403 when user is not admin", async () => {
      const { requireAdmin } = await loadAdmin({
        adminEmails: "admin@example.com",
        authenticatedUser: { id: "user_1", email: "regular@example.com" },
      });

      const headers = { get: () => null } as unknown as Pick<Headers, "get">;
      await expect(requireAdmin(headers)).rejects.toThrow("Admin access required");
    });
  });
});
