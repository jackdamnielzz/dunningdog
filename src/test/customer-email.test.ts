import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadCustomerEmail(options?: {
  connectedStripeAccount?: { stripeAccountId: string; accessTokenEnc: string } | null;
  stripeClient?: { customers: { retrieve: ReturnType<typeof vi.fn> } } | null;
}) {
  vi.resetModules();

  const findUnique = vi
    .fn()
    .mockResolvedValue(options?.connectedStripeAccount ?? null);
  const retrieve = vi.fn();
  const decryptText = vi.fn((value: string) => `decrypted_${value}`);
  const log = vi.fn();

  const stripeClient =
    options?.stripeClient === undefined
      ? { customers: { retrieve } }
      : options.stripeClient;

  vi.doMock("@/lib/db", () => ({
    db: {
      connectedStripeAccount: {
        findUnique,
      },
    },
  }));

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => stripeClient,
  }));

  vi.doMock("@/lib/crypto", () => ({
    decryptText,
  }));

  vi.doMock("@/lib/logger", () => ({
    log,
  }));

  const customerEmail = await import("@/lib/services/customer-email");

  return {
    customerEmail,
    findUnique,
    retrieve,
    decryptText,
    log,
  };
}

describe("customer email resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes valid email strings", async () => {
    const { customerEmail } = await loadCustomerEmail();

    expect(customerEmail.normalizeEmail("  hello@example.com  ")).toBe("hello@example.com");
    expect(customerEmail.normalizeEmail("")).toBeNull();
    expect(customerEmail.normalizeEmail("not-an-email")).toBeNull();
  });

  it("extracts invoice email hint in priority order", async () => {
    const { customerEmail } = await loadCustomerEmail();

    expect(
      customerEmail.getInvoiceEmailHint({
        customer_email: "first@example.com",
        customer_details: { email: "second@example.com" },
        customer: { email: "third@example.com" },
      }),
    ).toBe("first@example.com");

    expect(
      customerEmail.getInvoiceEmailHint({
        customer_details: { email: "second@example.com" },
      }),
    ).toBe("second@example.com");
  });

  it("returns invoice hint directly when provided", async () => {
    const { customerEmail, findUnique } = await loadCustomerEmail();

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
      invoiceEmailHint: " hint@example.com ",
    });

    expect(resolved).toBe("hint@example.com");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns null when no stripe customer id is available", async () => {
    const { customerEmail } = await loadCustomerEmail();

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: null,
    });

    expect(resolved).toBeNull();
  });

  it("returns null when workspace is not connected to stripe", async () => {
    const { customerEmail, findUnique } = await loadCustomerEmail({
      connectedStripeAccount: null,
    });

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
    });

    expect(resolved).toBeNull();
    expect(findUnique).toHaveBeenCalledWith({ where: { workspaceId: "ws_1" } });
  });

  it("returns null when stripe client is unavailable", async () => {
    const { customerEmail, retrieve } = await loadCustomerEmail({
      connectedStripeAccount: {
        stripeAccountId: "acct_1",
        accessTokenEnc: "enc_token",
      },
      stripeClient: null,
    });

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
    });

    expect(resolved).toBeNull();
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("resolves customer email from stripe when connected account exists", async () => {
    const { customerEmail, retrieve, decryptText } = await loadCustomerEmail({
      connectedStripeAccount: {
        stripeAccountId: "acct_1",
        accessTokenEnc: "enc_token",
      },
    });

    retrieve.mockResolvedValueOnce({
      id: "cus_1",
      deleted: false,
      email: "resolved@example.com",
    });

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
    });

    expect(resolved).toBe("resolved@example.com");
    expect(decryptText).toHaveBeenCalledWith("enc_token");
    expect(retrieve).toHaveBeenCalledWith("cus_1", {
      apiKey: "decrypted_enc_token",
      stripeAccount: "acct_1",
    });
  });

  it("returns null for deleted stripe customer records", async () => {
    const { customerEmail, retrieve } = await loadCustomerEmail({
      connectedStripeAccount: {
        stripeAccountId: "acct_1",
        accessTokenEnc: "enc_token",
      },
    });

    retrieve.mockResolvedValueOnce({
      id: "cus_1",
      deleted: true,
    });

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
    });

    expect(resolved).toBeNull();
  });

  it("logs and returns null when stripe lookup fails", async () => {
    const { customerEmail, retrieve, log } = await loadCustomerEmail({
      connectedStripeAccount: {
        stripeAccountId: "acct_1",
        accessTokenEnc: "enc_token",
      },
    });

    retrieve.mockRejectedValueOnce(new Error("stripe unavailable"));

    const resolved = await customerEmail.resolveCustomerEmail({
      workspaceId: "ws_1",
      stripeCustomerId: "cus_1",
    });

    expect(resolved).toBeNull();
    expect(log).toHaveBeenCalledWith(
      "warn",
      "Failed to resolve customer email from Stripe",
      expect.objectContaining({
        workspaceId: "ws_1",
        stripeCustomerId: "cus_1",
      }),
    );
  });
});
