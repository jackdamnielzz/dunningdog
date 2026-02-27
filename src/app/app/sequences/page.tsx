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
            initialValues={{
              name: sequence.name,
              step1Subject: sequence.steps[0]?.subjectTemplate,
              step1Body: sequence.steps[0]?.bodyTemplate,
              step2Subject: sequence.steps[1]?.subjectTemplate,
              step2Body: sequence.steps[1]?.bodyTemplate,
              step3Subject: sequence.steps[2]?.subjectTemplate,
              step3Body: sequence.steps[2]?.bodyTemplate,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
