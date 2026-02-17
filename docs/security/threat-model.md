# Threat Model (MVP)

- Owner: Security Lead (Interim: Founding Engineer)
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Assets To Protect
1. Stripe OAuth tokens and account linkage.
2. Workspace billing and recovery metadata.
3. Email delivery metadata and customer identifiers.
4. API credentials and signing secrets.

## Primary Threats
1. Forged webhooks.
2. Cross-tenant data exposure.
3. Secret leakage through logs or misconfigured environment.
4. Replay abuse causing duplicate recovery actions.
5. Account takeover through weak auth/session handling.

## Mitigations
1. Strict Stripe signature validation and timestamp window.
2. Workspace-scoped authorization on all tenant data paths.
3. Encrypted secret storage and least-privilege token scopes.
4. Idempotent event and job processing keys.
5. Structured logging with secret redaction.
6. Sentry alerting on abnormal webhook failure rates.

## Residual Risks
1. Third-party provider outage (Stripe/Resend/Vercel) impact.
2. Early-stage manual ops errors during replay and recovery procedures.

## Acceptance Criteria
1. Each identified threat maps to at least one control.
2. Incident response runbooks cover top failure/abuse paths.

## Non-Goals
1. SOC 2 certification controls for MVP launch.
2. Full formal penetration testing before MVP launch.
