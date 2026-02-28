import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const KEY_PREFIX = "dd_live_";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export const API_KEY_SCOPES = [
  "read:dashboard",
  "read:recoveries",
  "read:sequences",
  "write:sequences",
  "read:settings",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export async function generateApiKey(params: {
  workspaceId: string;
  label: string;
  scopes: string[];
}) {
  const raw = randomBytes(24).toString("hex");
  const fullKey = `${KEY_PREFIX}${raw}`;
  const prefix = fullKey.slice(0, 16);
  const hashedKey = hashKey(fullKey);

  const record = await db.apiKey.create({
    data: {
      workspaceId: params.workspaceId,
      prefix,
      hashedKey,
      label: params.label,
      scopes: params.scopes,
    },
  });

  return {
    id: record.id,
    key: fullKey,
    prefix,
    label: record.label,
    scopes: record.scopes,
    lastUsedAt: null,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function validateApiKey(key: string) {
  if (!key.startsWith(KEY_PREFIX)) return null;

  const hashedKey = hashKey(key);
  const record = await db.apiKey.findUnique({
    where: { hashedKey },
  });

  if (!record || record.revokedAt) return null;

  // Fire-and-forget: update lastUsedAt
  db.apiKey
    .update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    workspaceId: record.workspaceId,
    scopes: record.scopes,
    apiKeyId: record.id,
  };
}

export async function revokeApiKey(id: string, workspaceId: string) {
  await db.apiKey.updateMany({
    where: { id, workspaceId },
    data: { revokedAt: new Date() },
  });
}

export async function listApiKeys(workspaceId: string) {
  const keys = await db.apiKey.findMany({
    where: { workspaceId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      prefix: true,
      label: true,
      scopes: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return keys.map((k) => ({
    id: k.id,
    prefix: k.prefix,
    label: k.label,
    scopes: k.scopes,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));
}
