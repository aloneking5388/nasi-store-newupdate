# docs

Architecture, runbooks, ADRs, and migration playbooks.

## Migration Prompts

Phase 1 prompt set:

1. [Phase 1 Step 1 Discovery Prompt](./phase-1-step-1-discovery-prompt.md)
2. [Phase 1 Step 2 Classification Prompt](./phase-1-step-2-classification-prompt.md)
3. [Phase 1 Step 3 Duplicate Shared Surface Prompt](./phase-1-step-3-duplicate-shared-surface-prompt.md)
4. [Phase 1 Step 4 Backend Service Grouping Prompt](./phase-1-step-4-backend-service-grouping-prompt.md)
5. [Phase 1 Step 5 Dependency And Coupling Risk Prompt](./phase-1-step-5-dependency-and-coupling-risk-prompt.md)
6. [Completion Evidence Checklist](completion-evidence-checklist.md)
7. [Task 1 Backend Auth Architecture Analysis](./task-1-backend-auth-architecture-analysis.md)

Use these prompts in order. Each step should remain small, report-only, and grounded in the current repository state unless a later step explicitly asks for implementation.

## Current Guidance

The repo-level migration rules for coding agents live in [AGENTS.md](../AGENTS.md).

Use that file together with the step prompts when asking an agent to analyze or migrate the codebase.

## Suggested Sequence

1. Run Step 1 to inventory the repo.
2. Run Step 2 to classify ownership.
3. Run Step 3 to find duplicate and shareable surfaces.
4. Run Step 4 to group backend modules into future services.
5. Run Step 5 to identify coupling, circular imports, and migration risks.

After Phase 1 is complete, move to package extraction or backend extraction one slice at a time.
