import { describe, expect, it, vi } from "vitest";

function makeCandidate(overrides?: Partial<{
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}>) {
  return {
    stripeCustomerId: overrides?.stripeCustomerId ?? "cus_1",
    stripeSubscriptionId: overrides?.stripeSubscriptionId ?? "sub_1",
    expirationDate: new Date("2026-03-01T00:00:00.000Z"),
  };
}

async function loadRoute(opts?: {
  authError?: boolean;
  workspaces?: Array<{ id: string }>;
  candidatesByWorkspace?: Record<string, ReturnType<typeof makeCandidate>[]>;
}) {
  vi.resetModules();

  const assertCronAuthorized = vi.fn();
  if (opts?.authError) {
    const { ProblemError } = await import("@/lib/problem");
    assertCronAuthorized.mockImplementation(() => {
      throw new ProblemError({
        title: "Unauthorized",
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        detail: "Missing secret",
      });
    });
  }

  const workspaces = opts?.workspaces ?? [];
  const findMany = vi.fn().mockResolvedValue(workspaces);
  const candidatesByWorkspace = opts?.candidatesByWorkspace ?? {};
  const runPreDunningScan = vi.fn().mockImplementation((workspaceId: string) =>
    Promise.resolve(candidatesByWorkspace[workspaceId] ?? []),
  );
  const inngestSend = vi.fn().mockResolvedValue(undefined);
  const captureException = vi.fn().mockResolvedValue(undefined);

  vi.doMock("@/lib/cron-auth", () => ({
    assertCronAuthorized,
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      workspace: {
        findMany,
      },
    },
  }));

  vi.doMock("@/lib/services/pre-dunning", () => ({
    runPreDunningScan,
  }));

  vi.doMock("@/lib/inngest/client", () => ({
    inngest: { send: inngestSend },
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
  }));

  const route = await import("@/app/api/cron/pre-dunning/route");
  return { route, assertCronAuthorized, findMany, runPreDunningScan, inngestSend };
}

describe("GET /api/cron/pre-dunning", () => {
  it("returns 401 when cron auth fails", async () => {
    const { route } = await loadRoute({ authError: true });

    const response = await route.GET(
      new Request("http://localhost/api/cron/pre-dunning"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("returns scan results for active workspaces with valid auth", async () => {
    const candidates = [makeCandidate()];
    const { route, runPreDunningScan } = await loadRoute({
      workspaces: [{ id: "ws_1" }, { id: "ws_2" }],
      candidatesByWorkspace: {
        ws_1: candidates,
        ws_2: [],
      },
    });

    const response = await route.GET(
      new Request("http://localhost/api/cron/pre-dunning"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executed).toBe(true);
    expect(payload.workspaces).toBe(2);
    expect(payload.candidates).toBe(1);
    expect(runPreDunningScan).toHaveBeenCalledTimes(2);
    expect(runPreDunningScan).toHaveBeenCalledWith("ws_1");
    expect(runPreDunningScan).toHaveBeenCalledWith("ws_2");
  });

  it("sends inngest events for each candidate", async () => {
    const candidate1 = makeCandidate({ stripeCustomerId: "cus_a", stripeSubscriptionId: "sub_a" });
    const candidate2 = makeCandidate({ stripeCustomerId: "cus_b", stripeSubscriptionId: "sub_b" });
    const { route, inngestSend } = await loadRoute({
      workspaces: [{ id: "ws_1" }],
      candidatesByWorkspace: {
        ws_1: [candidate1, candidate2],
      },
    });

    await route.GET(
      new Request("http://localhost/api/cron/pre-dunning"),
    );

    expect(inngestSend).toHaveBeenCalledTimes(2);
    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "predunning/candidate",
        data: expect.objectContaining({
          workspaceId: "ws_1",
          stripeCustomerId: "cus_a",
          stripeSubscriptionId: "sub_a",
        }),
      }),
    );
    expect(inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "predunning/candidate",
        data: expect.objectContaining({
          workspaceId: "ws_1",
          stripeCustomerId: "cus_b",
          stripeSubscriptionId: "sub_b",
        }),
      }),
    );
  });

  it("returns zero candidates when no at-risk subscriptions found", async () => {
    const { route, inngestSend } = await loadRoute({
      workspaces: [{ id: "ws_1" }],
      candidatesByWorkspace: {
        ws_1: [],
      },
    });

    const response = await route.GET(
      new Request("http://localhost/api/cron/pre-dunning"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executed).toBe(true);
    expect(payload.workspaces).toBe(1);
    expect(payload.candidates).toBe(0);
    expect(inngestSend).not.toHaveBeenCalled();
  });
});
