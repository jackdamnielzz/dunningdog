# Coding Standards

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0002](../adr/ADR-0002-multi-tenant-model.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## General Rules
1. TypeScript strict mode is required.
2. No `any` in domain and API layers.
3. Route handlers must validate input with schema validation.
4. All tenant-bound operations require `workspace_id` context.
5. All external event handlers must be idempotent.

## API Layer Rules
1. Use Problem+JSON for all errors.
2. Return stable enum values only.
3. Keep route handlers thin; move business logic to service layer.

## Data Layer Rules
1. Prisma is the only ORM access path.
2. Every write operation records audit metadata where relevant.
3. Avoid implicit cross-tenant queries.

## UI Layer Rules
1. Use shadcn/ui primitives and consistent design tokens.
2. Keep dashboard state query-driven and cache-safe.
3. Present money values from integer cents with shared formatter.

## Observability Rules
1. Log with structured keys (`workspaceId`, `eventId`, `attemptId`, `traceId`).
2. Capture handled and unhandled exceptions to Sentry.
3. Do not log secrets or full Stripe payloads with sensitive fields.

## Acceptance Criteria
1. Lint and typecheck enforce these rules in CI.
2. Pull requests include tests for all non-trivial behavior changes.

## Non-Goals
1. Framework-agnostic coding style guide.
2. Frontend design system beyond shadcn baseline for MVP.
