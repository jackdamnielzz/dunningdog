import { db } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "@/lib/constants";
import { ProblemError } from "@/lib/problem";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoWorkspace } from "@/lib/demo-data";
import { log } from "@/lib/logger";
import { createSupabaseClient } from "@/lib/supabase";

export interface WorkspaceContext {
  workspaceId: string;
  workspaceName: string;
  userId: string | null;
  source: "authenticated" | "fallback";
}

const isSupabaseAuthConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return [] as Array<{ name: string; value: string }>;
  }

  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const index = chunk.indexOf("=");
      if (index <= 0) {
        return null;
      }
      return {
        name: chunk.slice(0, index).trim(),
        value: chunk.slice(index + 1).trim(),
      };
    })
    .filter((item): item is { name: string; value: string } => item !== null);
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function tryDecodeBase64(value: string) {
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function readAccessTokenFromCookieValue(rawValue: string) {
  const decoded = safeDecode(rawValue);
  const candidates = [decoded];

  if (decoded.startsWith("base64-")) {
    const base64Decoded = tryDecodeBase64(decoded.slice("base64-".length));
    if (base64Decoded) {
      candidates.push(base64Decoded);
    }
  } else {
    const maybeBase64 = tryDecodeBase64(decoded);
    if (maybeBase64) {
      candidates.push(maybeBase64);
    }
  }

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const token = (parsed as { access_token?: unknown }).access_token;
      if (typeof token === "string" && token.length > 20) {
        return token;
      }
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === "string" && item.includes(".") && item.length > 20) {
          return item;
        }
        if (item && typeof item === "object") {
          const nestedToken = (item as { access_token?: unknown }).access_token;
          if (typeof nestedToken === "string" && nestedToken.length > 20) {
            return nestedToken;
          }
        }
      }
    }

    if (candidate.includes(".") && candidate.length > 20) {
      return candidate;
    }
  }

  return null;
}

function extractAccessTokenFromCookies(cookieHeader: string | null) {
  const cookies = parseCookieHeader(cookieHeader);
  if (cookies.length === 0) {
    return null;
  }

  const directTokens = cookies.filter(
    (cookie) =>
      cookie.name.includes("auth-token") &&
      !cookie.name.endsWith(".sig") &&
      !/\.\d+$/.test(cookie.name),
  );

  for (const cookie of directTokens) {
    const token = readAccessTokenFromCookieValue(cookie.value);
    if (token) {
      return token;
    }
  }

  const chunkGroups = new Map<string, Array<{ index: number; value: string }>>();
  for (const cookie of cookies) {
    if (cookie.name.endsWith(".sig")) {
      continue;
    }
    const match = cookie.name.match(/^(.*auth-token)\.(\d+)$/);
    if (!match) {
      continue;
    }
    const baseName = match[1];
    const index = Number(match[2]);
    if (!Number.isFinite(index)) {
      continue;
    }
    const group = chunkGroups.get(baseName) ?? [];
    group.push({ index, value: cookie.value });
    chunkGroups.set(baseName, group);
  }

  for (const group of chunkGroups.values()) {
    const assembled = group
      .sort((a, b) => a.index - b.index)
      .map((item) => item.value)
      .join("");
    const token = readAccessTokenFromCookieValue(assembled);
    if (token) {
      return token;
    }
  }

  return null;
}

async function getAuthenticatedUserId(headers: Pick<Headers, "get">) {
  if (!isSupabaseAuthConfigured) {
    return null;
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return null;
  }

  const authorization = headers.get("authorization");
  const bearerToken =
    authorization && authorization.toLowerCase().startsWith("bearer ")
      ? authorization.slice(7).trim()
      : null;

  const cookieToken = extractAccessTokenFromCookies(headers.get("cookie"));
  const accessToken = bearerToken ?? cookieToken;
  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    log("warn", "Supabase user lookup failed", {
      reason: error?.message ?? "unknown",
    });
    return null;
  }

  return data.user.id;
}

