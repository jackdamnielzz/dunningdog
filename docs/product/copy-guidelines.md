# Copy Guidelines (Product + Email)

- Owner: Product Marketing
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Voice And Tone
1. Clear, direct, and respectful.
2. Emphasize action and outcome.
3. Avoid guilt-driven or threatening language.

## Email Style Rules
1. Subject lines under 60 characters.
2. One primary call-to-action per message.
3. Mention exact consequence and next step.
4. Use plain language over legal or technical jargon.

## Dunning Sequence Tone Progression
1. Step 1: Friendly reminder.
2. Step 2: Clear urgency and consequence.
3. Step 3+: Final warning with account impact date.

## Required Email Components
1. Workspace brand name and support contact.
2. Reason for payment issue (if safe and available).
3. Secure payment update CTA.
4. What happens if no action is taken.

## Forbidden Content
1. Storing or displaying full card details.
2. Misleading urgency or fake deadlines.
3. Multiple conflicting CTAs in one message.

## Acceptance Criteria
1. Default templates in architecture docs follow this voice.
2. QA checks email copy against these rules before release.

## Non-Goals
1. Localization strategy for MVP.
2. Long-form lifecycle marketing campaigns.
