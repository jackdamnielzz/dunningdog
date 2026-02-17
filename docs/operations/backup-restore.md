# Backup And Restore

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0002](../adr/ADR-0002-multi-tenant-model.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md)

## Backup Scope
1. Supabase Postgres data (all workspace and event tables).
2. Critical configuration metadata required for restore.
3. No sensitive provider secrets exported in plain text.

## Backup Policy
1. Daily automated full backups.
2. Point-in-time recovery enabled where supported.
3. Retain daily backups for 30 days and weekly backups for 90 days.

## Restore Objectives
1. Recovery Time Objective (RTO): 2 hours target.
2. Recovery Point Objective (RPO): 24 hours maximum for full backup, lower with PITR.

## Restore Procedure (High Level)
1. Declare incident and freeze non-essential writes when feasible.
2. Select restore point and provision recovery database.
3. Validate schema and data integrity checks.
4. Repoint application to restored database.
5. Replay webhook backlog for consistency.
6. Run dashboard metric reconciliation.

## Verification Checks
1. Workspace auth and Stripe account links intact.
2. Recovery attempts and outcomes counts consistent.
3. New webhook events process normally post-restore.

## Acceptance Criteria
1. Restore procedure is tested at least once before launch.
2. Post-restore reconciliation steps are documented and repeatable.

## Non-Goals
1. Cross-cloud backup replication in MVP.
2. Zero-downtime failover architecture in MVP.
