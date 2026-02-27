import { describe, expect, it, vi } from "vitest";

type LoadRouteOptions = {
  getUserResult?: {
    data: { user: { id: string } | null };
    error: { message: string } | null;
  };
};

async function loadRoute(options?: LoadRouteOptions) {
  vi.resetModules();
  const mockGetUser = vi.fn().mockResolvedValue(
    options?.getUserResult ?? {
      data: { user: { id: "user_1" } },
      error: null,
    },
  );

  vi.doMock("@/lib/env", () => ({
    env: {
      NODE_ENV: "test",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    },
  }));

  vi.doMock("@/lib/supabase", () => ({
    createSupabaseClient: () => ({
      auth: {
        getUser: mockGetUser,
      },
    }),
  }));

  const route = await import("@/app/api/auth/session/route");
  return { route, mockGetUser };
}

describe("auth session route", () => {
  it("sets sb-auth-token cookie and returns safe next path", async () => {
    const { route, mockGetUser } = await loadRoute();
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sb-oauth-state=oauth_state_123",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        refreshToken: "refresh_1234567890123456789012345",
        expiresIn: 7200,
        next: "/app/settings",
        state: "oauth_state_123",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.authenticated).toBe(true);
    expect(payload.next).toBe("/app/settings");
    expect(payload.userId).toBe("user_1");
    expect(mockGetUser).toHaveBeenCalledWith("token_1234567890123456789012345");
    expect(response.headers.get("set-cookie")).toContain("sb-auth-token=");
    expect(response.headers.get("set-cookie")).toContain("sb-oauth-state=;");
  });

  it("falls back to /app for unsafe next values", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sb-oauth-state=oauth_state_123",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        next: "https://evil.example.com",
        state: "oauth_state_123",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.next).toBe("/app");
  });

  it("returns unauthorized when OAuth state does not match cookie", async () => {
    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sb-oauth-state=oauth_state_expected",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        state: "oauth_state_other",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_OAUTH_INVALID_STATE");
  });

  it("returns unauthorized when Supabase rejects OAuth access token", async () => {
    const { route } = await loadRoute({
      getUserResult: {
        data: { user: null },
        error: { message: "JWT expired" },
      },
    });

    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "sb-oauth-state=oauth_state_123",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        state: "oauth_state_123",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_UNAUTHORIZED");
  });
});
