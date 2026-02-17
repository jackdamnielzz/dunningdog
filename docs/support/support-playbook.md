# Support Playbook

- Owner: Founder / Support
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Error Model](../api/error-model.md), [Webhook Contracts](../api/webhook-contracts.md)

## Support Objectives
1. Resolve customer issues quickly with clear ownership.
2. Protect trust around billing and data handling.
3. Capture recurring issues for product and engineering feedback loops.

## Ticket Categories
1. Onboarding/connect issues.
2. Recovery flow and email delivery issues.
3. Dashboard or metric discrepancy.
4. Billing and subscription plan questions.
5. Security/privacy concerns.

## Severity Guidelines
1. High: active revenue recovery impact or data concern.
2. Medium: feature not behaving but workaround exists.
3. Low: guidance and non-blocking requests.

## Standard Response Workflow
1. Confirm workspace and impacted entity IDs.
2. Correlate with `traceId`/`eventId` from logs.
3. Resolve directly or escalate with full context bundle.
4. Close with customer-facing summary and preventive note.

## Escalation Criteria
1. Possible cross-tenant data exposure.
2. Duplicate sends across many customers.
3. Systemic webhook or OAuth failures.

## Acceptance Criteria
1. Common support cases map to runbooks and error codes.
2. Response templates align with copy guidelines and positioning.

## Non-Goals
1. 24/7 multilingual support in MVP.
2. Dedicated account management workflows in MVP.
