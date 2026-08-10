# Phase 1 Step 2 Classification Prompt

Use this prompt when you want an AI agent to classify the repository surface into domain ownership buckets without changing code.

## Ready-To-Use Prompt

```text
Classify my Nasi Store repository using the Step 1 discovery inventory.

Rules:

- Do NOT generate code.
- Do NOT move files.
- Do NOT edit any file.
- Do NOT refactor anything.
- Do NOT propose extraction steps yet.
- Output only a classification report grounded in the current repository.

Classify every relevant folder, route group, component area, Redux slice area, hook area, utility area, API area, backend module, and model into one of these buckets:

- Customer
- Seller
- Admin
- Shared
- Backend

Important repository context:

- This repo is already an Nx monorepo.
- Current frontend apps include:
  - client-web
  - customer-web
  - seller-web
  - admin-web
  - mobile-app
- Some code is still in phased migration.
- Seller pages/components/redux already have target ownership in seller-web.
- Admin pages/components already have target ownership in admin-web.
- Compatibility shims may still exist in client-web.
- `@/*` may resolve locally first in extracted apps and may still fall back to client-web in some places.
- Classification must distinguish source-of-truth from compatibility-only shims.

Required tasks:

1. Classify each major app route area.
2. Classify each component folder or component cluster.
3. Classify each Redux store area and slice cluster.
4. Classify each utility and hook area.
5. Classify API routes and backend modules.
6. Mark anything that appears shared across multiple domains.
7. Mark anything ambiguous if ownership cannot be confidently assigned.

When classifying, apply these rules:

- If a file exists only to re-export another app's implementation, classify it as a shim, not an owner.
- If a surface is used by more than one domain and has no clear business owner, classify it as Shared.
- If a surface is tied to runtime data models, persistence, Express handlers, or service behavior, classify it as Backend unless it is clearly just a frontend API route wrapper.
- If a surface mixes concerns, note the dominant concern and mark the coupling.

Output format:

1. Executive summary
2. Customer-owned surfaces
3. Seller-owned surfaces
4. Admin-owned surfaces
5. Shared surfaces
6. Backend-owned surfaces
7. Known shims and compatibility layers
8. Ambiguous or mixed-ownership areas
9. Classification gaps needing manual review

For every section:

- include file or folder paths
- identify whether the item is an implementation, a wrapper, or a shim
- state the reason for classification in one short line
- keep findings factual and concise

Do not include migration instructions in this step.
```

## Analyst Checklist

Before finalizing the report, verify that it does all of the following:

1. Separates ownership from mere physical location.
2. Flags client-web compatibility shims instead of treating them as long-term owners.
3. Treats seller-web and admin-web moved surfaces as primary owners where appropriate.
4. Distinguishes truly shared code from code that is only temporarily cross-imported.
5. Separates backend domain ownership from frontend presentation ownership.
6. Marks unclear mixed areas instead of forcing weak classifications.
7. Avoids suggesting package extraction, service boundaries, or file moves in this step.

## Expected Outcome

The result of Step 2 should answer:

1. Which domain owns each major surface today?
2. Which files are still compatibility layers rather than true ownership locations?
3. Which areas are genuinely shared?
4. Which areas remain too mixed or ambiguous to migrate safely without more analysis?

## Follow-On Steps

After this report is complete, the next prompts should usually be:

1. Step 3 duplicate/shared-surface analysis
2. Step 4 backend service grouping report
3. Step 5 dependency and coupling risk report