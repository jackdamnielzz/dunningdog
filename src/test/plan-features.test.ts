import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadPlanFeatures(deps?: {
  workspacePlan?: string | null;
}) {
  vi.resetModules();

  const findUnique = vi.fn().mockResolvedValue(
    deps?.workspacePlan !== null
      ? { billingPlan: deps?.workspacePlan ?? "starter" }
      : null,
  );

  vi.doMock("@/lib/db", () => ({
    db: {
      workspace: { findUnique },
    },
  }));

  vi.doMock("@/lib/problem", () => {
    class ProblemError extends Error {
      status: number;
      code: string;
      detail?: string;
      constructor(params: { title: string; status: number; code: string; detail?: string }) {
        super(params.title);
        this.status = params.status;
        this.code = params.code;
        this.detail = params.detail;
      }
    }
    return { ProblemError };
  });

  const mod = await import("@/lib/plan-features");
  return { ...mod, findUnique };
}

describe("plan-features module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("planHasFeature", () => {
    it("starter plan has csv_export", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("starter", "csv_export")).toBe(true);
    });

    it("starter plan does not have email_branding", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("starter", "email_branding")).toBe(false);
    });

    it("starter plan does not have notifications", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("starter", "notifications")).toBe(false);
    });

    it("starter plan does not have api_access", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("starter", "api_access")).toBe(false);
    });

    it("pro plan has email_branding and notifications", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("pro", "email_branding")).toBe(true);
      expect(planHasFeature("pro", "notifications")).toBe(true);
      expect(planHasFeature("pro", "unlimited_steps")).toBe(true);
      expect(planHasFeature("pro", "csv_export")).toBe(true);
    });

    it("pro plan does not have white_label or api_access", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("pro", "white_label")).toBe(false);
      expect(planHasFeature("pro", "api_access")).toBe(false);
    });

    it("growth plan has all features", async () => {
      const { planHasFeature } = await loadPlanFeatures();
      expect(planHasFeature("growth", "csv_export")).toBe(true);
      expect(planHasFeature("growth", "unlimited_steps")).toBe(true);
      expect(planHasFeature("growth", "email_branding")).toBe(true);
      expect(planHasFeature("growth", "notifications")).toBe(true);
      expect(planHasFeature("growth", "white_label")).toBe(true);
      expect(planHasFeature("growth", "api_access")).toBe(true);
    });
  });

  describe("maxSequenceSteps", () => {
    it("returns 3 for starter plan", async () => {
      const { maxSequenceSteps } = await loadPlanFeatures();
      expect(maxSequenceSteps("starter")).toBe(3);
    });

    it("returns 20 for pro plan", async () => {
      const { maxSequenceSteps } = await loadPlanFeatures();
      expect(maxSequenceSteps("pro")).toBe(20);
    });

    it("returns 20 for growth plan", async () => {
      const { maxSequenceSteps } = await loadPlanFeatures();
      expect(maxSequenceSteps("growth")).toBe(20);
    });
  });

  describe("requireFeature", () => {
    it("does not throw when workspace has the feature", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: "pro" });
      await expect(requireFeature("ws_1", "email_branding")).resolves.toBeUndefined();
    });

    it("throws 403 when workspace does not have the feature", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: "starter" });
      await expect(requireFeature("ws_1", "email_branding")).rejects.toThrow(
        "Feature not available",
      );
    });

    it("throws 403 with correct detail message", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: "starter" });
      try {
        await requireFeature("ws_1", "api_access");
        expect.fail("Should have thrown");
      } catch (err) {
        expect((err as { status: number }).status).toBe(403);
        expect((err as { code: string }).code).toBe("FEATURE_NOT_AVAILABLE");
        expect((err as { detail: string }).detail).toContain("Scale");
        expect((err as { detail: string }).detail).toContain("starter");
      }
    });

    it("throws 404 when workspace does not exist", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: null });
      try {
        await requireFeature("ws_missing", "csv_export");
        expect.fail("Should have thrown");
      } catch (err) {
        expect((err as { status: number }).status).toBe(404);
        expect((err as { code: string }).code).toBe("WORKSPACE_NOT_FOUND");
      }
    });

    it("allows csv_export for starter plan", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: "starter" });
      await expect(requireFeature("ws_1", "csv_export")).resolves.toBeUndefined();
    });

    it("allows api_access for growth plan", async () => {
      const { requireFeature } = await loadPlanFeatures({ workspacePlan: "growth" });
      await expect(requireFeature("ws_1", "api_access")).resolves.toBeUndefined();
    });
  });
});
