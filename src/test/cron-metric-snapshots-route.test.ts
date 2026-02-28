import { describe, expect, it, vi } from "vitest";

async function loadRoute(opts?: {
  authError?: boolean;
  workspaces?: Array<{ id: string }>;
  snapshotsByWorkspace?: Record<string, { id: string }>;
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
  const snapshotsByWorkspace = opts?.snapshotsByWorkspace ?? {};
  const generateCurrentMonthSnapshot = vi.fn().mockImplementation((workspaceId: string) =>
    Promise.resolve(snapshotsByWorkspace[workspaceId] ?? { id: `snap_${workspaceId}` }),
  );
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

  vi.doMock("@/lib/services/metrics", () => ({
    generateCurrentMonthSnapshot,
  }));

  vi.doMock("@/lib/observability", () => ({
    captureException,
  }));

  const route = await import("@/app/api/cron/metric-snapshots/route");
  return { route, assertCronAuthorized, findMany, generateCurrentMonthSnapshot };
}

describe("GET /api/cron/metric-snapshots", () => {
  it("returns 401 when cron auth fails", async () => {
    const { route } = await loadRoute({ authError: true });

    const response = await route.GET(
      new Request("http://localhost/api/cron/metric-snapshots"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("returns snapshots for active workspaces", async () => {
    const { route } = await loadRoute({
      workspaces: [{ id: "ws_1" }, { id: "ws_2" }],
      snapshotsByWorkspace: {
        ws_1: { id: "snap_ws_1" },
        ws_2: { id: "snap_ws_2" },
      },
    });

    const response = await route.GET(
      new Request("http://localhost/api/cron/metric-snapshots"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executed).toBe(true);
    expect(payload.count).toBe(2);
    expect(payload.snapshots).toEqual([
      { workspaceId: "ws_1", snapshotId: "snap_ws_1" },
      { workspaceId: "ws_2", snapshotId: "snap_ws_2" },
    ]);
  });

  it("returns empty snapshots when no active workspaces", async () => {
    const { route } = await loadRoute({
      workspaces: [],
    });

    const response = await route.GET(
      new Request("http://localhost/api/cron/metric-snapshots"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executed).toBe(true);
    expect(payload.count).toBe(0);
    expect(payload.snapshots).toEqual([]);
  });

  it("calls generateCurrentMonthSnapshot for each workspace", async () => {
    const { route, generateCurrentMonthSnapshot } = await loadRoute({
      workspaces: [{ id: "ws_a" }, { id: "ws_b" }, { id: "ws_c" }],
    });

    await route.GET(
      new Request("http://localhost/api/cron/metric-snapshots"),
    );

    expect(generateCurrentMonthSnapshot).toHaveBeenCalledTimes(3);
    expect(generateCurrentMonthSnapshot).toHaveBeenCalledWith("ws_a");
    expect(generateCurrentMonthSnapshot).toHaveBeenCalledWith("ws_b");
    expect(generateCurrentMonthSnapshot).toHaveBeenCalledWith("ws_c");
  });
});
