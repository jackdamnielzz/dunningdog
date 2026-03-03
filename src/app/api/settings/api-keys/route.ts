import { z } from "zod";
import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { ProblemError } from "@/lib/problem";
import { generateApiKey, listApiKeys, API_KEY_SCOPES } from "@/lib/services/api-keys";
import { requireFeature } from "@/lib/plan-features";
import { requireActiveWorkspace } from "@/lib/trial";

const instance = "/api/settings/api-keys";

const createSchema = z.object({
  label: z.string().max(80),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1),
});

export async function GET(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await requireActiveWorkspace(workspace.workspaceId);
    if (workspace.source === "api_key") {
      throw new ProblemError({
        title: "Session authentication required",
        status: 403,
        code: "AUTH_FORBIDDEN",
        detail: "API key management requires session authentication.",
      });
    }
    const keys = await listApiKeys(workspace.workspaceId);
    return ok(keys);
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await requireActiveWorkspace(workspace.workspaceId);
    if (workspace.source === "api_key") {
      throw new ProblemError({
        title: "Session authentication required",
        status: 403,
        code: "AUTH_FORBIDDEN",
        detail: "API key creation requires session authentication.",
      });
    }
    await requireFeature(workspace.workspaceId, "api_access");
    const input = await parseJsonBody(request, createSchema);
    const result = await generateApiKey({
      workspaceId: workspace.workspaceId,
      label: input.label,
      scopes: input.scopes,
    });
    return ok(result, 201);
  } catch (error) {
    return routeError(error, instance);
  }
}
