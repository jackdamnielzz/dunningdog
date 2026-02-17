# Dashboard Metrics Specification

- Owner: Product + Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Metric Definitions
1. `failedRevenue`: sum of amount due for failed invoices in selected period.
2. `recoveredRevenue`: sum of recovered amounts tied to failed invoices in period.
3. `recoveryRate`: `(recoveredRevenue / failedRevenue) * 100`.
4. `atRiskCount`: open subscriptions flagged as expiring or currently failed.
5. `activeSequences`: number of non-terminal recovery attempts.

## Golden Metric
`Recovery Rate` is the primary KPI and must be shown prominently.

## Time Windows
1. Default: current calendar month (workspace timezone).
2. Also available: last 7 days, last 30 days, last 90 days, lifetime.

## Data Freshness Targets
1. Webhook-driven updates: near real time (< 2 minutes target).
2. Snapshot tables: hourly for monthly/lifetime aggregates.

## Calculation Rules
1. Monetary amounts stored and computed in integer cents.
2. Use workspace currency normalization only if single-currency workspace.
3. Exclude test-mode Stripe events from production metrics.

## Acceptance Criteria
1. Dashboard summary endpoint fields map exactly to these definitions.
2. Metric formulas are consistent with `docs/metrics/north-star-and-kpis.md`.
3. Test strategy includes reconciliation tests between raw events and snapshots.

## Non-Goals
1. Cohort analytics and retention segmentation in MVP.
2. Cross-workspace benchmark dashboards in MVP.
