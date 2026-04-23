import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe/client";
import { getValidAccessToken } from "@/lib/stripe/token";
import { log } from "@/lib/logger";

export function normalizeEmail(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.includes("@")) return null;
  return trimmed;
}

type InvoiceEmailHint = {
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  customer?: { email?: string | null } | string | null;
};

export function getInvoiceEmailHint(invoice: Stripe.Invoice | unknown): string | null {
  const inv = invoice as InvoiceEmailHint;
  return (
    normalizeEmail(inv.customer_email) ??
    normalizeEmail(inv.customer_details?.email) ??
    (typeof inv.customer === "object" ? normalizeEmail(inv.customer?.email) : null) ??
    null
  );
}

export async function resolveCustomerEmail(params: {
  workspaceId: string;
  stripeCustomerId?: string | null;
  invoiceEmailHint?: string | null;
}): Promise<string | null> {
  const hinted = normalizeEmail(params.invoiceEmailHint);
  if (hinted) return hinted;

  const stripeCustomerId = params.stripeCustomerId;
  if (!stripeCustomerId) return null;

  // Lookup connected account credentials to access customer details.
  const connected = await db.connectedStripeAccount.findUnique({
    where: { workspaceId: params.workspaceId },
  });

  if (!connected) {
    return null;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  try {
    const accessToken = await getValidAccessToken(connected);
    const customer = await stripe.customers.retrieve(stripeCustomerId, {
      apiKey: accessToken,
      stripeAccount: connected.stripeAccountId,
    });

    if (!customer || (customer as { deleted?: boolean }).deleted) {
      return null;
    }

    return normalizeEmail((customer as Stripe.Customer).email);
  } catch (error) {
    log("warn", "Failed to resolve customer email from Stripe", {
      workspaceId: params.workspaceId,
      stripeCustomerId,
      error,
    });
    return null;
  }
}

