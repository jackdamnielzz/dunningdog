import { requireWorkspaceContext, ensureWorkspaceExists } from "@/lib/auth";
import { ensureDefaultSequence } from "@/lib/services/recovery";
import { maxSequenceSteps } from "@/lib/plan-features";
import { SequenceForm } from "@/components/forms/sequence-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SequencesPage() {
  const workspace = await requireWorkspaceContext("/app/sequences");
  const workspaceRecord = await ensureWorkspaceExists(workspace.workspaceId);
  const sequence = await ensureDefaultSequence(workspace.workspaceId);
  const stepLimit = maxSequenceSteps(workspaceRecord.billingPlan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Dunning Sequences</h1>
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
            maxSteps={stepLimit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
