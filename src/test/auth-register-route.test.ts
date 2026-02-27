import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: {
      NODE_ENV: "test",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    },
  }));

  const route = await import("@/app/api/auth/register/route");
  return route;
}

describe("auth register route", () => {
  it("creates account, authenticates, and sets sb-auth-token cookie", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "user_1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "token_123",
          expires_in: 3600,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "new@example.com",
        password: "Password123!",
        next: "/app/settings",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.created).toBe(true);
    expect(payload.authenticated).toBe(true);
    expect(payload.next).toBe("/app/settings");
    expect(response.headers.get("set-cookie")).toContain("sb-auth-token=");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns conflict when account already exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        msg: "User already registered",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "existing@example.com",
        password: "Password123!",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe("AUTH_CONFLICT");
  });
});

