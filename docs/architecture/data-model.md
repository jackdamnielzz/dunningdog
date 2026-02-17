# Data Model (Relational Schema Blueprint)

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Design Principles
1. All tenant-bound tables include `workspace_id`.
2. Stripe identifiers are unique in tenant scope.
3. Write paths are idempotent on external event IDs.
4. Soft delete only where required for audit traceability.

## Core Tables
1. `workspaces`
   - `id` (pk), `name`, `owner_user_id`, `timezone`, `billing_plan`, `is_active`, timestamps.
2. `workspace_members`
   - `id` (pk), `workspace_id`, `user_id`, `role` (`owner|admin`), timestamps.
3. `connected_stripe_accounts`
   - `id` (pk), `workspace_id`, `stripe_account_id`, encrypted token fields, `livemode`, timestamps.
4. `dunning_sequences`
   - `id` (pk), `workspace_id`, `name`, `is_enabled`, `version`, timestamps.
5. `dunning_sequence_steps`
   - `id` (pk), `sequence_id`, `step_order`, `delay_hours`, `subject_template`, `body_template`, timestamps.
6. `subscriptions_at_risk`
   - `id` (pk), `workspace_id`, `stripe_customer_id`, `stripe_subscription_id`, `reason`, `risk_detected_at`, `expiration_date`, timestamps.
7. `recovery_attempts`
   - `id` (pk), `workspace_id`, `stripe_invoice_id`, `stripe_customer_id`, `decline_type`, `status`, `amount_due_cents`, `recovered_amount_cents`, timestamps.
8. `recovery_outcomes`
   - `id` (pk), `workspace_id`, `recovery_attempt_id`, `outcome`, `reason_code`, `occurred_at`.
9. `email_logs`
   - `id` (pk), `workspace_id`, `recovery_attempt_id`, `provider_message_id`, `template_key`, `delivery_status`, timestamps.
10. `stripe_events`
   - `id` (pk), `workspace_id`, `stripe_event_id` (unique), `event_type`, `payload_json`, `received_at`, `processed_at`, `processing_status`.
11. `metric_snapshots`
   - `id` (pk), `workspace_id`, `period_start`, `period_end`, metrics fields, `generated_at`.

## Required Indexes
1. `stripe_events(stripe_event_id)` unique.
2. `recovery_attempts(workspace_id, stripe_invoice_id)` unique active constraint.
3. `subscriptions_at_risk(workspace_id, stripe_subscription_id)`.
4. `metric_snapshots(workspace_id, period_start, period_end)` unique.

## Retention Policy
1. `stripe_events` and `email_logs`: retain 13 months minimum.
2. `metric_snapshots`: retain indefinitely.
3. Tokens in `connected_stripe_accounts` rotate on reconnect.

## Acceptance Criteria
1. Schema supports all v1 endpoints and webhook flows.
2. Unique constraints prevent duplicate recovery attempts and event reprocessing.

## Non-Goals
1. Event sourcing architecture beyond operational audit tables.
2. BI warehouse modeling in MVP.
