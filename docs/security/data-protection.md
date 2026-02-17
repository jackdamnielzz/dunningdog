# Data Protection And Privacy Baseline

- Owner: Security Lead (Interim: Founding Engineer)
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## Data Classification
1. Sensitive: OAuth tokens, provider keys, session tokens.
2. Confidential: customer email, Stripe IDs, invoice metadata.
3. Operational: aggregated metrics and logs.

## Data Handling Rules
1. Do not store full card numbers or CVC.
2. Store only Stripe references for payment methods.
3. Encrypt OAuth tokens at rest.
4. Restrict service-role key usage to server-side routes/jobs.
5. Pseudonymize data in analytics where possible.

## Retention Rules
1. Recovery and event logs retained for at least 13 months.
2. Data deletion request path documented for workspace owner requests.
3. Backups follow retention controls in `docs/operations/backup-restore.md`.

## Access Controls
1. Principle of least privilege across providers.
2. Production access limited to designated maintainers.
3. Audit critical actions (token refresh, replay, sequence pause/resume).

## Acceptance Criteria
1. Data categories and handling rules map to actual schema and runbooks.
2. No rule conflicts with webhook and error model docs.

## Non-Goals
1. Region-specific legal policy packs (for example, DPA templates) in MVP.
2. Customer-facing trust center in MVP.
