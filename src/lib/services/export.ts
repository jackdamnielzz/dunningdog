import { db } from "@/lib/db";
import type { RecoveryStatus } from "@prisma/client";

interface ExportParams {
  workspaceId: string;
  startDate: Date;
  endDate: Date;
  status?: RecoveryStatus;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function generateRecoveryCsv(params: ExportParams): Promise<string> {
  const attempts = await db.recoveryAttempt.findMany({
    where: {
      workspaceId: params.workspaceId,
      startedAt: { gte: params.startDate, lte: params.endDate },
      ...(params.status ? { status: params.status } : {}),
    },
    orderBy: { startedAt: "desc" },
    include: {
      outcomes: {
        take: 1,
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  const headers = [
    "ID",
    "Stripe Invoice ID",
    "Stripe Customer ID",
    "Decline Type",
    "Status",
    "Amount Due (cents)",
    "Recovered Amount (cents)",
    "Started At",
    "Ended At",
    "Outcome",
    "Reason Code",
  ];

  const rows = attempts.map((a) => [
    escapeCsvField(a.id),
    escapeCsvField(a.stripeInvoiceId),
    escapeCsvField(a.stripeCustomerId),
    a.declineType,
    a.status,
    String(a.amountDueCents),
    String(a.recoveredAmountCents ?? ""),
    a.startedAt.toISOString(),
    a.endedAt?.toISOString() ?? "",
    a.outcomes[0]?.outcome ?? "",
    a.outcomes[0]?.reasonCode ?? "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
