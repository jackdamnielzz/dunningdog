// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { RecoveryTable } from "@/components/dashboard/recovery-table";

const sampleItems = [
  {
    attempt: {
      id: "ra_1",
      stripeInvoiceId: "in_abc",
      stripeCustomerId: "cus_xyz",
      declineType: "soft" as const,
      status: "pending" as const,
      amountDueCents: 5000,
      recoveredAmountCents: null,
      startedAt: "2026-01-15T00:00:00Z",
      endedAt: null,
    },
  },
  {
    attempt: {
      id: "ra_2",
      stripeInvoiceId: "in_def",
      stripeCustomerId: "cus_abc",
      declineType: "hard" as const,
      status: "recovered" as const,
      amountDueCents: 10000,
      recoveredAmountCents: 10000,
      startedAt: "2026-01-10T00:00:00Z",
      endedAt: "2026-01-12T00:00:00Z",
    },
  },
];

describe("RecoveryTable", () => {
  it("renders table headers", () => {
    render(<RecoveryTable items={[]} />);
    expect(screen.getByText("Invoice")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Decline")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Amount Due")).toBeInTheDocument();
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    expect(screen.getByText("Started")).toBeInTheDocument();
  });

  it("renders recovery items with correct data", () => {
    render(<RecoveryTable items={sampleItems} />);
    expect(screen.getByText("in_abc")).toBeInTheDocument();
    expect(screen.getByText("cus_xyz")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    // $100.00 appears in both "Amount Due" and "Recovered" columns for ra_2
    expect(screen.getAllByText("$100.00")).toHaveLength(2);
  });

  it("shows empty state when items is empty", () => {
    render(<RecoveryTable items={[]} />);
    expect(screen.getByText("No recovery attempts found yet.")).toBeInTheDocument();
  });

  it("uses custom title when provided", () => {
    render(<RecoveryTable items={[]} title="All Recoveries" />);
    expect(screen.getByText("All Recoveries")).toBeInTheDocument();
  });
});
