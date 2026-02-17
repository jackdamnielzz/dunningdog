# ADR-0003: Event Orchestration With Inngest + Vercel Cron

- Owner: Founding Engineer
- Status: Accepted
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](./ADR-0001-tech-stack.md), [ADR-0002](./ADR-0002-multi-tenant-model.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Context
Dunning flows require delayed steps, retry decisions, and periodic scans (pre-dunning expiration checks). Serverless execution must remain reliable under duplicate events and transient failures.

## Decision
Use `Inngest` for event-driven workflows and delayed steps, plus `Vercel Cron` for scheduled scans:
1. Stripe webhooks publish normalized internal events.
2. Inngest functions orchestrate dunning sequence steps.
3. Vercel Cron triggers periodic expiration scans and metric snapshots.
4. Every job step is idempotent by `(workspace_id, subject_id, step_key)`.

## Retry And Failure Policy
1. Transient failures use exponential backoff with capped retries.
2. Hard failures create an alert event and move sequence state to `failed`.
3. Replayed webhooks must not duplicate sends or retries.

## Consequences
- Lower operational load than self-managed worker infrastructure.
- Requires careful idempotency and observability instrumentation.

## Rejected Alternatives
1. BullMQ + Redis as primary orchestration for MVP.
2. Synchronous API-driven orchestration without persistent job state.

## Acceptance Criteria
1. Architecture docs include sequence flow from webhook to recovery.
2. Runbooks document replay, retry, and stuck-job remediation.
3. Testing strategy validates duplicate event safety.

## Non-Goals
1. Real-time stream processing pipeline.
2. Multi-provider orchestration engine abstraction in MVP.
