import { describe, expect, it, vi } from "vitest";

async function loadRoute() {
  vi.resetModules();

  vi.doMock("@/lib/env", () => ({
    env: {
      APP_BASE_URL: "http://localhost:3000",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    },
  }));

  const route = await import("@/app/api/auth/oauth/start/route");
  return route;
}

describe("auth oauth start route", () => {
  it("redirects to Supabase authorize with google provider", async () => {
    const route = await loadRoute();
    const response = await route.GET(
      new Request("http://localhost/api/auth/oauth/start?provider=google&next=%2Fapp%2Fsettings"),
    );

    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("https://project.supabase.co/auth/v1/authorize");
    expect(location).toContain("provider=google");
    expect(location).toContain(encodeURIComponent("http://localhost:3000/auth/callback?next=%2Fapp%2Fsettings"));
    expect(location).toContain("state=");
    expect(response.headers.get("set-cookie")).toContain("sb-oauth-state=");
  });

  it("maps microsoft provider to Supabase azure provider", async () => {
    const route = await loadRoute();
    const response = await route.GET(
      new Request("http://localhost/api/auth/oauth/start?provider=microsoft&next=%2Fapp"),
    );

    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("provider=azure");
  });

  it("returns bad request for unsupported provider", async () => {
    const route = await loadRoute();
    const response = await route.GET(
      new Request("http://localhost/api/auth/oauth/start?provider=github"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("AUTH_PROVIDER_UNSUPPORTED");
  });
});
