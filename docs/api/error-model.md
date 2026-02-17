# API Error Model (Problem+JSON)

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](./openapi.yaml), [Webhook Contracts](./webhook-contracts.md)

## Content Type
All non-2xx API errors return:
- `Content-Type: application/problem+json`

## Response Shape
```json
{
  "type": "https://docs.dunningdog.com/errors/AUTH_UNAUTHORIZED",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication token is missing or invalid.",
  "instance": "/api/dashboard/summary",
  "code": "AUTH_UNAUTHORIZED",
  "traceId": "trace_123",
  "meta": {}
}
```

## Error Code Groups

### AUTH_*
1. `AUTH_UNAUTHORIZED`
2. `AUTH_FORBIDDEN`
3. `AUTH_WEBHOOK_SIGNATURE_INVALID`
4. `AUTH_OAUTH_STATE_INVALID`

### STRIPE_*
1. `STRIPE_OAUTH_EXCHANGE_FAILED`
2. `STRIPE_ACCOUNT_NOT_CONNECTED`
3. `STRIPE_EVENT_UNSUPPORTED`
4. `STRIPE_API_RATE_LIMITED`

### DUNNING_*
1. `DUNNING_SEQUENCE_NOT_FOUND`
2. `DUNNING_STEP_INVALID`
3. `DUNNING_WEBHOOK_PROCESSING_FAILED`
4. `DUNNING_RECOVERY_ATTEMPT_CONFLICT`

### VALIDATION_*
1. `VALIDATION_REQUEST_BODY_INVALID`
2. `VALIDATION_QUERY_PARAM_INVALID`
3. `VALIDATION_WEBHOOK_PAYLOAD_INVALID`

### RATE_LIMIT_*
1. `RATE_LIMIT_EXCEEDED`

## Mapping Rules
1. Codes are stable and not reused for different conditions.
2. `type` URI suffix must match `code`.
3. `traceId` is always present for log correlation.
4. Sensitive internals are not exposed in `detail`.

## Acceptance Criteria
1. Every endpoint in `docs/api/openapi.yaml` can return this model.
2. Test strategy includes validation of known error codes.

## Non-Goals
1. Localized error messages in MVP.
2. Public error catalog website in MVP.
