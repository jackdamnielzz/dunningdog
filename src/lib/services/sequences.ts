import { z } from "zod";
import { db } from "@/lib/db";
import { ProblemError } from "@/lib/problem";

export const sequenceStepSchema = z.object({
  id: z.string().optional(),
  delayHours: z.number().int().min(0).max(24 * 30),
  subjectTemplate: z.string().min(3).max(120),
  bodyTemplate: z.string().min(10).max(5000),
});

export const createSequenceSchema = z.object({
  workspaceId: z.string().min(2),
  name: z.string().min(2).max(80),
  isEnabled: z.boolean().default(true),
  steps: z.array(sequenceStepSchema.omit({ id: true })).min(1).max(8),
});

export const updateSequenceSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  isEnabled: z.boolean().optional(),
  steps: z.array(sequenceStepSchema).min(1).max(8).optional(),
});

export async function createSequence(input: z.infer<typeof createSequenceSchema>) {
  return db.dunningSequence.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      isEnabled: input.isEnabled,
      steps: {
        create: input.steps.map((step, index) => ({
          stepOrder: index + 1,
          delayHours: step.delayHours,
          subjectTemplate: step.subjectTemplate,
          bodyTemplate: step.bodyTemplate,
          status: "scheduled",
        })),
      },
    },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
}

export async function updateSequence(
  id: string,
  input: z.infer<typeof updateSequenceSchema>,
) {
  const existing = await db.dunningSequence.findUnique({
    where: { id },
    include: { steps: true },
  });

  if (!existing) {
    throw new ProblemError({
      title: "Dunning sequence not found",
      status: 404,
      code: "DUNNING_SEQUENCE_NOT_FOUND",
      detail: `No sequence found for id ${id}.`,
    });
  }

  const updated = await db.$transaction(async (trx) => {
    const result = await trx.dunningSequence.update({
      where: { id },
      data: {
        name: input.name,
        isEnabled: input.isEnabled,
        version: { increment: input.steps ? 1 : 0 },
      },
    });

    if (input.steps) {
      await trx.dunningSequenceStep.deleteMany({
        where: { sequenceId: id },
      });
      await trx.dunningSequenceStep.createMany({
        data: input.steps.map((step, index) => ({
          sequenceId: id,
          stepOrder: index + 1,
          delayHours: step.delayHours,
          subjectTemplate: step.subjectTemplate,
          bodyTemplate: step.bodyTemplate,
          status: "scheduled",
        })),
      });
    }

    return result;
  });

  return db.dunningSequence.findUnique({
    where: { id: updated.id },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
}