async function resolveWorkspaceForAuthenticatedUser(
  userId: string,
  requestedWorkspaceId?: string,
) {
  if (requestedWorkspaceId) {
    const membership = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: requestedWorkspaceId,
          userId,
        },
      },
      include: { workspace: true },
    });

    if (!membership) {
      throw new ProblemError({
        title: "Workspace access denied",
        status: 403,
        code: "AUTH_FORBIDDEN",
        detail: `User ${userId} has no access to workspace ${requestedWorkspaceId}.`,
      });
    }

    return membership.workspace;
  }

  const firstMembership = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (firstMembership) {
    return firstMembership.workspace;
  }

  return db.workspace.create({
    data: {
      name: `Workspace ${userId.slice(0, 8)}`,
      ownerUserId: userId,
      timezone: "UTC",
      billingPlan: "starter",
      isActive: true,
      members: {
        create: {
          userId,
          role: "owner",
        },
      },
    },
  });
}

export async function getWorkspaceIdFromRequest(
  request: Request,
): Promise<string> {
  const context = await resolveWorkspaceContextFromRequest(request);
  return context.workspaceId;
}

function readWorkspaceIdFromRequest(request: Request) {
  const url = new URL(request.url);
  const queryWorkspaceId = url.searchParams.get("workspaceId");
  if (queryWorkspaceId) {
    return queryWorkspaceId;
  }

  const headerWorkspaceId = request.headers.get("x-workspace-id");
  if (headerWorkspaceId) {
    return headerWorkspaceId;
  }

  return DEFAULT_WORKSPACE_ID;
}

export async function resolveWorkspaceContextFromHeaders(
  headers: Pick<Headers, "get">,
  requestedWorkspaceId?: string | null,
): Promise<WorkspaceContext> {
  const preferredWorkspaceId = requestedWorkspaceId ?? headers.get("x-workspace-id");
  const userId = await getAuthenticatedUserId(headers);

  if (isSupabaseAuthConfigured && !isDemoMode) {
    if (!userId) {
      throw new ProblemError({
        title: "Authentication required",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail: "Sign in with Supabase Auth to access workspace data.",
      });
    }

    try {
      const workspace = await resolveWorkspaceForAuthenticatedUser(
        userId,
        preferredWorkspaceId ?? undefined,
      );

      return {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        userId,
        source: "authenticated",
      };
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      const fallbackId = preferredWorkspaceId ?? DEFAULT_WORKSPACE_ID;
      log("warn", "Falling back to demo workspace for authenticated context", {
        fallbackId,
        userId,
        reason: describeFailure(error),
      });
      const demoWorkspace = getDemoWorkspace(fallbackId);
      return {
        workspaceId: demoWorkspace.id,
        workspaceName: demoWorkspace.name,
        userId,
        source: "fallback",
      };
    }
  }

  const fallbackWorkspaceId = preferredWorkspaceId ?? DEFAULT_WORKSPACE_ID;
  const workspace = await ensureWorkspaceExists(fallbackWorkspaceId);
  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    userId,
    source: "fallback",
  };
}

export async function resolveWorkspaceContextFromRequest(
  request: Request,
  explicitWorkspaceId?: string | null,
) {
  const preferredWorkspaceId = explicitWorkspaceId ?? readWorkspaceIdFromRequest(request);
  return resolveWorkspaceContextFromHeaders(request.headers, preferredWorkspaceId);
}

export async function ensureWorkspaceExists(workspaceId: string) {
  try {
    const existing = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (existing) return existing;

    if (workspaceId !== DEFAULT_WORKSPACE_ID) {
      throw new ProblemError({
        title: "Workspace not found",
        status: 404,
        code: "AUTH_FORBIDDEN",
        detail: `Workspace ${workspaceId} does not exist or is inaccessible.`,
      });
    }

    return db.workspace.create({
      data: {
        id: DEFAULT_WORKSPACE_ID,
        name: DEFAULT_WORKSPACE_NAME,
        ownerUserId: "demo-owner",
        timezone: "UTC",
        billingPlan: "starter",
        isActive: true,
        members: {
          create: {
            userId: "demo-owner",
            role: "owner",
          },
        },
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      log("warn", "Falling back to demo workspace due to database availability issue", {
        workspaceId,
        reason: describeFailure(error),
      });
      return getDemoWorkspace(workspaceId);
    }

    throw error;
  }
}
