import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { getBranding, upsertBranding, brandingSchema } from "@/lib/services/branding";

const instance = "/api/settings/branding";

export async function GET(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    const branding = await getBranding(workspace.workspaceId);
    return ok(branding ?? { companyName: null, logoUrl: null, accentColor: "#10b981", footerText: null });
  } catch (error) {
    return routeError(error, instance);
  }
}

export async function PUT(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    const input = await parseJsonBody(request, brandingSchema);
    const branding = await upsertBranding(workspace.workspaceId, input);
    return ok(branding);
  } catch (error) {
    return routeError(error, instance);
  }
}
