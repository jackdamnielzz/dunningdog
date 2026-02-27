import { ok, routeError } from "@/lib/api";
import { db } from "@/lib/db";
import { runPreDunningScan } from "@/lib/services/preDunning";
import { inngest } from "@/lib/inngest/client";
import { assertCronAuthorized } from "@/lib/cron-auth";

export async function GET(request: Request) {
  try {
    assertCronAuthorized(request);

    const workspaces = await db.workspace.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let candidatesCount = 0;
    for (const workspace of workspaces) {
      const candidates = await runPreDunningScan(workspace.id);
      candidatesCount += candidates.length;
      for (const candidate of candidates) {
        await inngest.send({
          name: "predunning/candidate",
          data: {
            workspaceId: workspace.id,
            stripeCustomerId: candidate.stripeCustomerId,
            stripeSubscriptionId: candidate.stripeSubscriptionId,
            expirationDate:
              candidate.expirationDate?.toISOString() ?? new Date().toISOString(),
          },
        });
      }
    }

    return ok({
      executed: true,
      workspaces: workspaces.length,
      candidates: candidatesCount,
    });
  } catch (error) {
    return routeError(error, "/api/cron/pre-dunning");
  }
}
