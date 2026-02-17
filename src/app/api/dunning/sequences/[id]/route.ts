import { updateSequence, updateSequenceSchema } from "@/lib/services/sequences";
import { resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { reportAnalyticsEvent } from "@/lib/observability";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const input = await parseJsonBody(request, updateSequenceSchema);
    const workspace = await resolveWorkspaceContextFromRequest(request);
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
