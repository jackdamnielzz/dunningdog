import { describe, expect, it } from "vitest";
import { getTrialStatus, isWorkspaceAccessible, type TrialStatus } from "@/lib/trial";
import { TRIAL_DURATION_DAYS } from "@/lib/constants";

describe("getTrialStatus", () => {
  it("returns 'paid' when billingStatus is active, regardless of trialEndsAt", () => {
    const result = getTrialStatus({
      billingStatus: "active",
      trialEndsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // expired trial
    });
    expect(result).toEqual({ state: "paid" });
  });

  it("returns 'paid' when billingStatus is active and trialEndsAt is null", () => {
    const result = getTrialStatus({
      billingStatus: "active",
      trialEndsAt: null,
    });
    expect(result).toEqual({ state: "paid" });
  });

  it("returns 'trialing' when trial is active with correct daysRemaining", () => {
    const endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    const result = getTrialStatus({
      billingStatus: null,
      trialEndsAt: endsAt,
    });
    expect(result.state).toBe("trialing");
    if (result.state === "trialing") {
      expect(result.daysRemaining).toBe(3);
      expect(result.endsAt).toEqual(endsAt);
    }
  });

  it("returns daysRemaining capped at TRIAL_DURATION_DAYS", () => {
    const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const result = getTrialStatus({
      billingStatus: null,
      trialEndsAt: endsAt,
    });
    expect(result.state).toBe("trialing");
    if (result.state === "trialing") {
      expect(result.daysRemaining).toBe(TRIAL_DURATION_DAYS);
    }
  });

  it("returns daysRemaining = 1 when less than 24 hours remain", () => {
    const endsAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const result = getTrialStatus({
      billingStatus: null,
      trialEndsAt: endsAt,
    });
    expect(result.state).toBe("trialing");
    if (result.state === "trialing") {
      expect(result.daysRemaining).toBe(1);
    }
  });

  it("returns 'expired' when trialEndsAt is in the past", () => {
    const result = getTrialStatus({
      billingStatus: null,
      trialEndsAt: new Date(Date.now() - 1000),
    });
    expect(result).toEqual({ state: "expired" });
  });

  it("returns 'expired' when billingStatus is canceled and trial is past", () => {
    const result = getTrialStatus({
      billingStatus: "canceled",
      trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    expect(result).toEqual({ state: "expired" });
  });

  it("returns 'none' when trialEndsAt is null and not paid", () => {
    const result = getTrialStatus({
      billingStatus: null,
      trialEndsAt: null,
    });
    expect(result).toEqual({ state: "none" });
  });

  it("returns 'none' when trialEndsAt is null and billingStatus is canceled", () => {
    const result = getTrialStatus({
      billingStatus: "canceled",
      trialEndsAt: null,
    });
    expect(result).toEqual({ state: "none" });
  });
});

describe("isWorkspaceAccessible", () => {
  it("returns true for trialing state", () => {
    const status: TrialStatus = {
      state: "trialing",
      daysRemaining: 5,
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    };
    expect(isWorkspaceAccessible(status)).toBe(true);
  });

  it("returns true for paid state", () => {
    const status: TrialStatus = { state: "paid" };
    expect(isWorkspaceAccessible(status)).toBe(true);
  });

  it("returns true for none state (legacy/admin workspaces)", () => {
    const status: TrialStatus = { state: "none" };
    expect(isWorkspaceAccessible(status)).toBe(true);
  });

  it("returns false for expired state", () => {
    const status: TrialStatus = { state: "expired" };
    expect(isWorkspaceAccessible(status)).toBe(false);
  });
});
