import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: {
      NODE_ENV: "test",
    },
  }));

  const route = await import("@/app/api/auth/session/route");
  return route;
}

describe("auth session route", () => {
  it("sets sb-auth-token cookie and returns safe next path", async () => {
    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
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

  it("falls back to /app for unsafe next values", async () => {
    const route = await loadRoute();
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        accessToken: "token_1234567890123456789012345",
        next: "https://evil.example.com",
      }),
    });

    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.next).toBe("/app");
  });
});

