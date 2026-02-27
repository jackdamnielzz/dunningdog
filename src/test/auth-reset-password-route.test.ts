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

  const route = await import("@/app/api/auth/reset-password/route");
  return route;
}

describe("auth reset password route", () => {
  it("updates password and sets auth cookie on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        password: "Password123!",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.updated).toBe(true);
    expect(payload.next).toBe("/app");
    expect(response.headers.get("set-cookie")).toContain("sb-auth-token=");
  });

  it("returns unauthorized for invalid or expired token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error_description: "JWT expired",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        password: "Password123!",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_UNAUTHORIZED");
    expect(String(payload.detail)).toContain("JWT expired");
  });
});

