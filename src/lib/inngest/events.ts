export interface RecoveryStartedEvent {
  name: "recovery/started";
  data: {
    workspaceId: string;
    recoveryAttemptId: string;
    stripeInvoiceId: string;
  };
}

export interface RecoverySucceededEvent {
  name: "recovery/succeeded";
  data: {
    workspaceId: string;
    stripeInvoiceId: string;
  };
}

export interface PredunningCandidateEvent {
  name: "predunning/candidate";
  data: {
    workspaceId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    expirationDate: string;
  };
}
