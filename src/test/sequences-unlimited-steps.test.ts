import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- module loader ------------------------------------------------ */

async function loadSequences(deps?: {
  create?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  deleteMany?: ReturnType<typeof vi.fn>;
  createMany?: ReturnType<typeof vi.fn>;
  transaction?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const create = deps?.create ?? vi.fn().mockResolvedValue({ id: "seq_1" });
  const findUnique = deps?.findUnique ?? vi.fn().mockResolvedValue(null);
  const update = deps?.update ?? vi.fn().mockResolvedValue({ id: "seq_1" });
  const deleteMany = deps?.deleteMany ?? vi.fn().mockResolvedValue({ count: 0 });
  const createMany = deps?.createMany ?? vi.fn().mockResolvedValue({ count: 0 });

  const trxMock = {
    dunningSequence: { update },
    dunningSequenceStep: { deleteMany, createMany },
  };

  const transaction =
    deps?.transaction ??
    vi.fn(async (fn: (trx: typeof trxMock) => Promise<unknown>) => fn(trxMock));

  vi.doMock("@/lib/db", () => ({
    db: {
      dunningSequence: { create, findUnique, update },
      dunningSequenceStep: { deleteMany, createMany },
      $transaction: transaction,
    },
  }));

  vi.doMock("@/lib/problem", () => ({
    ProblemError: class ProblemError extends Error {
      code: string;
      status: number;
      constructor(p: { title: string; status: number; code: string; detail: string }) {
        super(p.title);
        this.code = p.code;
        this.status = p.status;
      }
    },
  }));

  const sequences = await import("@/lib/services/sequences");
  return { sequences, create, findUnique, update, deleteMany, createMany, transaction };
}

/* ---------- helpers ------------------------------------------------------ */

function makeStep(overrides?: Partial<{ delayHours: number; subjectTemplate: string; bodyTemplate: string }>) {
  return {
    delayHours: overrides?.delayHours ?? 0,
    subjectTemplate: overrides?.subjectTemplate ?? "Test subject line",
    bodyTemplate: overrides?.bodyTemplate ?? "Test body content with enough chars",
  };
}

/* ======================================================================== */
/*  Feature 1: Unlimited Sequence Steps                                      */
/* ======================================================================== */

describe("Feature 1: Unlimited sequence steps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSequenceSchema validation", () => {
    it("accepts 1 step (minimum)", async () => {
      const { sequences } = await loadSequences();
      const result = sequences.createSequenceSchema.safeParse({
        workspaceId: "ws_1",
        name: "My Sequence",
        steps: [makeStep()],
      });
      expect(result.success).toBe(true);
    });

    it("accepts 20 steps (maximum)", async () => {
      const { sequences } = await loadSequences();
      const steps = Array.from({ length: 20 }, (_, i) =>
        makeStep({ delayHours: i * 24 }),
      );
      const result = sequences.createSequenceSchema.safeParse({
        workspaceId: "ws_1",
        name: "Big Sequence",
        steps,
      });
      expect(result.success).toBe(true);
    });

    it("rejects 21 steps (over maximum)", async () => {
      const { sequences } = await loadSequences();
      const steps = Array.from({ length: 21 }, (_, i) =>
        makeStep({ delayHours: i * 24 }),
      );
      const result = sequences.createSequenceSchema.safeParse({
        workspaceId: "ws_1",
        name: "Too Many Steps",
        steps,
      });
      expect(result.success).toBe(false);
    });

    it("rejects 0 steps (under minimum)", async () => {
      const { sequences } = await loadSequences();
      const result = sequences.createSequenceSchema.safeParse({
        workspaceId: "ws_1",
        name: "Empty Sequence",
        steps: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateSequenceSchema validation", () => {
    it("accepts up to 20 steps", async () => {
      const { sequences } = await loadSequences();
      const steps = Array.from({ length: 20 }, (_, i) =>
        makeStep({ delayHours: i * 12 }),
      );
      const result = sequences.updateSequenceSchema.safeParse({ steps });
      expect(result.success).toBe(true);
    });

    it("rejects more than 20 steps", async () => {
      const { sequences } = await loadSequences();
      const steps = Array.from({ length: 21 }, () => makeStep());
      const result = sequences.updateSequenceSchema.safeParse({ steps });
      expect(result.success).toBe(false);
    });
  });

  describe("createSequence", () => {
    it("creates a sequence with multiple steps in correct order", async () => {
      const create = vi.fn().mockResolvedValue({
        id: "seq_new",
        name: "Recovery Flow",
        steps: [],
      });
      const { sequences } = await loadSequences({ create });

      await sequences.createSequence({
        workspaceId: "ws_1",
        name: "Recovery Flow",
        isEnabled: true,
        steps: [
          makeStep({ delayHours: 0 }),
          makeStep({ delayHours: 48 }),
          makeStep({ delayHours: 168 }),
        ],
      });

      expect(create).toHaveBeenCalledTimes(1);
      const callArg = create.mock.calls[0][0];
      expect(callArg.data.steps.create).toHaveLength(3);
      expect(callArg.data.steps.create[0].stepOrder).toBe(1);
      expect(callArg.data.steps.create[1].stepOrder).toBe(2);
      expect(callArg.data.steps.create[2].stepOrder).toBe(3);
    });

    it("creates a sequence with 20 steps", async () => {
      const create = vi.fn().mockResolvedValue({ id: "seq_big", steps: [] });
      const { sequences } = await loadSequences({ create });

      const steps = Array.from({ length: 20 }, (_, i) =>
        makeStep({ delayHours: i * 24 }),
      );

      await sequences.createSequence({
        workspaceId: "ws_1",
        name: "Big Sequence",
        isEnabled: true,
        steps,
      });

      const callArg = create.mock.calls[0][0];
      expect(callArg.data.steps.create).toHaveLength(20);
      expect(callArg.data.steps.create[19].stepOrder).toBe(20);
    });
  });

  describe("updateSequence", () => {
    it("replaces all steps with new ones in a transaction", async () => {
      const findUnique = vi
        .fn()
        .mockResolvedValueOnce({
          id: "seq_1",
          workspaceId: "ws_1",
          steps: [{ id: "old_step_1" }],
        })
        .mockResolvedValueOnce({
          id: "seq_1",
          steps: [{ id: "new_step_1" }, { id: "new_step_2" }],
        });

      const update = vi.fn().mockResolvedValue({ id: "seq_1" });
      const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
      const createMany = vi.fn().mockResolvedValue({ count: 2 });

      const { sequences } = await loadSequences({
        findUnique,
        update,
        deleteMany,
        createMany,
      });

      const result = await sequences.updateSequence("seq_1", {
        steps: [
          makeStep({ delayHours: 0 }),
          makeStep({ delayHours: 72 }),
        ],
      });

      expect(deleteMany).toHaveBeenCalledWith({
        where: { sequenceId: "seq_1" },
      });
      expect(createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ stepOrder: 1, delayHours: 0 }),
          expect.objectContaining({ stepOrder: 2, delayHours: 72 }),
        ]),
      });
      expect(result).toBeTruthy();
    });

    it("throws 404 when sequence not found", async () => {
      const findUnique = vi.fn().mockResolvedValue(null);
      const { sequences } = await loadSequences({ findUnique });

      await expect(
        sequences.updateSequence("seq_nonexistent", { name: "Updated" }),
      ).rejects.toMatchObject({ code: "DUNNING_SEQUENCE_NOT_FOUND", status: 404 });
    });

    it("throws 403 when workspace mismatch", async () => {
      const findUnique = vi.fn().mockResolvedValue({
        id: "seq_1",
        workspaceId: "ws_other",
        steps: [],
      });
      const { sequences } = await loadSequences({ findUnique });

      await expect(
        sequences.updateSequence("seq_1", { name: "Hacked" }, "ws_mine"),
      ).rejects.toMatchObject({ code: "AUTH_FORBIDDEN", status: 403 });
    });
  });
});
