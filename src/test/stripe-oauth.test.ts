import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const MOCK_SECRET_KEY = "sk_test_mock_key";
let originalFetch: typeof globalThis.fetch;

vi.mock("@/lib/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_mock_key",
  },
}));

import { exchangeOAuthCode, refreshOAuthToken } from "@/lib/stripe/oauth";

describe("stripe apps oauth helpers", () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("exchangeOAuthCode", () => {
    it("exchanges authorization code for tokens", async () => {
      const mockResponse = {
        access_token: "sk_test_access_123",
        refresh_token: "rt_refresh_456",
        stripe_user_id: "acct_abc123",
        scope: "stripe_apps",
        livemode: false,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await exchangeOAuthCode("ac_test_code");

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://api.stripe.com/v1/oauth/token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MOCK_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: expect.any(URLSearchParams),
        },
      );

      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = callArgs[1]!.body as URLSearchParams;
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("code")).toBe("ac_test_code");
    });

    it("throws on failed token exchange", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Bad Request",
        json: () =>
          Promise.resolve({ error_description: "Invalid auth code" }),
      });

      await expect(exchangeOAuthCode("bad_code")).rejects.toThrow(
        "Invalid auth code",
      );
    });

    it("falls back to statusText when json parsing fails", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("not json")),
      });

      await expect(exchangeOAuthCode("bad_code")).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  describe("refreshOAuthToken", () => {
    it("refreshes an expired access token", async () => {
      const mockResponse = {
        access_token: "sk_test_new_access",
        refresh_token: "rt_new_refresh",
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await refreshOAuthToken("rt_old_refresh");

      expect(result).toEqual(mockResponse);

      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = callArgs[1]!.body as URLSearchParams;
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe("rt_old_refresh");
    });

    it("throws on failed refresh", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
        json: () => Promise.resolve({}),
      });

      await expect(refreshOAuthToken("bad_token")).rejects.toThrow(
        "Stripe OAuth token refresh failed: Unauthorized",
      );
    });

    it("falls back to statusText when json parsing fails", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Bad Gateway",
        json: () => Promise.reject(new Error("not json")),
      });

      await expect(refreshOAuthToken("bad_token")).rejects.toThrow(
        "Bad Gateway",
      );
    });
  });
});
