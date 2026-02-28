import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- email-template (pure function, no mocks needed) -------------- */

describe("Feature 2: Email branding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ====================================================================== */
  /*  renderDunningEmailHtml                                                 */
  /* ====================================================================== */

  describe("renderDunningEmailHtml", () => {
    async function loadTemplate() {
      vi.resetModules();
      return import("@/lib/services/email-template");
    }

    it("renders default branding when no branding provided", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Payment failed",
        body: "Please update your card.",
        branding: null,
      });

      expect(html).toContain("DunningDog");
      expect(html).toContain("#10b981");
      expect(html).toContain("Please update your card.");
      expect(html).toContain("<title>Payment failed</title>");
    });

    it("renders custom company name and accent color", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Update payment",
        body: "Your payment failed.",
        branding: {
          companyName: "Acme Corp",
          accentColor: "#ff5500",
          logoUrl: null,
          footerText: null,
        },
      });

      expect(html).toContain("Acme Corp");
      expect(html).toContain("#ff5500");
      expect(html).not.toContain("DunningDog");
    });

    it("renders logo when logoUrl is provided", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Test",
        body: "Body text here.",
        branding: {
          companyName: "LogoCo",
          accentColor: "#10b981",
          logoUrl: "https://example.com/logo.png",
          footerText: null,
        },
      });

      expect(html).toContain('<img src="https://example.com/logo.png"');
      expect(html).toContain('alt="LogoCo"');
    });

    it("renders CTA button when paymentUpdateUrl is provided", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Update",
        body: "Payment failed.",
        branding: null,
        paymentUpdateUrl: "https://app.test/update-payment/abc123",
      });

      expect(html).toContain('href="https://app.test/update-payment/abc123"');
      expect(html).toContain("Update payment method");
    });

    it("does not render CTA button when no paymentUpdateUrl", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Update",
        body: "Payment failed.",
        branding: null,
      });

      expect(html).not.toContain("Update payment method");
    });

    it("renders footer text when provided", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: "Test",
        body: "Body.",
        branding: {
          companyName: "FooterCo",
          accentColor: "#10b981",
          logoUrl: null,
          footerText: "Questions? Contact support@example.com",
        },
      });

      expect(html).toContain("Questions? Contact support@example.com");
    });

    it("escapes HTML in user-provided content to prevent XSS", async () => {
      const { renderDunningEmailHtml } = await loadTemplate();
      const html = renderDunningEmailHtml({
        subject: '<script>alert("xss")</script>',
        body: '<img onerror="alert(1)" src="x">',
        branding: {
          companyName: '<script>bad</script>',
          accentColor: "#10b981",
          logoUrl: null,
          footerText: null,
        },
      });

      // Script tags and attributes should be entity-encoded, not rendered as raw HTML
      expect(html).not.toContain("<script>");
      expect(html).not.toContain('<img onerror');
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&lt;img onerror=&quot;alert(1)&quot;");
    });
  });

  /* ====================================================================== */
  /*  branding service (getBranding / upsertBranding)                        */
  /* ====================================================================== */

  describe("branding service", () => {
    async function loadBranding(deps?: {
      findUnique?: ReturnType<typeof vi.fn>;
      upsert?: ReturnType<typeof vi.fn>;
    }) {
      vi.resetModules();

      vi.doMock("@/lib/db", () => ({
        db: {
          emailBranding: {
            findUnique: deps?.findUnique ?? vi.fn().mockResolvedValue(null),
            upsert: deps?.upsert ?? vi.fn().mockImplementation(async (args: { create: unknown }) => args.create),
          },
        },
      }));

      return import("@/lib/services/branding");
    }

    it("getBranding returns branding for workspace", async () => {
      const mockBranding = {
        workspaceId: "ws_1",
        companyName: "TestCo",
        logoUrl: null,
        accentColor: "#ff0000",
        footerText: null,
      };
      const findUnique = vi.fn().mockResolvedValue(mockBranding);
      const branding = await loadBranding({ findUnique });

      const result = await branding.getBranding("ws_1");

      expect(result).toEqual(mockBranding);
      expect(findUnique).toHaveBeenCalledWith({ where: { workspaceId: "ws_1" } });
    });

    it("getBranding returns null when no branding exists", async () => {
      const findUnique = vi.fn().mockResolvedValue(null);
      const branding = await loadBranding({ findUnique });

      const result = await branding.getBranding("ws_1");

      expect(result).toBeNull();
    });

    it("upsertBranding creates branding with default accent color", async () => {
      const upsert = vi.fn().mockImplementation(async (args: { create: unknown }) => args.create);
      const branding = await loadBranding({ upsert });

      await branding.upsertBranding("ws_1", {
        companyName: "NewCo",
      });

      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: "ws_1" },
          create: expect.objectContaining({
            workspaceId: "ws_1",
            companyName: "NewCo",
            accentColor: "#10b981",
          }),
        }),
      );
    });

    it("upsertBranding updates existing branding", async () => {
      const upsert = vi.fn().mockImplementation(async (args: { update: unknown }) => args.update);
      const branding = await loadBranding({ upsert });

      await branding.upsertBranding("ws_1", {
        companyName: "UpdatedCo",
        accentColor: "#0000ff",
        logoUrl: "https://example.com/new-logo.png",
        footerText: "New footer",
      });

      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            companyName: "UpdatedCo",
            accentColor: "#0000ff",
            logoUrl: "https://example.com/new-logo.png",
            footerText: "New footer",
          }),
        }),
      );
    });

    it("upsertBranding sets logoUrl to null when empty string", async () => {
      const upsert = vi.fn().mockImplementation(async (args: { update: unknown }) => args.update);
      const branding = await loadBranding({ upsert });

      await branding.upsertBranding("ws_1", { logoUrl: "" });

      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ logoUrl: null }),
          create: expect.objectContaining({ logoUrl: null }),
        }),
      );
    });
  });

  /* ====================================================================== */
  /*  brandingSchema validation                                              */
  /* ====================================================================== */

  describe("brandingSchema validation", () => {
    async function loadSchema() {
      vi.resetModules();
      vi.doMock("@/lib/db", () => ({ db: {} }));
      return import("@/lib/services/branding");
    }

    it("accepts valid branding input", async () => {
      const { brandingSchema } = await loadSchema();
      const result = brandingSchema.safeParse({
        companyName: "Acme",
        logoUrl: "https://example.com/logo.png",
        accentColor: "#ff5500",
        footerText: "Thanks for being a customer!",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty logoUrl", async () => {
      const { brandingSchema } = await loadSchema();
      const result = brandingSchema.safeParse({ logoUrl: "" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid hex color", async () => {
      const { brandingSchema } = await loadSchema();
      const result = brandingSchema.safeParse({ accentColor: "red" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid URL for logoUrl", async () => {
      const { brandingSchema } = await loadSchema();
      const result = brandingSchema.safeParse({ logoUrl: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("rejects company name over 100 characters", async () => {
      const { brandingSchema } = await loadSchema();
      const result = brandingSchema.safeParse({ companyName: "A".repeat(101) });
      expect(result.success).toBe(false);
    });
  });
});
