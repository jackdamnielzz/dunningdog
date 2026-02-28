import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { ok, routeError } from "@/lib/api";
import { ProblemError } from "@/lib/problem";
import { revokeApiKey } from "@/lib/services/api-keys";

const instance = "/api/settings/api-keys/[id]";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workspace = await resolveWorkspaceContextFromRequest(request);
    if (workspace.source === "api_key") {
      throw new ProblemError({
        title: "Session authentication required",
        status: 403,
        code: "AUTH_FORBIDDEN",
        detail: "API key revocation requires session authentication.",
      });
    }
    await revokeApiKey(id, workspace.workspaceId);
    return ok({ revoked: true });
  } catch (error) {
    return routeError(error, instance);
  }
}
