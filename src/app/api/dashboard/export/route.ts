import { NextResponse } from "next/server";
import { resolveWorkspaceContextFromRequest, requireScope } from "@/lib/auth";
import { routeError } from "@/lib/api";
import { requireActiveWorkspace } from "@/lib/trial";
import { generateRecoveryCsv } from "@/lib/services/export";
import type { RecoveryStatus } from "@prisma/client";

const instance = "/api/dashboard/export";

export async function GET(request: Request) {
  try {
    const workspace = await resolveWorkspaceContextFromRequest(request);
    requireScope(workspace, "read:recoveries");
    await requireActiveWorkspace(workspace.workspaceId);
    const url = new URL(request.url);

    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const statusParam = url.searchParams.get("status") as RecoveryStatus | null;

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const csv = await generateRecoveryCsv({
      workspaceId: workspace.workspaceId,
      startDate,
      endDate,
      status: statusParam ?? undefined,
    });

    const filename = `recoveries-${startDate.toISOString().slice(0, 10)}-to-${endDate.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return routeError(error, instance);
  }
}
