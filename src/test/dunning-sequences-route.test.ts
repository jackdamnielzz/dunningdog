import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const WORKSPACE_ID = "ws_test_1";

const sequenceStepSchema = z.object({
  id: z.string().optional(),
  delayHours: z.number().int().min(0).max(24 * 30),
  subjectTemplate: z.string().min(3).max(120),
  bodyTemplate: z.string().min(10).max(5000),
});

const createSequenceSchema = z.object({
  workspaceId: z.string().min(2),
  name: z.string().min(2).max(80),
  isEnabled: z.boolean().default(true),
  steps: z.array(sequenceStepSchema.omit({ id: true })).min(1).max(8),
});

const updateSequenceSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  isEnabled: z.boolean().optional(),
  steps: z.array(sequenceStepSchema).min(1).max(8).optional(),
});

const NOW = new Date("2026-02-25T12:00:00.000Z");

function makeCreatedSequence(overrides?: Partial<{ id: string; name: string }>) {
  return {
    id: overrides?.id ?? "seq_1",
    workspaceId: WORKSPACE_ID,
    name: overrides?.name ?? "Retry Sequence",
    isEnabled: true,
    steps: [
      {
        id: "step_1",
        delayHours: 24,
        subjectTemplate: "Payment failed",
        bodyTemplate: "Hi, your payment failed. Please update your card.",
        status: "scheduled",
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
  };
}

/* ------------------------------------------------------------------ */
/*  POST /api/dunning/sequences                                       */
/* ------------------------------------------------------------------ */

async function loadPostRoute(opts?: {
  created?: ReturnType<typeof makeCreatedSequence>;
}) {
  vi.resetModules();

  const createSequence = vi.fn().mockResolvedValue(opts?.created ?? makeCreatedSequence());
  const updateSequence = vi.fn();
  const resolveWorkspaceContextFromRequest = vi.fn().mockResolvedValue({
    workspaceId: WORKSPACE_ID,
    workspaceName: "Test Workspace",
    userId: "user_1",
    source: "authenticated",
  });
  const ensureWorkspaceExists = vi.fn().mockResolvedValue({ id: WORKSPACE_ID });
  const reportAnalyticsEvent = vi.fn();
  const captureException = vi.fn().mockResolvedValue(undefined);

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    requireScope: vi.fn(),
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/services/sequences", () => ({
    createSequence,
    createSequenceSchema,
    updateSequence,
    updateSequenceSchema,
    sequenceStepSchema,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
    reportAnalyticsEvent,
  }));

  const route = await import("@/app/api/dunning/sequences/route");
  return { route, createSequence, resolveWorkspaceContextFromRequest, ensureWorkspaceExists };
}

describe("POST /api/dunning/sequences", () => {
  it("creates sequence and returns 201 with correct shape", async () => {
    const { route, createSequence } = await loadPostRoute();

    const response = await route.POST(
      new Request("http://localhost/api/dunning/sequences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          name: "Retry Sequence",
          isEnabled: true,
          steps: [
            {
              delayHours: 24,
              subjectTemplate: "Payment failed",
              bodyTemplate: "Hi, your payment failed. Please update your card.",
            },
          ],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.id).toBe("seq_1");
    expect(payload.workspaceId).toBe(WORKSPACE_ID);
    expect(payload.name).toBe("Retry Sequence");
    expect(payload.isEnabled).toBe(true);
    expect(payload.steps).toHaveLength(1);
    expect(payload.steps[0].id).toBe("step_1");
    expect(payload.steps[0].delayHours).toBe(24);
    expect(payload.createdAt).toBe(NOW.toISOString());
    expect(createSequence).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for missing required fields", async () => {
    const { route } = await loadPostRoute();

    const response = await route.POST(
      new Request("http://localhost/api/dunning/sequences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // missing workspaceId, name, steps
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });

  it("returns 400 for step validation failure (subject too short)", async () => {
    const { route } = await loadPostRoute();

    const response = await route.POST(
      new Request("http://localhost/api/dunning/sequences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          name: "Retry Sequence",
          isEnabled: true,
          steps: [
            {
              delayHours: 24,
              subjectTemplate: "Hi",  // too short (min 3)
              bodyTemplate: "Hi, your payment failed. Please update your card.",
            },
          ],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });
});

/* ------------------------------------------------------------------ */
/*  PATCH /api/dunning/sequences/[id]                                 */
/* ------------------------------------------------------------------ */

async function loadPatchRoute(opts?: {
  updated?: ReturnType<typeof makeCreatedSequence> | null;
}) {
  vi.resetModules();

  const updatedSequence = opts?.updated ?? makeCreatedSequence();
  const createSequence = vi.fn();
  const updateSequence = vi.fn().mockResolvedValue(updatedSequence);
  const resolveWorkspaceContextFromRequest = vi.fn().mockResolvedValue({
    workspaceId: WORKSPACE_ID,
    workspaceName: "Test Workspace",
    userId: "user_1",
    source: "authenticated",
  });
  const reportAnalyticsEvent = vi.fn();
  const captureException = vi.fn().mockResolvedValue(undefined);

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    requireScope: vi.fn(),
  }));

  vi.doMock("@/lib/services/sequences", () => ({
    createSequence,
    createSequenceSchema,
    updateSequence,
    updateSequenceSchema,
    sequenceStepSchema,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
    reportAnalyticsEvent,
  }));

  const route = await import("@/app/api/dunning/sequences/[id]/route");
  return { route, updateSequence, resolveWorkspaceContextFromRequest };
}

describe("PATCH /api/dunning/sequences/[id]", () => {
  it("updates sequence and returns 200", async () => {
    const updated = makeCreatedSequence({ name: "Updated Name" });
    const { route, updateSequence } = await loadPatchRoute({ updated });

    const response = await route.PATCH(
      new Request("http://localhost/api/dunning/sequences/seq_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Updated Name",
        }),
      }),
      { params: Promise.resolve({ id: "seq_1" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toBe("seq_1");
    expect(payload.name).toBe("Updated Name");
    expect(updateSequence).toHaveBeenCalledWith("seq_1", { name: "Updated Name" }, WORKSPACE_ID);
  });

  it("returns 400 for invalid body", async () => {
    const { route } = await loadPatchRoute();

    const response = await route.PATCH(
      new Request("http://localhost/api/dunning/sequences/seq_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "X",  // too short (min 2)
        }),
      }),
      { params: Promise.resolve({ id: "seq_1" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
  });
});
