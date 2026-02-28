import { ok, routeError } from "@/lib/api";
import { ensureWorkspaceExists, resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/services/billing";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request, null);
    await ensureWorkspaceExists(workspace.workspaceId);

    const result = await createBillingPortalSession({
      workspaceId: workspace.workspaceId,
      returnUrl: `${env.APP_BASE_URL}/app/settings`,
    });

    return ok(result);
  } catch (error) {
    return routeError(error, "/api/billing/portal");
  }
}
