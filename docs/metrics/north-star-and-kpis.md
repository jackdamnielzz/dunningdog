# North Star And KPI Framework

- Owner: Founder / Product
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## North Star Metric
`Recovery Rate`:

`Recovery Rate = (Recovered Revenue / Failed Payment Revenue) * 100`

Target for early operation window: >= 65%.

## Core Business KPIs
1. Recovered revenue (monthly and lifetime).
2. Failed payment revenue monitored.
3. Time-to-value (connect to first successful recovery insight).
4. Trial-to-paid conversion rate.
5. Monthly customer churn rate.

## Product Health KPIs
1. Active workspaces with automation enabled.
2. Sequence completion rate.
3. Email delivery success rate.
4. Dashboard usage frequency.

## Reliability KPIs
1. Webhook acceptance success rate.
2. Dunning workflow failure rate.
3. Mean time to detect and resolve incidents.

## Reporting Cadence
1. Weekly internal KPI review.
2. Monthly customer-facing recovery report email.
3. Quarterly KPI target re-baseline.

## Acceptance Criteria
1. KPI formulas align with architecture metric definitions.
2. Dashboard and reports use the same source definitions.

## Non-Goals
1. Vanity metrics without decision value.
2. Complex attribution models in MVP.
