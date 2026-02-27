import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadSequences() {
  vi.resetModules();

  const createMock = vi.fn().mockResolvedValue({
    id: "seq_1",
    workspaceId: "ws_1",
    name: "Default",
    isEnabled: true,
    version: 1,
    steps: [
      {
        id: "step_1",
        stepOrder: 1,
        delayHours: 0,
        subjectTemplate: "Subject",
        bodyTemplate: "Body Body Body",
        status: "scheduled",
      },
    ],
  });

  const findUniqueMock = vi.fn().mockResolvedValue({
    id: "seq_1",
    workspaceId: "ws_1",
    name: "Default",
    isEnabled: true,
    version: 2,
    steps: [],
  });

  const txUpdateMock = vi.fn().mockResolvedValue({
    id: "seq_1",
  });
  const txDeleteManyMock = vi.fn().mockResolvedValue({ count: 1 });
  const txCreateManyMock = vi.fn().mockResolvedValue({ count: 1 });

  const transactionMock = vi.fn().mockImplementation(async (handler: (tx: {
    dunningSequence: { update: typeof txUpdateMock };
    dunningSequenceStep: { deleteMany: typeof txDeleteManyMock; createMany: typeof txCreateManyMock };
  }) => unknown) =>
    handler({
      dunningSequence: {
        update: txUpdateMock,
      },
      dunningSequenceStep: {
        deleteMany: txDeleteManyMock,
        createMany: txCreateManyMock,
      },
    }),
  );

  vi.doMock("@/lib/db", () => ({
    db: {
      dunningSequence: {
        create: createMock,
        findUnique: findUniqueMock,
      },
      dunningSequenceStep: {
        createMany: txCreateManyMock,
        deleteMany: txDeleteManyMock,
      },
      $transaction: transactionMock,
    },
  }));

  const sequences = await import("@/lib/services/sequences");
  return {
    sequences,
    createMock,
    findUniqueMock,
    txUpdateMock,
    txDeleteManyMock,
    txCreateManyMock,
  };
}

describe("sequence service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a sequence with ordered steps", async () => {
    const { sequences, createMock } = await loadSequences();

    await sequences.createSequence({
      workspaceId: "ws_1",
      name: "Recovery",
      isEnabled: true,
      steps: [
        {
          delayHours: 0,
          subjectTemplate: "Step 1",
          bodyTemplate: "Step 1 body content",
        },
        {
          delayHours: 72,
          subjectTemplate: "Step 2",
          bodyTemplate: "Step 2 body content",
        },
      ],
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { steps: { orderBy: { stepOrder: "asc" } } },
        data: expect.objectContaining({
          workspaceId: "ws_1",
          steps: {
            create: [
              expect.objectContaining({
                stepOrder: 1,
                delayHours: 0,
                subjectTemplate: "Step 1",
                status: "scheduled",
              }),
              expect.objectContaining({
                stepOrder: 2,
                delayHours: 72,
                subjectTemplate: "Step 2",
                status: "scheduled",
              }),
            ],
          },
        }),
      }),
    );
  });

  it("throws 404 when updating a missing sequence", async () => {
    const { sequences, findUniqueMock } = await loadSequences();
    findUniqueMock.mockResolvedValueOnce(null);

    await expect(
      sequences.updateSequence(
        "seq_missing",
        {
          name: "Updated",
        },
        "ws_1",
      ),
    ).rejects.toMatchObject({
      code: "DUNNING_SEQUENCE_NOT_FOUND",
      status: 404,
    });
  });

  it("blocks updates from another workspace", async () => {
    const { sequences } = await loadSequences();

    await expect(
      sequences.updateSequence(
        "seq_1",
        {
          name: "Updated",
        },
        "ws_other",
      ),
    ).rejects.toMatchObject({
      code: "AUTH_FORBIDDEN",
      status: 403,
    });
  });

  it("increments version when steps are replaced", async () => {
    const { sequences, txUpdateMock, txDeleteManyMock, txCreateManyMock } = await loadSequences();

    await sequences.updateSequence(
      "seq_1",
      {
        steps: [
          {
            delayHours: 24,
            subjectTemplate: "A new subject",
            bodyTemplate: "A new body template for a recovery step",
          },
        ],
      },
      "ws_1",
    );

    expect(txUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "seq_1" },
        data: expect.objectContaining({
          version: { increment: 1 },
        }),
      }),
    );

    expect(txDeleteManyMock).toHaveBeenCalledWith({
      where: { sequenceId: "seq_1" },
    });
    expect(txCreateManyMock).toHaveBeenCalledTimes(1);
  });

  it("does not replace steps and does not increment version when steps are not provided", async () => {
    const { sequences, txUpdateMock, txDeleteManyMock, txCreateManyMock } = await loadSequences();

    await sequences.updateSequence(
      "seq_1",
      {
        name: "Name only",
        isEnabled: false,
      },
      "ws_1",
    );

    expect(txUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Name only",
          isEnabled: false,
          version: { increment: 0 },
        }),
      }),
    );
    expect(txDeleteManyMock).not.toHaveBeenCalled();
    expect(txCreateManyMock).not.toHaveBeenCalled();
  });
});
