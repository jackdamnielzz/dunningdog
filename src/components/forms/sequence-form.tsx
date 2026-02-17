"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const sequenceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  step1Subject: z.string().min(3),
  step1Body: z.string().min(10),
  step2Subject: z.string().min(3),
  step2Body: z.string().min(10),
  step3Subject: z.string().min(3),
  step3Body: z.string().min(10),
});

type SequenceFormValues = z.infer<typeof sequenceSchema>;

interface SequenceFormProps {
  workspaceId: string;
  existingSequenceId?: string;
  initialValues?: Partial<SequenceFormValues>;
}

export function SequenceForm({
  workspaceId,
  existingSequenceId,
  initialValues,
}: SequenceFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const defaults = useMemo<SequenceFormValues>(
    () => ({
      name: initialValues?.name ?? "Default Recovery Sequence",
      step1Subject:
        initialValues?.step1Subject ??
        "Action needed: update your payment details",
      step1Body:
        initialValues?.step1Body ??
        "We could not process your recent payment. Please update your payment method to avoid subscription interruption.",
      step2Subject:
        initialValues?.step2Subject ??
        "Reminder: your payment is still pending",
      step2Body:
        initialValues?.step2Body ??
        "Your subscription is still at risk because payment details were not updated. Please review and update now.",
      step3Subject:
        initialValues?.step3Subject ??
        "Final reminder before access is affected",
      step3Body:
        initialValues?.step3Body ??
        "Please update your payment method now to keep your subscription active.",
    }),
    [initialValues],
  );

  const form = useForm<SequenceFormValues>({
    resolver: zodResolver(sequenceSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: SequenceFormValues) {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        workspaceId,
        name: values.name,
        isEnabled: true,
        steps: [
          {
            delayHours: 0,
            subjectTemplate: values.step1Subject,
            bodyTemplate: values.step1Body,
          },
          {
            delayHours: 72,
            subjectTemplate: values.step2Subject,
            bodyTemplate: values.step2Body,
          },
          {
            delayHours: 168,
            subjectTemplate: values.step3Subject,
            bodyTemplate: values.step3Body,
          },
        ],
      };

      const endpoint = existingSequenceId
        ? `/api/dunning/sequences/${existingSequenceId}`
        : "/api/dunning/sequences";
      const method = existingSequenceId ? "PATCH" : "POST";
      const body = existingSequenceId
        ? JSON.stringify({
            name: payload.name,
            isEnabled: payload.isEnabled,
            steps: payload.steps,
          })
        : JSON.stringify(payload);

      const response = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body,
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
      </div>

      <fieldset className="space-y-2 rounded-lg border border-zinc-200 p-4">
        <legend className="px-2 text-sm font-medium text-zinc-700">Step 1 (Day 0)</legend>
        <Input {...form.register("step1Subject")} placeholder="Subject" />
        <Textarea {...form.register("step1Body")} placeholder="Email body" />
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-zinc-200 p-4">
        <legend className="px-2 text-sm font-medium text-zinc-700">Step 2 (Day 3)</legend>
        <Input {...form.register("step2Subject")} placeholder="Subject" />
        <Textarea {...form.register("step2Body")} placeholder="Email body" />
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-zinc-200 p-4">
        <legend className="px-2 text-sm font-medium text-zinc-700">Step 3 (Day 7)</legend>
        <Input {...form.register("step3Subject")} placeholder="Subject" />
        <Textarea {...form.register("step3Body")} placeholder="Email body" />
      </fieldset>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save sequence"}
      </Button>
      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </form>
  );
}
