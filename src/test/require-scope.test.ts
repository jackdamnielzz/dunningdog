import { describe, expect, it, vi } from "vitest";

async function loadAuth() {
  vi.resetModules();

  vi.doMock("@/lib/db", () => ({ db: {} }));
  vi.doMock("@/lib/env", () => ({ env: {}, isDemoMode: false }));
  vi.doMock("@/lib/constants", () => ({
    DEFAULT_WORKSPACE_ID: "ws_default",
    DEFAULT_WORKSPACE_NAME: "Default",
    TRIAL_DURATION_MS: 0,
  }));
  vi.doMock("@/lib/problem", () => {
    class ProblemError extends Error {
      status: number;
      code: string;
      detail: string;
      meta?: Record<string, unknown>;
      constructor(opts: { title: string; status: number; code: string; detail: string; meta?: Record<string, unknown> }) {
        super(opts.title);
        this.status = opts.status;
        this.code = opts.code;
        this.detail = opts.detail;
        this.meta = opts.meta;
      }
    }
    return { ProblemError };
  });
  vi.doMock("@/lib/runtime-fallback", () => ({
    isDatabaseUnavailableError: () => false,
    describeFailure: () => "",
  }));
  vi.doMock("@/lib/demo-data", () => ({ getDemoWorkspace: vi.fn() }));
  vi.doMock("@/lib/logger", () => ({ log: vi.fn() }));
  vi.doMock("@/lib/supabase", () => ({ createSupabaseClient: vi.fn() }));

  const auth = await import("@/lib/auth");
  return auth;
}

describe("requireScope", () => {
  it("passes for session-authenticated users", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: "u1", source: "authenticated" },
        "read:dashboard",
      ),
    ).not.toThrow();
  });

  it("passes for fallback users", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "fallback" },
        "read:dashboard",
      ),
    ).not.toThrow();
  });

  it("passes when API key has the required scope", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key", apiKeyScopes: ["read:dashboard", "read:recoveries"] },
        "read:dashboard",
      ),
    ).not.toThrow();
  });

  it("passes when multiple required scopes are all present", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key", apiKeyScopes: ["read:dashboard", "read:recoveries"] },
        "read:dashboard",
        "read:recoveries",
      ),
    ).not.toThrow();
  });

  it("throws AUTH_FORBIDDEN when scope is missing", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key", apiKeyScopes: ["read:recoveries"] },
        "read:dashboard",
      ),
    ).toThrow("Insufficient API key permissions");
  });

  it("includes missing scopes in error meta", async () => {
    const { requireScope } = await loadAuth();

    try {
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key", apiKeyScopes: ["read:recoveries"] },
        "read:dashboard",
        "write:sequences",
      );
      expect.fail("Expected an error");
    } catch (error: unknown) {
      const err = error as { status: number; code: string; meta: { missingScopes: string[] } };
      expect(err.status).toBe(403);
      expect(err.code).toBe("AUTH_FORBIDDEN");
      expect(err.meta.missingScopes).toEqual(["read:dashboard", "write:sequences"]);
    }
  });

  it("throws when apiKeyScopes is undefined for api_key source", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key" },
        "read:dashboard",
      ),
    ).toThrow("Insufficient API key permissions");
  });

  it("throws when apiKeyScopes is empty for api_key source", async () => {
    const { requireScope } = await loadAuth();

    expect(() =>
      requireScope(
        { workspaceId: "ws_1", workspaceName: "W", userId: null, source: "api_key", apiKeyScopes: [] },
        "read:dashboard",
      ),
    ).toThrow("Insufficient API key permissions");
  });
});
