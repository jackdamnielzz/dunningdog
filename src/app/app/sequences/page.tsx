import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureWorkspaceExists, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { ProblemError } from "@/lib/problem";
import { ensureDefaultSequence } from "@/lib/services/recovery";
import { SequenceForm } from "@/components/forms/sequence-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SequencesPage() {
  const requestHeaders = await headers();
  const workspace = await resolveWorkspaceContextFromHeaders(requestHeaders).catch((error) => {
    if (error instanceof ProblemError && error.code === "AUTH_UNAUTHORIZED") {
      redirect("/login?next=/app/sequences");
    }
    throw error;
  });
  await ensureWorkspaceExists(workspace.workspaceId);
  const sequence = await ensureDefaultSequence(workspace.workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Dunning Sequences</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Configure the exact messaging your customers receive after a failed payment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default sequence editor</CardTitle>
        </CardHeader>
        <CardContent>
          <SequenceForm
            workspaceId={workspace.workspaceId}
            existingSequenceId={sequence.id}
            initialName={sequence.name}
            initialSteps={sequence.steps.map((s) => ({
              delayHours: s.delayHours,
              subjectTemplate: s.subjectTemplate,
              bodyTemplate: s.bodyTemplate,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
