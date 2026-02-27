import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: {
      NODE_ENV: "test",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    },
  }));

  const route = await import("@/app/api/auth/login/route");
  return route;
}

describe("auth login route", () => {
  it("sets sb-auth-token cookie and returns next path on successful login", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token_123",
        expires_in: 3600,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
        next: "/app/settings",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.authenticated).toBe(true);
    expect(payload.next).toBe("/app/settings");
    expect(response.headers.get("set-cookie")).toContain("sb-auth-token=");
  });

  it("returns unauthorized when Supabase rejects credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error_description: "Invalid login credentials",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_UNAUTHORIZED");
  });
});

