import { db } from "@/lib/db";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "@/lib/constants";
import { ProblemError } from "@/lib/problem";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import { getDemoWorkspace } from "@/lib/demo-data";
import { log } from "@/lib/logger";

export async function getWorkspaceIdFromRequest(
  request: Request,
): Promise<string> {
  const url = new URL(request.url);
  const queryWorkspaceId = url.searchParams.get("workspaceId");
  if (queryWorkspaceId) return queryWorkspaceId;

  const headerWorkspaceId = request.headers.get("x-workspace-id");
  if (headerWorkspaceId) return headerWorkspaceId;

  return DEFAULT_WORKSPACE_ID;
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
