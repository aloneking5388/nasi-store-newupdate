# Phase 1 Step 3 Duplicate Shared Surface Prompt

Use this prompt when you want an AI agent to find duplicate code and identify candidates for future shared packages without changing code.

## Ready-To-Use Prompt

```text
Analyze my Nasi Store repository for duplicate or near-duplicate surfaces using the Step 1 inventory and Step 2 classification.

Rules:

- Do NOT generate code.
- Do NOT move files.
- Do NOT edit any file.
- Do NOT create packages yet.
- Output only a report grounded in the current repository.

Find duplicate or near-duplicate:

- utilities
- TypeScript types and interfaces
- hooks
- reusable UI components
- wrapper components
- page-level patterns that may be candidates for shared abstractions
- Redux slices or repeated Redux logic

Important repository context:

- This repo is already an Nx monorepo.
- Some frontend surfaces have been moved into seller-web and admin-web.
- Compatibility shims may exist in client-web and should not be counted as real duplicates.
- Alias fallbacks may temporarily make one implementation appear in multiple apps.
- The goal of this step is analysis only, not extraction.

Required tasks:

1. Identify exact duplicates.
2. Identify near-duplicates with minor naming or styling differences.
3. Separate true duplicated logic from temporary shim-based duplication.
4. Group duplicates by likely future package destination.
5. Explain why each group is a strong or weak shared-package candidate.

Potential future destinations to use in the report:

- packages/types
- packages/constants
- packages/utils
- packages/hooks
- packages/ui
- packages/validation
- packages/theme
- packages/api-sdk

Output format:

1. Executive summary
2. Exact duplicates
3. Near-duplicates
4. Shim-only duplicates to ignore for extraction planning
5. Suggested shared package groupings
6. Weak candidates that should stay domain-owned for now
7. Ambiguities and manual review items

For every duplicate group:

- include file paths
- state whether it is exact, near-duplicate, or shim-only
- name the likely future shared destination
- give one short reason for the grouping

Do not perform extraction in this step.
```

## Analyst Checklist

Before finalizing the report, verify that it does all of the following:

1. Excludes compatibility shims from normal duplicate counts.
2. Separates domain-owned repetition from genuinely reusable shared code.
3. Distinguishes UI duplication from logic duplication.
4. Distinguishes type duplication from import-path duplication.
5. Notes when apparent duplicates differ in behavior enough to block sharing.
6. Avoids recommending code edits or package creation in this step.

## Expected Outcome

The result of Step 3 should answer:

1. What is duplicated today?
2. Which duplicates are real versus temporary migration artifacts?
3. Which surfaces are strongest candidates for future shared packages?
4. Which duplicates should remain separate because they are domain-specific?

## Follow-On Steps

After this report is complete, the next prompts should usually be:

1. Step 4 backend service grouping report
2. Step 5 dependency and coupling risk report
3. Shared package extraction planning for the strongest candidates