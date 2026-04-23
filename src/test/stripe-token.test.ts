import { describe, expect, it, vi, beforeEach } from "vitest";
import { addHours, subMinutes } from "date-fns";

const mockUpdate = vi.fn();
const mockRefreshOAuthToken = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    connectedStripeAccount: {
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock("@/lib/crypto", () => ({
  decryptText: (text: string) => `decrypted_${text}`,
  encryptText: (text: string) => `encrypted_${text}`,
}));

vi.mock("@/lib/stripe/oauth", () => ({
  refreshOAuthToken: (...args: unknown[]) => mockRefreshOAuthToken(...args),
}));

vi.mock("@/lib/logger", () => ({
  log: vi.fn(),
}));

describe("getValidAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns decrypted token when not expired", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    const account = {
      id: "csa_1",
      accessTokenEnc: "my_token",
      refreshTokenEnc: "my_refresh",
      tokenExpiresAt: addHours(new Date(), 1),
    };

    const result = await getValidAccessToken(account);
    expect(result).toBe("decrypted_my_token");
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
  });

  it("returns decrypted token when tokenExpiresAt is null", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    const account = {
      id: "csa_1",
      accessTokenEnc: "my_token",
      refreshTokenEnc: "my_refresh",
      tokenExpiresAt: null,
    };

    const result = await getValidAccessToken(account);
    expect(result).toBe("decrypted_my_token");
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
  });

  it("refreshes token when expired", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: "new_access_token",
      refresh_token: "new_refresh_token",
    });
    mockUpdate.mockResolvedValue({});

    const account = {
      id: "csa_1",
      accessTokenEnc: "old_token",
      refreshTokenEnc: "old_refresh",
      tokenExpiresAt: subMinutes(new Date(), 10),
    };

    const result = await getValidAccessToken(account);
    expect(result).toBe("new_access_token");
    expect(mockRefreshOAuthToken).toHaveBeenCalledWith("decrypted_old_refresh");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "csa_1" },
      data: {
        accessTokenEnc: "encrypted_new_access_token",
        refreshTokenEnc: "encrypted_new_refresh_token",
        tokenExpiresAt: expect.any(Date),
      },
    });
  });

  it("refreshes token when within 5-minute buffer", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: "new_token",
      refresh_token: "new_refresh",
    });
    mockUpdate.mockResolvedValue({});

    const account = {
      id: "csa_1",
      accessTokenEnc: "old_token",
      refreshTokenEnc: "old_refresh",
      tokenExpiresAt: new Date(Date.now() + 2 * 60_000), // 2 minutes from now
    };

    const result = await getValidAccessToken(account);
    expect(result).toBe("new_token");
    expect(mockRefreshOAuthToken).toHaveBeenCalled();
  });

  it("returns expired token when no refresh token available", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    const account = {
      id: "csa_1",
      accessTokenEnc: "expired_token",
      refreshTokenEnc: null,
      tokenExpiresAt: subMinutes(new Date(), 10),
    };

    const result = await getValidAccessToken(account);
    expect(result).toBe("decrypted_expired_token");
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
  });

  it("keeps old refresh token when new one is not returned", async () => {
    const { getValidAccessToken } = await import("@/lib/stripe/token");
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: "new_access",
      refresh_token: undefined,
    });
    mockUpdate.mockResolvedValue({});

    const account = {
      id: "csa_1",
      accessTokenEnc: "old_token",
      refreshTokenEnc: "old_refresh",
      tokenExpiresAt: subMinutes(new Date(), 10),
    };

    await getValidAccessToken(account);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          refreshTokenEnc: "encrypted_decrypted_old_refresh",
        }),
      }),
    );
  });
});
