import { z } from "zod";
import { ok, routeError } from "@/lib/api";
import { ensureWorkspaceExists, getWorkspaceIdFromRequest } from "@/lib/auth";
import { getRecoveryAttempts } from "@/lib/services/dashboard";

const statusSchema = z
  .enum(["pending", "recovered", "failed", "abandoned"])
  .optional();

export async function GET(request: Request) {
  try {
    const workspaceId = await getWorkspaceIdFromRequest(request);
    await ensureWorkspaceExists(workspaceId);

    const url = new URL(request.url);
    const status = statusSchema.parse(url.searchParams.get("status") ?? undefined);
    const limitRaw = Number(url.searchParams.get("limit") ?? "20");
    const limit = Number.isNaN(limitRaw) ? 20 : Math.max(1, Math.min(100, limitRaw));

    const attempts = await getRecoveryAttempts(workspaceId, limit, status);
    return ok({
      items: attempts.map((attempt) => ({
        attempt: {
          id: attempt.id,
          workspaceId: attempt.workspaceId,
          stripeInvoiceId: attempt.stripeInvoiceId,
          stripeCustomerId: attempt.stripeCustomerId,
          declineType: attempt.declineType,
          status: attempt.status,
          amountDueCents: attempt.amountDueCents,
          recoveredAmountCents: attempt.recoveredAmountCents,
          startedAt: attempt.startedAt.toISOString(),
          endedAt: attempt.endedAt?.toISOString() ?? null,
        },
        latestOutcome: attempt.outcomes[0]
          ? {
              id: attempt.outcomes[0].id,
              workspaceId: attempt.outcomes[0].workspaceId,
              recoveryAttemptId: attempt.outcomes[0].recoveryAttemptId,
              outcome: attempt.outcomes[0].outcome,
              reasonCode: attempt.outcomes[0].reasonCode,
              occurredAt: attempt.outcomes[0].occurredAt.toISOString(),
            }
          : null,
      })),
      nextCursor: null,
    });
  } catch (error) {
    return routeError(error, "/api/dashboard/recoveries");
  }
}
