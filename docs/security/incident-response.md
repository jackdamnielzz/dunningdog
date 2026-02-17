# Incident Response Plan

- Owner: Security Lead (Interim: Founding Engineer)
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Incident Severity
1. `SEV-1`: payment recovery blocked across most workspaces or data exposure risk.
2. `SEV-2`: major feature degraded for a subset of workspaces.
3. `SEV-3`: limited defect with workaround.

## Initial Response Targets
1. Acknowledge within 15 minutes for SEV-1/SEV-2.
2. Start mitigation within 30 minutes for SEV-1.
3. Publish internal status updates every 30 minutes for SEV-1.

## Common Incident Playbooks
1. Webhook signature failures spike.
2. Duplicate dunning sends detected.
3. Email provider outage/degraded delivery.
4. Stripe OAuth callback failures.
5. Data isolation concern (possible cross-tenant read).

## Containment Actions
1. Pause sequence sends globally or by workspace if unsafe.
2. Keep webhook intake if possible; quarantine non-processable events.
3. Roll back to last known good deployment when regression is confirmed.
4. Rotate potentially exposed secrets immediately.

## Recovery Actions
1. Replay quarantined events after fix.
2. Validate dashboard metric consistency after replay.
3. Notify affected customers when impact threshold is met.

## Postmortem Requirements
1. Incident timeline with UTC timestamps.
2. Root cause and contributing factors.
3. Corrective actions with owners and due dates.
4. Detection and response gap analysis.

## Acceptance Criteria
1. Runbooks in `docs/operations/runbooks.md` align to these procedures.
2. Testing strategy includes at least one incident drill scenario.

## Non-Goals
1. 24/7 staffed on-call rotation design for MVP.
2. External status page automation at MVP launch.
