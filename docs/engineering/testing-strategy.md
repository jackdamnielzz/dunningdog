# Testing Strategy

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Test Pyramid
1. Unit tests: domain logic, mappers, decline classification, metric formulas.
2. Integration tests: route handlers + DB + Stripe webhook fixtures.
3. End-to-end tests: critical flows through UI/API (sandbox Stripe mode).

## Required MVP Test Scenarios
1. Pre-dunning:
   - card expiring within 14 days creates at-risk record and sends alert.
2. Soft decline flow:
   - failed payment starts attempt, sends sequence, later succeeds and closes as recovered.
3. Hard decline flow:
   - failed payment starts sequence but blocks invalid automatic retry paths.
4. Duplicate webhook delivery:
   - same Stripe event ID causes no duplicate side effects.
5. OAuth disconnect/reconnect:
   - token rotation and workspace isolation remain intact.
6. Hosted update page:
   - customer update completes and subscription resumes success path.
7. Dashboard integrity:
   - computed recovery metrics match event and snapshot source data.
8. Security webhook validation:
   - invalid signatures are rejected and logged.
9. Incident drill:
   - simulated degraded email provider follows fallback runbook behavior.
10. Release safety:
    - preview deployment smoke tests and rollback checks pass.

## Coverage Targets
1. Domain/service layer: >= 85% statement coverage.
2. Route handlers for critical endpoints: >= 80% statement coverage.
3. Mandatory E2E coverage for connect, failed-payment recovery, and dashboard.

## Test Data Strategy
1. Deterministic fixtures for Stripe event payloads.
2. Isolated workspace fixtures to validate tenant boundaries.
3. Seeded sequence variants for step progression tests.

## Acceptance Criteria
1. All 10 required scenarios are automated or documented as approved manual tests.
2. CI blocks merge on failing required scenarios.

## Non-Goals
1. Performance test suite for high-scale workloads in MVP.
2. Fuzz testing pipeline for all API inputs in MVP.
