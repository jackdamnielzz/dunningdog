import { describe, expect, it } from "vitest";
import {
  getDemoConnectedStripeAccount,
  getDemoDashboardSummary,
  getDemoRecoveryAttempts,
  getDemoSequence,
  getDemoWorkspace,
} from "@/lib/demo-data";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "@/lib/constants";

describe("demo data helpers", () => {
  it("builds a default demo workspace for the default workspace id", () => {
    const workspace = getDemoWorkspace();

    expect(workspace.id).toBe(DEFAULT_WORKSPACE_ID);
    expect(workspace.name).toBe(DEFAULT_WORKSPACE_NAME);
    expect(workspace.billingPlan).toBe("starter");
    expect(workspace.isActive).toBe(true);
  });

  it("builds a named demo workspace for a custom workspace id", () => {
    const workspace = getDemoWorkspace("ws_custom");

    expect(workspace.name).toBe("Demo Workspace (ws_custom)");
  });

  it("returns a deterministic dashboard summary shape", () => {
    const summary = getDemoDashboardSummary("ws_1", "30d");

    expect(summary).toMatchObject({
      workspaceId: "ws_1",
      window: "30d",
      failedRevenueCents: 12800,
      recoveredRevenueCents: 6400,
      recoveryRate: 50,
      atRiskCount: 3,
      activeSequences: 1,
    });
    expect(typeof summary.generatedAt).toBe("string");
  });

  it("returns two demo recovery attempts with expected statuses", () => {
    const attempts = getDemoRecoveryAttempts();

    expect(attempts).toHaveLength(2);
    expect(attempts[0]?.status).toBe("recovered");
    expect(attempts[1]?.status).toBe("failed");
    expect(attempts[0]?.outcomes).toHaveLength(1);
    expect(attempts[1]?.outcomes).toHaveLength(1);
  });

  it("returns a demo sequence with three scheduled steps", () => {
    const sequence = getDemoSequence("ws_1");

    expect(sequence.workspaceId).toBe("ws_1");
    expect(sequence.steps).toHaveLength(3);
    expect(sequence.steps.map((step) => step.stepOrder)).toEqual([1, 2, 3]);
    expect(sequence.steps.every((step) => step.status === "scheduled")).toBe(true);
  });

  it("returns demo connected stripe account metadata", () => {
    const account = getDemoConnectedStripeAccount("ws_1");

    expect(account).toMatchObject({
      workspaceId: "ws_1",
      stripeAccountId: "acct_demo_000000000000",
      livemode: false,
    });
    expect(account.scopes).toContain("read_write");
  });
});
