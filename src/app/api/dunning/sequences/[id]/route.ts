import { updateSequence, updateSequenceSchema } from "@/lib/services/sequences";
import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { reportAnalyticsEvent } from "@/lib/observability";
import { maxSequenceSteps } from "@/lib/plan-features";
import { db } from "@/lib/db";
import { ProblemError } from "@/lib/problem";
import { requireActiveWorkspace } from "@/lib/trial";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const input = await parseJsonBody(request, updateSequenceSchema);
    const workspace = await resolveWorkspaceContextFromRequest(request);
    await requireActiveWorkspace(workspace.workspaceId);

    if (input.steps && input.steps.length > 0) {
      const ws = await db.workspace.findUnique({
        where: { id: workspace.workspaceId },
        select: { billingPlan: true },
      });
      const limit = maxSequenceSteps(ws?.billingPlan ?? "starter");
      if (input.steps.length > limit) {
        throw new ProblemError({
          title: "Step limit exceeded",
          status: 403,
          code: "FEATURE_NOT_AVAILABLE",
          detail: `Your plan allows up to ${limit} steps. Upgrade to add more.`,
        });
      }
    }

    const updated = await updateSequence(id, input, workspace.workspaceId);
    if (updated) {
      reportAnalyticsEvent({
        event: "sequence_updated",
        distinctId: workspace.workspaceId,
        properties: {
          workspaceId: workspace.workspaceId,
          sequenceId: updated.id,
          stepCount: updated.steps.length,
          version: updated.version,
        },
      });
    }
    return ok({
      id: updated?.id,
      workspaceId: updated?.workspaceId,
      name: updated?.name,
      isEnabled: updated?.isEnabled,
      steps:
        updated?.steps.map((step) => ({
          id: step.id,
          delayHours: step.delayHours,
          subjectTemplate: step.subjectTemplate,
          bodyTemplate: step.bodyTemplate,
          status: step.status,
        })) ?? [],
      createdAt: updated?.createdAt.toISOString(),
      updatedAt: updated?.updatedAt.toISOString(),
    });
  } catch (error) {
    return routeError(error, "/api/dunning/sequences/:id");
  }
}
