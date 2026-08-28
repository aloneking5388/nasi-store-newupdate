# Phase 1 Step 1 Discovery Prompt

Use this prompt when you want an AI agent to analyze the repository and produce a discovery report without changing code.

## Ready-To-Use Prompt

```text
Analyze my entire Nasi Store project.

Rules:

- Do NOT generate code.
- Do NOT move files.
- Do NOT edit any file.
- Do NOT propose a migration yet.
- Output only a report grounded in the current repository.

Create a complete inventory of:

- pages
- app routes
- layouts
- components
- Redux slices
- hooks
- utilities
- API routes
- backend/Express modules
- Mongoose models
- shared packages already present

For each item, classify it when possible as one of:

- Customer
- Seller
- Admin
- Shared
- Backend

Important repository context:

- This repo is already an Nx monorepo.
- Extracted frontend apps already exist under apps/:
  - client-web
  - seller-web
  - admin-web
  - customer-web
  - mobile-app
- During migration, some code may still resolve through client-web fallback aliases.
- Seller pages/components/redux have already been moved into seller-web.
- Admin pages/components have already been moved into admin-web.
- Compatibility shims may exist in client-web and should be identified as shims, not primary ownership.
- Report the apparent source-of-truth location separately from compatibility shims.

Output format:

1. Executive summary
2. Route inventory by app
3. Layout inventory by app
4. Component inventory grouped by domain
5. Redux inventory grouped by domain
6. Hooks and utilities inventory
7. API route inventory
8. Backend module inventory
9. Mongoose model inventory
10. Shared package inventory
11. Known shims and fallback dependencies
12. Gaps, ambiguities, and areas needing manual verification

For every section:

- include file paths
- distinguish real implementations from re-exports/shims
- keep findings factual
- avoid recommendations unless the report finds an ambiguity that blocks classification
```

## Analyst Checklist

Before finalizing the report, verify that it does all of the following:

1. Lists routes separately for client-web, customer-web, seller-web, and admin-web.
2. Identifies layout ownership and any cross-app re-exports.
3. Marks shim files explicitly rather than counting them as primary implementations.
4. Separates Redux store roots from individual slices.
5. Distinguishes frontend API routes from backend service modules.
6. Identifies models under the persistence layer separately from route/controller code.
7. Notes any areas still coupled to client-web fallback imports.
8. Avoids proposing code movement or package extraction in this step.

## Expected Outcome

The result of Step 1 should answer:

1. What exists?
2. Which app or domain appears to own it?
3. Where are compatibility layers still hiding true ownership?
4. What must be clarified before Step 2 classification or later extraction steps?

## Follow-On Steps

After this report is complete, the next prompts should usually be:

1. Step 2 classification report
2. Step 3 duplicate/shared-surface analysis
3. Step 4 backend service grouping report
4. Step 5 dependency and coupling risk report
