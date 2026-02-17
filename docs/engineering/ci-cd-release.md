# CI/CD And Release Process

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## Branching Model
1. `main` is production source.
2. Feature branches merge via pull request.
3. Every PR deploys a Vercel preview.

## CI Stages (Required)
1. Install dependencies.
2. Typecheck.
3. Lint (code + markdown).
4. Unit and integration tests.
5. OpenAPI validation.
6. Link check for docs.

## CD Rules
1. Merge to `main` triggers production deployment on Vercel.
2. Production deploy requires all required checks green.
3. Environment variables are managed per Vercel environment.

## Release Checklist
1. Validate webhook endpoint and signature secret in target environment.
2. Verify Stripe connect callback URLs.
3. Execute smoke tests:
   - auth/session,
   - stripe connect start,
   - webhook acceptance,
   - dashboard summary endpoint.
4. Confirm Sentry release health signal.

## Rollback Strategy
1. Roll back to last known good Vercel deployment.
2. Pause new sequence sends if webhook processing degrades.
3. Keep webhook intake running when safe; queue for replay if needed.
4. Run incident communication procedure from `docs/security/incident-response.md`.

## Acceptance Criteria
1. CI validates docs and API contract consistency.
2. Release and rollback steps are executable without tribal knowledge.

## Non-Goals
1. Blue/green multi-cluster deployments in MVP.
2. Manual release trains with fixed monthly cadence.
