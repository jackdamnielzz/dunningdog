# Stripe Webhook Contracts (v1)

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](./openapi.yaml), [Error Model](./error-model.md)

## Endpoint
- `POST /api/webhooks/stripe`

Required header:
- `Stripe-Signature`

## Supported Stripe Events
1. `invoice.payment_failed`
2. `invoice.payment_succeeded`
3. `customer.subscription.updated`
4. `payment_method.automatically_updated`

All unsupported events are acknowledged with `200` and ignored.

## Contract Rules
1. Signature must be verified before payload processing.
2. Event must include `id`, `type`, and account context.
3. Workspace is resolved from connected Stripe account ID.
4. Processing result is persisted in `stripe_events`.

## Idempotency Behavior
1. Primary key for deduplication: `stripe_event_id`.
2. Duplicate `stripe_event_id` results in no side effects and `duplicate=true` in response.
3. Downstream jobs use per-step idempotency key:
   - `workspace_id:event_type:subject_id:step_key`.

## Replay Behavior
1. Manual replay is allowed for previously accepted events.
2. Replay never bypasses idempotency checks.
3. Replay execution records:
   - actor,
   - timestamp,
   - replay reason.
4. Terminal states (`recovered`, `failed`, `abandoned`) are not reopened automatically.

## Failure Contract
1. Invalid signature -> `401 AUTH_WEBHOOK_SIGNATURE_INVALID`.
2. Missing workspace mapping -> `404 STRIPE_ACCOUNT_NOT_CONNECTED`.
3. Malformed payload -> `400 VALIDATION_WEBHOOK_PAYLOAD_INVALID`.
4. Internal processing failure -> `500 DUNNING_WEBHOOK_PROCESSING_FAILED`.

## Acceptance Criteria
1. Webhook flow in architecture docs matches this contract exactly.
2. Testing strategy includes duplicate delivery and replay scenarios.

## Non-Goals
1. Bidirectional webhook forwarding to customer systems in MVP.
2. Custom user-defined webhook event subscriptions in MVP.
