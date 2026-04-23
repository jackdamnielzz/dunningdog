import { addHours, isBefore } from "date-fns";
import { db } from "@/lib/db";
import { decryptText, encryptText } from "@/lib/crypto";
import { refreshOAuthToken } from "@/lib/stripe/oauth";
import { log } from "@/lib/logger";

interface ConnectedAccount {
  id: string;
  accessTokenEnc: string;
  refreshTokenEnc: string | null;
  tokenExpiresAt: Date | null;
}

/**
 * Returns a valid access token for the connected Stripe account.
 * If the token is expired and a refresh token is available, it refreshes
 * the token automatically and updates the database.
 */
export async function getValidAccessToken(
  account: ConnectedAccount,
): Promise<string> {
  const now = new Date();
  const bufferMinutes = 5;
  const bufferDate = new Date(now.getTime() + bufferMinutes * 60_000);

  const isExpired =
    account.tokenExpiresAt && isBefore(account.tokenExpiresAt, bufferDate);

  if (!isExpired) {
    return decryptText(account.accessTokenEnc);
  }

  if (!account.refreshTokenEnc) {
    log("warn", "Access token expired but no refresh token available", {
      accountId: account.id,
    });
    return decryptText(account.accessTokenEnc);
  }

  const refreshToken = decryptText(account.refreshTokenEnc);
  const tokenResponse = await refreshOAuthToken(refreshToken);

  const newAccessToken = tokenResponse.access_token!;
  const newRefreshToken = tokenResponse.refresh_token ?? refreshToken;
  const tokenExpiresAt = addHours(new Date(), 1);

  await db.connectedStripeAccount.update({
    where: { id: account.id },
    data: {
      accessTokenEnc: encryptText(newAccessToken),
      refreshTokenEnc: encryptText(newRefreshToken),
      tokenExpiresAt,
    },
  });

  log("info", "Refreshed Stripe Apps OAuth token", {
    accountId: account.id,
  });

  return newAccessToken;
}
