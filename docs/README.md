# DunningDog Documentation

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](./adr/ADR-0001-tech-stack.md), [ADR-0002](./adr/ADR-0002-multi-tenant-model.md), [ADR-0003](./adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](./api/openapi.yaml), [Webhook Contracts](./api/webhook-contracts.md), [Error Model](./api/error-model.md)

## Purpose
This directory defines the complete delivery blueprint for DunningDog MVP. It is the source of truth for product scope, architecture, API contracts, security, operations, testing, and launch execution.

All documents are written in English (US). Implementation starts only after this baseline is approved.

## Documentation Map
- `adr/`: non-reversible technical decisions.
- `product/`: user and market intent translated to buildable scope.
- `architecture/`: technical shape, domain model, and system behavior.
- `api/`: stable v1 public and integration contracts.
- `engineering/`: local workflow, coding rules, testing, and release process.
- `security/`: threat model and response procedures.
- `operations/`: reliability targets and runbooks.
- `gtm/`: positioning, launch sequence, pricing packaging.
- `support/`: customer support execution.
- `metrics/`: north star and KPI definitions.

## Build Readiness Sequence
1. ADR approval.
2. Product scope lock.
3. Architecture and API contract lock.
4. Engineering and security operating model lock.
5. Operations, GTM, support, and KPI lock.

## Documentation Quality Gates
1. Every document includes owner, status, last reviewed date, and linked ADR/API references.
2. Every specification-style document includes acceptance criteria and non-goals.
3. Mermaid diagrams are included for critical event-driven flows.
4. OpenAPI contract validates and matches error model codes.
5. CI enforces markdown linting and link checks.

## Definition Of Done For Docs Baseline
1. A new engineer can begin implementation without requesting missing product or technical decisions.
2. API consumers can integrate against `docs/api/openapi.yaml` and `docs/api/webhook-contracts.md`.
3. Security and incident response paths are documented for Stripe, email, and background jobs.
4. Release and rollback procedures are concrete and testable.

## Acceptance Criteria
1. All files listed in the agreed information architecture exist and are populated.
2. Core endpoints, enums, and domain types are documented consistently across architecture and API docs.
3. Testing scenarios cover all critical payment recovery and reliability paths.

## Non-Goals
1. This baseline does not include implementation code.
2. This baseline does not define post-MVP integrations beyond Stripe (Paddle/Lemon Squeezy).
