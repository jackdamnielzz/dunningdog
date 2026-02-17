import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { generateCurrentMonthSnapshot } from "@/lib/services/metrics";

export async function GET() {
  try {
    const workspaces = await db.workspace.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const snapshots = [];
    for (const workspace of workspaces) {
      const snapshot = await generateCurrentMonthSnapshot(workspace.id);
      snapshots.push({
        workspaceId: workspace.id,
        snapshotId: snapshot.id,
      });
    }

    return ok({
      executed: true,
      count: snapshots.length,
      snapshots,
    });
  } catch (error) {
    return routeError(error, "/api/cron/metric-snapshots");
  }
}
