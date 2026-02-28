import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- module loader ------------------------------------------------ */

async function loadExport(deps?: {
  findMany?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const findMany = deps?.findMany ?? vi.fn().mockResolvedValue([]);

  vi.doMock("@/lib/db", () => ({
    db: {
      recoveryAttempt: { findMany },
    },
  }));

  const exportModule = await import("@/lib/services/export");
  return { exportModule, findMany };
}

/* ---------- helpers ------------------------------------------------------ */

function makeAttempt(overrides?: Partial<{
  id: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  declineType: string;
  status: string;
  amountDueCents: number;
  recoveredAmountCents: number | null;
  startedAt: Date;
  endedAt: Date | null;
  outcomes: Array<{ outcome: string; occurredAt: Date; reasonCode: string | null }>;
}>) {
  return {
    id: overrides?.id ?? "ra_1",
    stripeInvoiceId: overrides?.stripeInvoiceId ?? "inv_1",
    stripeCustomerId: overrides?.stripeCustomerId ?? "cus_1",
    declineType: overrides?.declineType ?? "soft",
    status: overrides?.status ?? "pending",
    amountDueCents: overrides?.amountDueCents ?? 4999,
    recoveredAmountCents: overrides?.recoveredAmountCents ?? null,
    startedAt: overrides?.startedAt ?? new Date("2026-01-15T10:00:00Z"),
    endedAt: overrides?.endedAt ?? null,
    outcomes: overrides?.outcomes ?? [],
  };
}

/* ======================================================================== */
/*  Feature 5: Analytics & Exports                                           */
/* ======================================================================== */

describe("Feature 5: Analytics & CSV exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateRecoveryCsv", () => {
    it("generates CSV with correct headers", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      const headers = csv.split("\n")[0];
      expect(headers).toContain("ID");
      expect(headers).toContain("Stripe Invoice ID");
      expect(headers).toContain("Stripe Customer ID");
      expect(headers).toContain("Decline Type");
      expect(headers).toContain("Status");
      expect(headers).toContain("Amount Due (cents)");
      expect(headers).toContain("Recovered Amount (cents)");
      expect(headers).toContain("Started At");
      expect(headers).toContain("Ended At");
      expect(headers).toContain("Outcome");
      expect(headers).toContain("Reason Code");
    });

    it("generates CSV rows for each recovery attempt", async () => {
      const attempts = [
        makeAttempt({ id: "ra_1", status: "recovered", recoveredAmountCents: 4999 }),
        makeAttempt({ id: "ra_2", status: "pending" }),
      ];
      const findMany = vi.fn().mockResolvedValue(attempts);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      const lines = csv.split("\n");
      expect(lines).toHaveLength(3); // header + 2 rows
      expect(lines[1]).toContain("ra_1");
      expect(lines[1]).toContain("recovered");
      expect(lines[1]).toContain("4999");
      expect(lines[2]).toContain("ra_2");
      expect(lines[2]).toContain("pending");
    });

    it("includes outcome data from the most recent outcome", async () => {
      const attempt = makeAttempt({
        outcomes: [{
          outcome: "payment_method_updated",
          occurredAt: new Date("2026-01-16T12:00:00Z"),
          reasonCode: "card_updated",
        }],
      });
      const findMany = vi.fn().mockResolvedValue([attempt]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      const row = csv.split("\n")[1];
      expect(row).toContain("payment_method_updated");
      expect(row).toContain("card_updated");
    });

    it("handles empty outcomes gracefully", async () => {
      const attempt = makeAttempt({ outcomes: [] });
      const findMany = vi.fn().mockResolvedValue([attempt]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      // Should not throw, last two fields should be empty
      const lines = csv.split("\n");
      expect(lines).toHaveLength(2);
    });

    it("escapes CSV fields containing commas", async () => {
      const attempt = makeAttempt({
        id: "ra_with,comma",
      });
      const findMany = vi.fn().mockResolvedValue([attempt]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      expect(csv).toContain('"ra_with,comma"');
    });

    it("escapes CSV fields containing double quotes", async () => {
      const attempt = makeAttempt({
        stripeInvoiceId: 'inv_"special"',
      });
      const findMany = vi.fn().mockResolvedValue([attempt]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      expect(csv).toContain('"inv_""special"""');
    });

    it("passes date range and status filters to query", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { exportModule } = await loadExport({ findMany });

      const start = new Date("2026-01-01");
      const end = new Date("2026-01-31");

      await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: start,
        endDate: end,
        status: "recovered" as never,
      });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId: "ws_1",
            startedAt: { gte: start, lte: end },
            status: "recovered",
          }),
        }),
      );
    });

    it("does not include status filter when not provided", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { exportModule } = await loadExport({ findMany });

      await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      const queryArg = findMany.mock.calls[0][0];
      expect(queryArg.where.status).toBeUndefined();
    });

    it("returns only headers when no attempts found", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { exportModule } = await loadExport({ findMany });

      const csv = await exportModule.generateRecoveryCsv({
        workspaceId: "ws_1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      });

      const lines = csv.split("\n");
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain("ID");
    });
  });
});
