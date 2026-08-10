# Phase 1 Step 5 Dependency And Coupling Risk Prompt

Use this prompt when you want an AI agent to analyze dependencies, circular imports, and migration risks without changing code.

## Ready-To-Use Prompt

```text
Analyze dependencies and coupling in my Nasi Store repository.

Rules:

- Do NOT generate code.
- Do NOT move files.
- Do NOT edit any file.
- Output only a report grounded in the current repository.

Find and analyze:

- circular imports
- tight module coupling
- cross-app fallback dependencies
- Redux slices tightly coupled to UI or routing
- backend modules tightly coupled to shared state, models, or helpers
- route groups that depend on another app's implementation
- migration shims that still hide unresolved ownership
- service-boundary risks in backend code

Important repository context:

- This repo is already in phased migration.
- Some apps rely on fallback aliases into client-web.
- Seller and admin surfaces have already been moved in part, but compatibility shims remain.
- The purpose of this step is to identify risk before deeper extraction.

Required tasks:

1. Find dependency cycles when visible.
2. Identify modules that cannot be extracted cleanly without untangling dependencies.
3. Identify app-to-app imports and fallback alias dependencies.
4. Identify backend areas likely to break if extracted in the wrong order.
5. Rank major migration risks by severity.

Output format:

1. Executive summary
2. Circular import findings
3. Cross-app dependency findings
4. Frontend coupling risks
5. Redux coupling risks
6. Backend coupling risks
7. Service-boundary risks
8. Severity-ranked migration risks
9. Manual review items

For every finding:

- include file or folder paths
- describe the coupling or cycle in one short paragraph or two short bullets
- state why it is risky for migration
- state whether it is low, medium, or high risk

Do not propose code changes in this step unless a risk cannot be described without naming the likely dependency break point.
```

## Analyst Checklist

Before finalizing the report, verify that it does all of the following:

1. Distinguishes temporary compatibility shims from long-term architectural coupling.
2. Identifies app-level alias fallbacks that block true independence.
3. Separates frontend extraction risk from backend service extraction risk.
4. Calls out high-risk areas that should not be migrated early.
5. Avoids generic warnings and stays file- or module-specific.
6. Avoids implementation work in this step.

## Expected Outcome

The result of Step 5 should answer:

1. What is most likely to break during extraction?
2. Which dependencies are blocking clean app or service boundaries?
3. Which risks are acceptable now versus which need explicit mitigation first?
4. What extraction order is safest based on actual coupling?

## Follow-On Steps

After this report is complete, the next prompts should usually be:

1. First shared package extraction for the safest shared surface
2. First backend domain extraction for the safest service boundary
3. Focused mitigation tasks for the highest-risk coupling findings
