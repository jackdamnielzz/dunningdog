import { addDays, isBefore } from "date-fns";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { log } from "@/lib/logger";
import { getStripeClient } from "@/lib/stripe/client";
import { getValidAccessToken } from "@/lib/stripe/token";
import { isDatabaseUnavailableError, describeFailure } from "@/lib/runtime-fallback";
import type Stripe from "stripe";

export type PreDunningCandidate = {
  id: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  expirationDate: Date | null;
};

function toExpiryDate(card: { exp_month?: number | null; exp_year?: number | null }) {
  if (!card.exp_month || !card.exp_year) return null;
  // Approximate expiration as the end of the expiration month.
  // JS Date month is 0-based; using day=1 of next month then subtract 1 ms.
  const end = new Date(Date.UTC(card.exp_year, card.exp_month, 1, 0, 0, 0, 0));
  return new Date(end.getTime() - 1);
}

async function getDefaultCardFromSubscription(params: {
  stripe: Stripe;
  apiKey: string;
  stripeAccount: string;
  subscription: Stripe.Subscription;
}): Promise<{ customerId: string; paymentMethodId: string; expirationDate: Date } | null> {
  const customerId =
    typeof params.subscription.customer === "string"
      ? params.subscription.customer
      : params.subscription.customer.id;

  // Determine default payment method (subscription default, then customer default).
  const subDefault = params.subscription.default_payment_method;
  const subscriptionPmId =
    typeof subDefault === "string" ? subDefault : subDefault?.id ?? null;

  let paymentMethodId = subscriptionPmId;

  if (!paymentMethodId) {
    const customer = await params.stripe.customers.retrieve(customerId, {
      apiKey: params.apiKey,
      stripeAccount: params.stripeAccount,
    });
    if (!customer || (customer as { deleted?: boolean }).deleted) return null;
    const inv = (customer as Stripe.Customer).invoice_settings;
    const custDefault = inv?.default_payment_method;
    paymentMethodId = typeof custDefault === "string" ? custDefault : custDefault?.id ?? null;
  }

  if (!paymentMethodId) return null;

  const pm = await params.stripe.paymentMethods.retrieve(paymentMethodId, {
    apiKey: params.apiKey,
    stripeAccount: params.stripeAccount,
  });

  if (!pm || pm.type !== "card" || !pm.card) return null;
  const expirationDate = toExpiryDate(pm.card);
  if (!expirationDate) return null;

  return { customerId, paymentMethodId, expirationDate };
}

export async function runPreDunningScan(workspaceId: string): Promise<PreDunningCandidate[]> {
  const threshold = addDays(new Date(), 14);

  // If DB is unavailable, keep the existing demo behavior / graceful fallback.
  let connected: { id: string; stripeAccountId: string; accessTokenEnc: string; refreshTokenEnc: string | null; tokenExpiresAt: Date | null } | null = null;
  try {
    connected = await db.connectedStripeAccount.findUnique({
      where: { workspaceId },
      select: { id: true, stripeAccountId: true, accessTokenEnc: true, refreshTokenEnc: true, tokenExpiresAt: true },
    });
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) throw error;
    log("warn", "Pre-dunning scan using fallback due to database availability issue", {
      workspaceId,
      reason: describeFailure(error),
    });
    connected = null;
  }

  const stripe = getStripeClient();

  if (!isDemoMode && stripe && connected) {
    const stripeAccount = connected.stripeAccountId;
    const apiKey = await getValidAccessToken(connected);

    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const page = await stripe.subscriptions.list(
        {
          status: "active",
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        },
        { apiKey, stripeAccount },
      );

      for (const sub of page.data) {
        try {
          const cardInfo = await getDefaultCardFromSubscription({
            stripe,
            apiKey,
            stripeAccount,
            subscription: sub,
          });
          if (!cardInfo) continue;

          if (!isBefore(cardInfo.expirationDate, threshold)) continue;

          await db.subscriptionAtRisk.upsert({
            where: {
              id: `${workspaceId}_${sub.id}`,
            },
            update: {
              reason: "card_expiring",
              riskDetectedAt: new Date(),
              expirationDate: cardInfo.expirationDate,
              stripeCustomerId: cardInfo.customerId,
              stripeSubscriptionId: sub.id,
            },
            create: {
              id: `${workspaceId}_${sub.id}`,
              workspaceId,
              stripeCustomerId: cardInfo.customerId,
              stripeSubscriptionId: sub.id,
              reason: "card_expiring",
              riskDetectedAt: new Date(),
              expirationDate: cardInfo.expirationDate,
            },
          });
        } catch (error) {
          log("warn", "Pre-dunning scan failed for subscription item", {
            workspaceId,
            stripeSubscriptionId: sub.id,
            error,
          });
          continue;
        }
      }

      hasMore = page.has_more;
      startingAfter = page.data.at(-1)?.id;
    }
  }

  let existing: PreDunningCandidate[] = [];
  try {
    existing = await db.subscriptionAtRisk.findMany({
      where: {
        workspaceId,
        reason: "card_expiring",
        expirationDate: { not: null },
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        expirationDate: true,
      },
    });
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) throw error;
    log("warn", "Pre-dunning scan returning demo candidate due to database availability", {
      workspaceId,
      reason: describeFailure(error),
    });
    existing = [];
  }

  const candidates = existing.filter((entry) => {
    if (!entry.expirationDate) return false;
    return isBefore(entry.expirationDate, threshold);
  });

  if (isDemoMode && candidates.length === 0) {
    const demo = await db.subscriptionAtRisk.upsert({
      where: {
        id: `${workspaceId}_demo_predunning`,
      },
      update: {
        reason: "card_expiring",
        riskDetectedAt: new Date(),
        expirationDate: addDays(new Date(), 10),
      },
      create: {
        id: `${workspaceId}_demo_predunning`,
        workspaceId,
        stripeCustomerId: "cus_demo_predunning",
        stripeSubscriptionId: "sub_demo_predunning",
        reason: "card_expiring",
        riskDetectedAt: new Date(),
        expirationDate: addDays(new Date(), 10),
      },
    });
    return [
      {
        id: demo.id,
        stripeCustomerId: demo.stripeCustomerId,
        stripeSubscriptionId: demo.stripeSubscriptionId,
        expirationDate: demo.expirationDate,
      },
    ];
  }

  return candidates;
}
