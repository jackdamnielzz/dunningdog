# User Journeys

- Owner: Product + Design
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Webhook Contracts](../api/webhook-contracts.md)

## Journey 1: Onboard And Activate
1. User signs in and creates workspace.
2. User starts Stripe connect flow.
3. OAuth callback stores connected account.
4. User configures default email sequence.
5. User enables automation.

Success condition: user reaches "active monitoring" state in one session.

## Journey 2: Failed Payment Recovery
1. Stripe sends `invoice.payment_failed`.
2. System classifies decline type and opens recovery attempt.
3. First dunning email is sent.
4. Customer updates payment method via hosted page.
5. Stripe sends `invoice.payment_succeeded`.
6. Sequence closes as recovered and dashboard updates.

Success condition: failed invoice moves to recovered with clear audit trail.

## Journey 3: Pre-Dunning Prevention
1. Daily scan finds expiring payment method within 14 days.
2. Pre-dunning alert is scheduled and sent.
3. Customer updates payment before invoice due date.
4. Next renewal succeeds without entering failed flow.

Success condition: at-risk subscription avoids failed invoice event.

## Journey 4: Workspace Operations
1. User reviews dashboard KPIs.
2. User edits dunning sequence copy.
3. User pauses sequence for maintenance or incident.
4. User resumes sequence and tracks impact.

Success condition: user can control automation without support intervention.

## Acceptance Criteria
1. Every journey maps to test cases in `docs/engineering/testing-strategy.md`.
2. Journey steps align with endpoint and webhook contracts.

## Non-Goals
1. Multi-user workflow approvals in MVP.
2. Manual debt collection workflows beyond automated dunning.
