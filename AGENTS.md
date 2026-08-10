# Nasi Store Agent Guide

## Purpose

This repository is being migrated from a single production application into an Nx monorepo with separate web apps, shared packages, and domain services.

Backend modernization must follow a modular-monolith-first strategy before microservice extraction.

The primary rule is: make small, verifiable, reversible changes.

Do not attempt broad rewrites. Do not combine multiple migration phases in one task.

## Target Architecture

```text
nasi-store/

apps/
  client-web/          # Next.js customer website
  seller-web/          # Next.js seller dashboard
  admin-web/           # Next.js admin dashboard
  mobile-app/          # React Native Expo app

services/
  api-gateway/
  auth-service/
  user-service/
  seller-service/
  product-service/
  category-service/
  inventory-service/
  order-service/
  wallet-service/
  payment-service/
  review-service/
  coupon-service/
  cart-service/
  wishlist-service/
  chat-service/
  notification-service/
  upload-service/
  analytics-service/
  ai-service/

packages/
  ui/
  api-sdk/
  types/
  validation/
  utils/
  hooks/
  constants/
  config/
  theme/

tooling/
  eslint-config/
  tsconfig/
  prettier-config/

infra/
  docker/
  nginx/
  scripts/
```

## Migration Strategy

Use an AI-first migration workflow where every step is:

1. small in scope
2. compile-verified
3. easy to roll back
4. isolated to one migration concern

Preferred order:

1. Discovery and reporting only
2. Monorepo infrastructure only
3. Backend modular monolith extraction inside one server
4. Frontend extraction one app surface at a time
5. Shared package extraction one package at a time
6. Mobile reuse after web and packages stabilize
7. Backend service extraction only when a module is proven stable

## Backend Strategy: Modular Monolith First

Do not split into many independent services before domain modules are complete inside one server.

Do not create a new top-level backend application during this phase. Refactor the existing backend in place first.

Working backend target during migration (in-place refactor pattern):

```text
<existing-backend-root>/
  src/
    modules/
      auth/
      products/
      orders/
      wallet/
      reviews/
      chat/
    shared/
    config/
    middleware/
    utils/
  app.ts|app.js
  server.ts|server.js
```

The goal is one deployment, one runtime, one DB connection, and strict domain boundaries.

After module boundaries are stable and verified, relocating files (for example to services/server) should be treated as a separate, low-risk filesystem task.

## Module Ownership Rule

Every backend module must own its complete business domain.

A module contains:

1. controller
2. routes
3. service
4. repository
5. model
6. validation
7. dto
8. types
9. constants
10. events (optional)
11. index.ts

Modules must not import another module's internal files.

Cross-module communication must occur through:

1. exported public interfaces
2. shared packages
3. events
4. service contracts

Never import from another module's internal folders.

## Dependency Direction Rule

Allowed direction:

1. Controller -> Service
2. Service -> Repository
3. Repository -> Database

Not allowed direction:

1. Repository -> Controller
2. Service -> Routes
3. Model -> Controller
4. Validation -> Database

If layering direction is violated, task status is incomplete.

## Service Extraction Gate (Mandatory)

NEVER create or continue a standalone service unless at least 80% of the corresponding module has already been extracted from the modular monolith.

A standalone service is considered complete only when all conditions are met:

1. Controllers exist and are used.
2. Routes exist and are mounted.
3. Services exist and contain business logic.
4. Validation exists and is enforced.
5. Models exist for required persistence behavior.
6. Tests exist (not placeholder output).
7. Build target exists and runs.
8. Health endpoint exists and responds.
9. No runtime dependency on old module paths remains.

If any condition fails, keep work in the modular monolith and do not report service completion.

## Empty Scaffold Ban

Do not scaffold empty backend services.

If a service folder contains only placeholder files or log-only startup, classify it as scaffold-only and report it as incomplete.

## Non-Negotiable Rules

1. Do not move unrelated code while handling a scoped request.
2. Do not rewrite architecture unless the task explicitly requests it.
3. Do not delete compatibility paths during phased migration.
4. When moving code between apps, preserve behavior first and optimize later.
5. After each move, run the narrowest compile gate immediately.
6. Stop after the requested slice is complete and verified.
7. No new top-level application, package, or service may be created unless there is a documented architectural reason and the previous migration phase is fully completed and verified.
8. Prefer refactoring existing code in place over creating new folders.
9. Minimize file moves and preserve Git history whenever practical.

## Frontend Extraction Rules

When moving pages, components, hooks, or Redux between apps:

1. Move real implementation files into the target app.
2. Leave compatibility shims at the old paths in the source app.
3. Keep import changes minimal.
4. Prefer alias-based imports over brittle relative paths.
5. Make target-app `@/*` resolution local-first when it owns implementations.

Compatibility shim pattern:

```ts
export { default } from "@target-app/path/to/module";
export * from "@target-app/path/to/module";
```

