export const DEFAULT_WORKSPACE_ID = "ws_demo_default";
export const DEFAULT_WORKSPACE_NAME = "DunningDog Demo Workspace";
export const APP_NAME = "DunningDog";

export const SUPPORTED_STRIPE_WEBHOOK_EVENTS = new Set([
  "invoice.payment_failed",
  "invoice.payment_succeeded",
  "customer.subscription.updated",
  "payment_method.automatically_updated",
]);

export const HARD_DECLINE_CODES = new Set([
  "do_not_honor",
  "lost_card",
  "stolen_card",
  "pickup_card",
  "restricted_card",
  "invalid_account",
  "expired_card",
]);
