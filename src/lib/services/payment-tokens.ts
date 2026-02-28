import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function generatePaymentUpdateToken(params: {
  workspaceId: string;
  recoveryAttemptId: string;
  expiresInHours?: number;
}) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(
    Date.now() + (params.expiresInHours ?? 72) * 60 * 60 * 1000,
  );

  await db.paymentUpdateToken.create({
    data: {
      workspaceId: params.workspaceId,
      recoveryAttemptId: params.recoveryAttemptId,
      token,
      expiresAt,
    },
  });

  const url = `${env.APP_BASE_URL}/update-payment/${token}`;
  return { token, url };
}

export async function validatePaymentUpdateToken(token: string) {
  const record = await db.paymentUpdateToken.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  if (record.usedAt) return null;

  return {
    workspaceId: record.workspaceId,
    recoveryAttemptId: record.recoveryAttemptId,
  };
}

export async function markTokenUsed(token: string) {
  await db.paymentUpdateToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}
