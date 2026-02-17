import { updateSequence, updateSequenceSchema } from "@/lib/services/sequences";
import { ok, parseJsonBody, routeError } from "@/lib/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const input = await parseJsonBody(request, updateSequenceSchema);
    const updated = await updateSequence(id, input);
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
