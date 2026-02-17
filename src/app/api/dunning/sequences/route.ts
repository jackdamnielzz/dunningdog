import { createSequence, createSequenceSchema } from "@/lib/services/sequences";
import { ensureWorkspaceExists, resolveWorkspaceContextFromRequest } from "@/lib/auth";
import { ok, parseJsonBody, routeError } from "@/lib/api";
import { reportAnalyticsEvent } from "@/lib/observability";

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, createSequenceSchema);
    const workspace = await resolveWorkspaceContextFromRequest(request, input.workspaceId);
    await ensureWorkspaceExists(workspace.workspaceId);
    const created = await createSequence({
      ...input,
      workspaceId: workspace.workspaceId,
    });

    reportAnalyticsEvent({
      event: "sequence_created",
      distinctId: workspace.workspaceId,
      properties: {
        workspaceId: workspace.workspaceId,
        sequenceId: created.id,
        stepCount: created.steps.length,
      },
    });

    return ok(
      {
        id: created.id,
        workspaceId: created.workspaceId,
        name: created.name,
        isEnabled: created.isEnabled,
        steps: created.steps.map((step) => ({
          id: step.id,
          delayHours: step.delayHours,
          subjectTemplate: step.subjectTemplate,
          bodyTemplate: step.bodyTemplate,
          status: step.status,
        })),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    return routeError(error, "/api/dunning/sequences");
  }
}
