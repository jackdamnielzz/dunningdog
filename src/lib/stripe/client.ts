import Stripe from "stripe";
import { env, isDemoMode } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeClient;
}

export function requireStripeClient(): Stripe {
  const client = getStripeClient();
  if (!client) {
    throw new Error("Stripe is not configured.");
  }
  return client;
}

export function isStripeConfigured() {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.STRIPE_CONNECT_CLIENT_ID,
  );
}

export function canUseRealStripe() {
  return !isDemoMode && Boolean(env.STRIPE_SECRET_KEY);
}
