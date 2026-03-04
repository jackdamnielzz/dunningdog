import { resolveWorkspaceContextFromRequest, requireScope } from "@/lib/auth";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { getBranding, upsertBranding, brandingSchema } from "@/lib/services/branding";
import { requireFeature } from "@/lib/plan-features";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import { requireActiveWorkspace } from "@/lib/trial";

const instance = "/api/settings/branding";

export async function GET(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    requireScope(workspace, "read:settings");
    await requireActiveWorkspace(workspace.workspaceId);
    const branding = await getBranding(workspace.workspaceId);
    return ok(branding ?? { companyName: null, logoUrl: null, accentColor: DEFAULT_ACCENT_COLOR, footerText: null });
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function PUT(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await requireActiveWorkspace(workspace.workspaceId);
    await requireFeature(workspace.workspaceId, "email_branding");
    const input = await parseJsonBody(request, brandingSchema);
    const branding = await upsertBranding(workspace.workspaceId, input);
    return ok(branding);
  } catch (error) {
    return routeError(error, instance);
  }
}
