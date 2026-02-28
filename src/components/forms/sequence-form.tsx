"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const stepSchema = z.object({
  delayHours: z.number().int().min(0).max(720),
  subjectTemplate: z.string().min(3, "Subject is required"),
  bodyTemplate: z.string().min(10, "Body must be at least 10 characters"),
});

const sequenceFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  steps: z.array(stepSchema).min(1, "At least one step required").max(20, "Maximum 20 steps"),
});

type SequenceFormValues = z.infer<typeof sequenceFormSchema>;

export interface SequenceStep {
  delayHours: number;
  subjectTemplate: string;
  bodyTemplate: string;
}

interface SequenceFormProps {
  workspaceId: string;
  existingSequenceId?: string;
  initialName?: string;
  initialSteps?: SequenceStep[];
  maxSteps?: number;
}

const DEFAULT_STEPS: SequenceStep[] = [
  {
    delayHours: 0,
    subjectTemplate: "Action needed: update your payment details",
    bodyTemplate:
      "We could not process your recent payment. Please update your payment method to avoid subscription interruption.",
  },
  {
    delayHours: 72,
    subjectTemplate: "Reminder: your payment is still pending",
    bodyTemplate:
      "Your subscription is still at risk because payment details were not updated. Please review and update now.",
  },
  {
    delayHours: 168,
    subjectTemplate: "Final reminder before access is affected",
    bodyTemplate:
      "Please update your payment method now to keep your subscription active.",
  },
];

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediately";
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (days > 0 && remaining > 0) return `${days}d ${remaining}h`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  return `${hours}h`;
}

export function SequenceForm({
  workspaceId,
  existingSequenceId,
  initialName,
  initialSteps,
  maxSteps = 20,
}: SequenceFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<SequenceFormValues>({
    resolver: zodResolver(sequenceFormSchema),
    defaultValues: {
      name: initialName ?? "Default Recovery Sequence",
      steps: initialSteps ?? DEFAULT_STEPS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  async function onSubmit(values: SequenceFormValues) {
    setSaving(true);
    setMessage(null);
    try {
      const endpoint = existingSequenceId
        ? `/api/dunning/sequences/${existingSequenceId}`
        : "/api/dunning/sequences";
      const method = existingSequenceId ? "PATCH" : "POST";
      const payload = existingSequenceId
        ? { name: values.name, isEnabled: true, steps: values.steps }
        : { workspaceId, name: values.name, isEnabled: true, steps: values.steps };

      const response = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail ?? "Unable to save sequence.");
      }

      setMessage("Sequence saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Sequence Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const delayValue = form.watch(`steps.${index}.delayHours`);
          return (
            <fieldset
              key={field.id}
              className="space-y-3 rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between">
                <legend className="text-sm font-medium text-zinc-700">
                  Step {index + 1}{" "}
                  <span className="text-zinc-400">
                    ({formatDelay(Number(delayValue) || 0)} after failure)
                  </span>
                </legend>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`steps.${index}.delayHours`}>
                  Delay (hours after payment failure)
                </Label>
                <Input
                  id={`steps.${index}.delayHours`}
                  type="number"
                  min={0}
                  max={720}
                  {...form.register(`steps.${index}.delayHours`, { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`steps.${index}.subjectTemplate`}>Subject</Label>
                <Input
                  id={`steps.${index}.subjectTemplate`}
                  {...form.register(`steps.${index}.subjectTemplate`)}
                  placeholder="Email subject line"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`steps.${index}.bodyTemplate`}>Body</Label>
                <Textarea
                  id={`steps.${index}.bodyTemplate`}
                  {...form.register(`steps.${index}.bodyTemplate`)}
                  placeholder="Email body text"
                  rows={3}
                />
              </div>
            </fieldset>
          );
        })}
      </div>

      {fields.length < maxSteps ? (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              delayHours: (fields.length) * 48,
              subjectTemplate: "",
              bodyTemplate: "",
            })
          }
        >
          + Add step
        </Button>
      ) : fields.length < 20 ? (
        <p className="text-xs text-zinc-500">
          Upgrade your plan to add more steps (max {maxSteps} on current plan).
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save sequence"}
        </Button>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </div>
    </form>
  );
}
