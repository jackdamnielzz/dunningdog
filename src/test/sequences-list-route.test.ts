import { describe, expect, it, vi } from "vitest";

const WORKSPACE_ID = "ws_test_1";

function makeSequence(overrides?: Partial<{ id: string; name: string; isEnabled: boolean }>) {
  return {
    id: overrides?.id ?? "seq_1",
    workspaceId: WORKSPACE_ID,
    name: overrides?.name ?? "Default Sequence",
    isEnabled: overrides?.isEnabled ?? true,
    steps: [
      {
        id: "step_1",
        delayHours: 0,
        subjectTemplate: "Payment failed",
        bodyTemplate: "Hi {{customerName}}...",
        status: "scheduled",
        stepOrder: 1,
      },
      {
        id: "step_2",
        delayHours: 48,
        subjectTemplate: "Reminder",
        bodyTemplate: "Hi {{customerName}}, reminder...",
        status: "scheduled",
        stepOrder: 2,
      },
    ],
    createdAt: new Date("2026-01-15T09:00:00.000Z"),
    updatedAt: new Date("2026-02-20T14:30:00.000Z"),
  };
}

async function loadRoute(opts?: {
  sequences?: ReturnType<typeof makeSequence>[];
}) {
  vi.resetModules();

  const resolveWorkspaceContextFromRequest = vi.fn().mockResolvedValue({
    workspaceId: WORKSPACE_ID,
    workspaceName: "Test Workspace",
    userId: "user_1",
    source: "authenticated",
  });
  const requireScope = vi.fn();
  const ensureWorkspaceExists = vi.fn().mockResolvedValue({ id: WORKSPACE_ID });
  const findMany = vi.fn().mockResolvedValue(opts?.sequences ?? []);

  vi.doMock("@/lib/auth", () => ({
    resolveWorkspaceContextFromRequest,
    requireScope,
    ensureWorkspaceExists,
  }));

  vi.doMock("@/lib/trial", () => ({
    requireActiveWorkspace: vi.fn().mockResolvedValue(undefined),
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      dunningSequence: { findMany },
      workspace: { findUnique: vi.fn() },
    },
  }));

  vi.doMock("@/lib/services/sequences", () => ({
    createSequence: vi.fn(),
    createSequenceSchema: {},
  }));

  vi.doMock("@/lib/api", () => ({
    ok: (payload: unknown, status = 200) =>
      Response.json(payload, { status }),
    parseJsonBody: vi.fn(),
    routeError: (_error: unknown) =>
      Response.json({ error: "internal" }, { status: 500 }),
  }));

  vi.doMock("@/lib/observability", () => ({
    reportAnalyticsEvent: vi.fn(),
  }));

  vi.doMock("@/lib/plan-features", () => ({
    maxSequenceSteps: vi.fn().mockReturnValue(10),
  }));

  vi.doMock("@/lib/problem", () => ({
    ProblemError: class extends Error {},
  }));

  const route = await import("@/app/api/dunning/sequences/route");
  return { route, resolveWorkspaceContextFromRequest, requireScope, findMany };
}

describe("GET /api/dunning/sequences", () => {
  it("returns list of sequences with steps", async () => {
    const seq = makeSequence();
    const { route } = await loadRoute({ sequences: [seq] });

    const response = await route.GET(
      new Request("http://localhost/api/dunning/sequences"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].id).toBe("seq_1");
    expect(payload.items[0].name).toBe("Default Sequence");
    expect(payload.items[0].isEnabled).toBe(true);
    expect(payload.items[0].steps).toHaveLength(2);
    expect(payload.items[0].steps[0].id).toBe("step_1");
    expect(payload.items[0].steps[1].delayHours).toBe(48);
  });

  it("returns empty items array when no sequences", async () => {
    const { route } = await loadRoute({ sequences: [] });

    const response = await route.GET(
      new Request("http://localhost/api/dunning/sequences"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([]);
  });

  it("serializes dates as ISO strings", async () => {
    const seq = makeSequence();
    const { route } = await loadRoute({ sequences: [seq] });

    const response = await route.GET(
      new Request("http://localhost/api/dunning/sequences"),
    );
    const payload = await response.json();

    expect(payload.items[0].createdAt).toBe("2026-01-15T09:00:00.000Z");
    expect(payload.items[0].updatedAt).toBe("2026-02-20T14:30:00.000Z");
  });

  it("calls requireScope with read:sequences", async () => {
    const { route, requireScope } = await loadRoute({ sequences: [] });

    await route.GET(
      new Request("http://localhost/api/dunning/sequences"),
    );

    expect(requireScope).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: WORKSPACE_ID }),
      "read:sequences",
    );
  });

  it("queries sequences for the correct workspace", async () => {
    const { route, findMany } = await loadRoute({ sequences: [] });

    await route.GET(
      new Request("http://localhost/api/dunning/sequences"),
    );

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  });
});