For page shims, use default re-export only unless named exports are needed.

## Alias Conventions

Current working convention:

1. `@/*` should be local-first inside extracted apps.
2. Extracted apps may fall back to `../client-web/*` during migration.
3. Cross-app shims require explicit aliases such as:
   - `@seller-web/*`
   - `@admin-web/*`
   - `@client-web/*`

If a shim cannot resolve, fix the app-level `tsconfig.json` path mappings before changing code.

## Compile Gates

Use TypeScript compile gates as the default migration validation.

Commands:

```powershell
npx tsc --noEmit -p apps/client-web/tsconfig.json
npx tsc --noEmit -p apps/seller-web/tsconfig.json
npx tsc --noEmit -p apps/admin-web/tsconfig.json
npx tsc --noEmit -p apps/customer-web/tsconfig.json
```

For multi-app compatibility changes, validate every affected app before stopping.

## Current Migration State

These milestones are already established and should be preserved:

1. `seller-web` exists and compiles.
2. Seller pages were moved to `apps/seller-web` with client-web shims retained.
3. Seller components were moved to `apps/seller-web` with client-web shims retained.
4. Seller Redux was moved into `apps/seller-web/store` with client-web compatibility shims retained.
5. `admin-web` exists and compiles.
6. Admin pages were moved to `apps/admin-web` with client-web shims retained.
7. Admin components were moved to `apps/admin-web/components/AdminComponents` with client-web shims retained.
8. `admin-web`, `seller-web`, and `customer-web` compile independently.

Do not undo these extraction boundaries unless explicitly instructed.

## Backend Service Guidance

Prefer domain-first grouping in the modular monolith before splitting into fine-grained services.

Recommended intermediate service grouping:

```text
services/
  auth-service
  catalog-service      # products + categories + inventory
  order-service
  payment-service      # wallet + payments
  engagement-service   # chat + reviews + notifications
  ai-service
```

Only split further when traffic, ownership, deployment constraints, and extraction-gate criteria justify it.

## Nx Dependency Hygiene

Nx graph quality is a migration gate, not a nice-to-have.

1. Ensure project references and import paths are configured so Nx can detect meaningful edges.
2. Avoid architecture states where every app implicitly depends on `client-web`.
3. If `nx graph` shows no meaningful edges, do not claim architecture health.
4. Fix project configuration and import boundaries before continuing extraction.

## Completion Reporting Standard (Mandatory)

A task is NOT complete until evidence is provided for each item:

1. Files created.
2. Files modified.
3. Files deleted.
4. Why each change was necessary.
5. Folder tree before and after (or explicit limitation if history is unavailable).
6. Imports changed.
7. Commands executed.
8. Terminal output summary with key lines.
9. Lint output.
10. Test output.
11. Build output.
12. Warnings.
13. Skipped tasks.
14. Explicit statement: "Tests are not implemented." when no tests exist.

Never claim "passed" for tests unless actual test files were executed.

## Module Definition of Done

A backend module is not complete unless all checks are true:

1. Routes isolated.
2. Controller isolated.
3. Service isolated.
4. Repository isolated.
5. Validation isolated.
6. DTOs isolated.
7. Types isolated.
8. Tests passing, or explicitly marked as not implemented.
9. Health check passes.
10. No circular imports.
11. Public API exported.
12. No duplicated code.
13. Existing endpoints unchanged.
14. Existing frontend still works.
15. Existing mobile compatibility maintained.

## How To Execute Requests

If asked to analyze:

1. do not edit files
2. produce reports only
3. classify by customer, seller, admin, shared, or backend

If asked to refactor a backend module and no approved analysis report exists yet:

1. do not write production code
2. do not move files
3. do not rename files
4. analyze the module first and wait for approval

Required analysis report sections:

1. current folder structure
2. route map
3. middleware map
4. JWT flow
5. login flow
6. refresh token flow
7. logout flow
8. role permissions
9. dependencies
10. circular dependencies
11. files that belong in the module
12. files that should remain shared
13. risks
14. migration order

If asked to create an app:

1. scaffold or verify the app exists
2. do not move code unless explicitly asked
3. compile the app

If asked to move a slice:

1. move only that slice
2. leave source compatibility shims
3. compile affected apps
4. stop

If asked to extract a package or service:

1. extract one package or one domain only
2. update imports minimally
3. run compile/lint/test/build gates where targets exist
4. if tests or build targets do not exist, report as not implemented
5. stop

## Avoid

1. Massive one-shot migrations
2. Unscoped file reorganizations
3. Renaming public surfaces during extraction unless required
4. Mixing frontend extraction with backend service extraction in one change
5. Removing fallbacks before downstream apps are proven independent

## Preferred Outcome

Every migration task should leave the repository in a state where:

1. the requested slice has a clear owner
2. old call sites still resolve through shims when needed
3. TypeScript passes for affected apps
4. the next migration step can proceed without cleanup debt
