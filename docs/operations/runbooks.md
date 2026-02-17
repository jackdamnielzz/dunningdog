# Operations Runbooks

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Runbook 1: Stripe Webhook Failures
1. Confirm failure pattern in logs and Sentry.
2. Validate webhook secret and timestamp tolerance.
3. Check endpoint health and deployment status.
4. If signature mismatch persists, rotate secret and redeploy.
5. Replay quarantined events after stabilization.

## Runbook 2: Duplicate Dunning Sends
1. Identify repeated send logs by `attemptId` and step key.
2. Verify idempotency key generation path.
3. Pause affected sequence if user impact is active.
4. Apply fix and replay only unsent valid steps.
5. Notify affected workspaces if duplicate email threshold is exceeded.

## Runbook 3: Email Provider Degradation
1. Confirm provider-side incident.
2. Reduce send concurrency and retry with backoff.
3. Queue delayed sends up to safe delay threshold.
4. If outage persists, pause sequence sends and communicate status.
5. Resume and backfill sends when provider recovers.

## Runbook 4: OAuth Callback Errors
1. Check callback URL and Stripe app config.
2. Validate OAuth state validation logic and session storage.
3. Inspect token exchange responses from Stripe.
4. Deploy fix and ask affected users to reconnect.

## Runbook 5: Metric Drift
1. Compare dashboard aggregates against raw recovery attempts.
2. Recompute snapshot for affected periods.
3. Investigate missing or duplicate event processing.
4. Document correction in incident log.

## Acceptance Criteria
1. Each alert in observability docs maps to a runbook.
2. Steps are executable by an engineer unfamiliar with the incident.

## Non-Goals
1. L3 enterprise support escalation chains.
2. Automatic remediation bots in MVP.
