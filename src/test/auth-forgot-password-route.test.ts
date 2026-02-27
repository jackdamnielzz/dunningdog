import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  const logMock = vi.fn();
  vi.doMock("@/lib/logger", () => ({
    log: logMock,
  }));
  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    },
  }));

  const route = await import("@/app/api/auth/forgot-password/route");
  return { route, logMock };
}

describe("auth forgot password route", () => {
  it("returns generic success when provider call succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { route } = await loadRoute();
    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "someone@example.com",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sent).toBe(true);
    expect(String(payload.message)).toContain("If an account exists");
  });

  it("still returns generic success when provider call fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        msg: "rate limit",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { route, logMock } = await loadRoute();
    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "someone@example.com",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sent).toBe(true);
    expect(logMock).toHaveBeenCalledWith(
      "warn",
      "Forgot password provider call failed",
      expect.objectContaining({ status: 400 }),
    );
  });
});

