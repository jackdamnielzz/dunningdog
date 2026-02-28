// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SummaryCards } from "@/components/dashboard/summary-cards";

describe("SummaryCards", () => {
  it("renders 4 cards with correct titles", () => {
    render(
      <SummaryCards
        failedRevenueCents={150000}
        recoveredRevenueCents={75000}
        recoveryRate={42.5}
        atRiskCount={3}
        activeSequences={2}
      />,
    );

    expect(screen.getByText("Failed Revenue")).toBeInTheDocument();
    expect(screen.getByText("Recovered Revenue")).toBeInTheDocument();
    expect(screen.getByText("Recovery Rate")).toBeInTheDocument();
    expect(screen.getByText("Subscriptions At Risk")).toBeInTheDocument();
  });

  it("formats currency values correctly", () => {
    render(
      <SummaryCards
        failedRevenueCents={150000}
        recoveredRevenueCents={75000}
        recoveryRate={42.5}
        atRiskCount={3}
        activeSequences={2}
      />,
    );

    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    expect(screen.getByText("$750.00")).toBeInTheDocument();
  });

  it("displays recovery rate as percentage", () => {
    render(
      <SummaryCards
        failedRevenueCents={0}
        recoveredRevenueCents={0}
        recoveryRate={42.5}
        atRiskCount={0}
        activeSequences={0}
      />,
    );

    expect(screen.getByText("42.50%")).toBeInTheDocument();
  });

  it("shows at-risk count and active sequences text", () => {
    render(
      <SummaryCards
        failedRevenueCents={0}
        recoveredRevenueCents={0}
        recoveryRate={0}
        atRiskCount={3}
        activeSequences={2}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2 active sequence(s) currently running.")).toBeInTheDocument();
  });
});
