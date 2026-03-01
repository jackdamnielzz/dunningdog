import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { setWorkspaceBillingPlan } from "@/lib/services/billing";

const instance = "/api/admin/set-plan";

const setPlanSchema = z.object({
  workspaceId: z.string().min(1),
  plan: z.enum(["starter", "pro", "growth"]),
});

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers);
    const input = await parseJsonBody(request, setPlanSchema);
    const workspace = await setWorkspaceBillingPlan(input.workspaceId, input.plan);
    return ok(workspace);
  } catch (error) {
    console.error("[admin/set-plan]", error);
    return routeError(error, instance);
  }
}
