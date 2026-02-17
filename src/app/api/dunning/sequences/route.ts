import { createSequence, createSequenceSchema } from "@/lib/services/sequences";
import { ensureWorkspaceExists } from "@/lib/auth";
import { ok, parseJsonBody, routeError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, createSequenceSchema);
    await ensureWorkspaceExists(input.workspaceId);
    const created = await createSequence(input);
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
