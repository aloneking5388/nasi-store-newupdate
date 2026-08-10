# Phase 1 Step 4 Backend Service Grouping Prompt

Use this prompt when you want an AI agent to analyze backend modules and group them into future service boundaries without creating services yet.

## Ready-To-Use Prompt

```text
Analyze every backend and API-related module in my Nasi Store repository and group them into future services.

Rules:

- Do NOT generate code.
- Do NOT create services.
- Do NOT move files.
- Do NOT edit any file.
- Output only a report grounded in the current repository.

Analyze:

- Express modules
- route handlers
- controllers
- middleware
- service-layer logic
- Mongoose models
- payment integrations
- chat and notification integrations
- AI-related modules
- upload and infrastructure-adjacent modules

Important repository context:

- This repo already has a `services/` directory in the target monorepo shape.
- The recommended intermediate grouping is domain-first, not maximum microservice fragmentation.
- Favor practical service boundaries before fine-grained microservices.

Start from these candidate service groups:

- auth-service
- catalog-service      # products + categories + inventory
- order-service
- payment-service      # wallet + payments
- engagement-service   # chat + reviews + notifications
- ai-service
- api-gateway

Required tasks:

1. Group backend modules into the most likely future service.
2. Identify cross-cutting modules that may belong in the gateway, shared packages, or infrastructure.
3. Identify models or flows that currently cross service boundaries.
4. Mark modules that are too coupled to classify confidently.
5. Note any areas that should stay together initially even if they could be split later.

Output format:

1. Executive summary
2. Proposed auth-service grouping
3. Proposed catalog-service grouping
4. Proposed order-service grouping
5. Proposed payment-service grouping
6. Proposed engagement-service grouping
7. Proposed ai-service grouping
8. Proposed api-gateway responsibilities
9. Cross-cutting or shared backend concerns
10. Over-coupled or ambiguous areas
11. Manual review items

For every grouped area:

- include file or folder paths
- state the proposed future service
- give one short reason for the grouping
- note major dependencies on other areas when visible

Do not create services in this step.
```

## Analyst Checklist

Before finalizing the report, verify that it does all of the following:

1. Groups by domain responsibility rather than current folder accidents.
2. Keeps products, categories, and inventory together unless there is strong evidence otherwise.
3. Keeps wallet and payments together unless there is strong evidence otherwise.
4. Separates API gateway behavior from domain ownership.
5. Notes where data models cross likely service boundaries.
6. Flags tight coupling instead of pretending service boundaries are already clean.
7. Avoids implementation or extraction instructions in this step.

## Expected Outcome

The result of Step 4 should answer:

1. Which future services make sense for this backend today?
2. Which modules belong to each service?
3. Which modules are cross-cutting or gateway-specific?
4. Which boundaries are risky because the current code is tightly coupled?

## Follow-On Steps

After this report is complete, the next prompts should usually be:

1. Step 5 dependency and coupling risk report
2. First backend extraction scoped to one proposed service only
