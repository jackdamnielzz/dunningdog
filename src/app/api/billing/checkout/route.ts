import { z } from "zod";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { ensureWorkspaceExists, resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { createBillingCheckoutSession } from "@/lib/services/billing";
import { reportAnalyticsEvent } from "@/lib/observability";

const schema = z.object({
  plan: z.enum(["starter", "pro", "growth"]),
  workspaceId: z.string().min(2).optional(),
});

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, schema);
    const workspace = await resolveWorkspaceContextFromRequest(
      request,
      input.workspaceId ?? null,
    );
    await ensureWorkspaceExists(workspace.workspaceId);

    const checkout = await createBillingCheckoutSession({
      workspaceId: workspace.workspaceId,
      plan: input.plan,
    });

    reportAnalyticsEvent({
      event: "billing_checkout_started",
      distinctId: workspace.workspaceId,
      properties: {
        workspaceId: workspace.workspaceId,
        plan: input.plan,
        mode: checkout.mode,
      },
    });

    return ok({
      workspaceId: workspace.workspaceId,
      ...checkout,
    });
  } catch (error) {
    return routeError(error, "/api/billing/checkout");
  }
}
