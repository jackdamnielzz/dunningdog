# Observability And SLOs

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Error Model](../api/error-model.md), [Webhook Contracts](../api/webhook-contracts.md)

## Core SLIs
1. Webhook acceptance success rate.
2. Recovery workflow completion success rate.
3. Email delivery success rate per sequence step.
4. Dashboard summary freshness lag.
5. API p95 latency for summary and sequence endpoints.

## MVP SLO Targets
1. Webhook acceptance success >= 99.9% per 30-day window.
2. Recovery workflow completion without internal failure >= 99.0%.
3. Email provider accepted response >= 98.5%.
4. Dashboard freshness lag <= 2 minutes for live metrics.
5. API p95 latency <= 500 ms for dashboard endpoints.

## Alert Thresholds
1. Webhook error rate > 2% over 5 minutes.
2. Email send failures > 5% over 15 minutes.
3. Recovery workflow failed state > 3% daily.
4. Metric snapshot job missed two consecutive schedules.

## Instrumentation Requirements
1. Structured logs with correlation IDs.
2. Sentry issues tagged by `workspaceId` and `eventType`.
3. PostHog events for onboarding and sequence configuration milestones.

## Acceptance Criteria
1. Every SLI has a measurable source and alert rule.
2. Runbooks reference these metrics and thresholds.

## Non-Goals
1. Multi-region synthetic monitoring in MVP.
2. Enterprise SLA contracts in MVP.
