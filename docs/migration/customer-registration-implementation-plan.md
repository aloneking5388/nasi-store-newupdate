# Customer Registration Implementation Plan

Purpose
- Define the implementation plan for extracting `POST /api/auth/customer/register` into the auth-service orchestration path while preserving the established contracts.
- This is planning only. No runtime code changes are included in this artifact.

## Governing Inputs (Authoritative)
1. [docs/contracts/customer-register-extraction-boundary.md](../contracts/customer-register-extraction-boundary.md)
2. [docs/contracts/customer-registration-ownership.md](../contracts/customer-registration-ownership.md)
3. [docs/contracts/customer-registration-delegation-design.md](../contracts/customer-registration-delegation-design.md)

## Scope Decision
In scope
- Extract only `POST /api/auth/customer/register` execution path to auth-service orchestration.
- Keep Next.js route as compatibility adapter.
- Preserve response and cookie contract.
- Preserve current failure semantics unless explicitly approved to change.

Out of scope
- Re-architecting referral/MLM/subscription logic ownership.
- Returning new domain-specific validation responses.
- Introducing new customer-domain persistence schema changes.
- Removing compatibility adapter.

## Architectural Contract To Obey
Target responsibility remains:
1. Next.js compatibility adapter receives request.
2. Auth registration orchestrator handles auth-owned concerns.
3. Auth registration orchestrator delegates customer/referral side effects via boundary call.
4. Auth registration orchestrator delegates infrastructure email operation via boundary call.

Non-negotiable anti-pattern
- Do not expand auth-service into direct owner of referral, MLM, subscription, or email internals.

## Current Compatibility Contract (Must Remain)
Request body
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "referredBy": "string",
  "joiningFee": 0
}
```

Status and error envelopes
- `201`: success response with `success`, `message`, `userInfo`, `token`
- `400`: `{ "success": false, "message": "All fields are required" }`
- `409`: `{ "success": false, "message": "Email already registered" }`
- `500`: `{ "success": false, "message": "Server error" }`

JWT/cookie invariants
- Token claim keys remain unchanged.
- Expiry remains unchanged (`7d`).
- Cookie name/attributes remain unchanged.

## Planned Ownership-Preserving Design Realization
Auth-owned execution steps
1. Parse and validate required fields.
2. Check email uniqueness.
3. Hash password.
4. Create and persist initial user identity.
5. Issue JWT and auth cookie.
6. Return auth response envelope.

Delegated customer/referral operation
- Auth calls a domain boundary function with:
```json
{
  "userId": "ObjectId",
  "referredBy": "string",
  "joiningFee": 0
}
```
- Domain boundary owns referral and enrollment internals.

Delegated infrastructure operation
- Auth calls infrastructure boundary function with:
```json
{
  "type": "registration_success",
  "email": "string",
  "name": "string"
}
```
- Infrastructure owns provider/template internals.

## Side-Effect Ordering (Must Preserve)
Ordered sequence:
1. Create user.
2. Execute domain enrollment side effects (if requested).
3. Execute email dispatch operation.
4. Issue JWT/cookie.
5. Return response.

Rationale
- This order is a compatibility commitment from the delegation design and ownership documents.

## Failure and Rollback Matrix (Required)
The matrix below defines expected behavior for implementation, verification, and regression checks.

| Step | Outcome | Expected API Result | Persisted State Expectation | Compensation / Rollback Rule |
|---|---|---|---|---|
| Required-field validation | Fail | `400` `All fields are required` | No user created | No compensation required |
| Email uniqueness check | Fail | `409` `Email already registered` | No user created | No compensation required |
| Create user | Fail | `500` `Server error` | No new user or partial write per DB error | No compensation in this phase |
| Create user succeeds, domain enrollment fails | Fail | `500` `Server error` | Newly created user may remain persisted; enrollment side effects may be absent/partial depending on domain helper boundary | Preserve current non-transactional behavior. Do not add implicit deletes/rollbacks without explicit approval |
| Create user succeeds, domain enrollment succeeds, email fails hard | Decision required by current helper semantics: default preserve success when email is best-effort, otherwise `500` if helper throws and current path maps to server error | State from create + enrollment remains persisted | Preserve current helper semantics exactly. No new compensation unless approved |
| Create user succeeds, domain enrollment succeeds, email skipped (missing provider key) | `201` success | State from create + enrollment remains persisted | Explicitly tolerated partial infrastructure execution (current behavior) |
| JWT generation fails after prior steps succeed | `500` `Server error` | User and prior side effects remain persisted | Preserve current behavior; no compensating rollback in this phase |
| Cookie set fails at response boundary | `500` or framework error mapping consistent with current behavior | User and prior side effects remain persisted | Preserve current behavior; do not introduce state rollback |

Required implementation-plan conclusion for matrix
- This phase preserves current semantics, including tolerated partial-failure states.
- Introducing DB transactionality or compensating workflows is explicitly deferred unless separately approved.

## Explicit Decision Recording Needed Before Coding
Before implementation starts, the implementer must confirm in the execution ledger:
1. Whether email failure is treated as best-effort success or hard failure under current code path.
2. If hard failure exists in specific email error branches, verify that branch remains mapped to generic `500`.
3. No new compensation behavior is introduced silently.

## File-Level Change Plan (Planned, Not Applied)
Planned files to create
1. `services/auth-service/src/modules/auth/controllers/customer-register.controller.js`
2. `services/auth-service/src/modules/auth/services/customer-register.service.js`

Planned files to modify
1. `services/auth-service/src/index.js`
2. `apps/client-web/app/api/auth/customer/register/route.ts`

Planned dependency touchpoints (evaluation only)
1. `apps/client-web/utils/subscriptionEnrollment.ts`
2. `packages/validation/src/subscription.ts`
3. `apps/client-web/utils/mlmUtils.ts`
4. `apps/client-web/lib/registerHelper.ts`

File-scope rule
- Any additional file beyond this list requires explicit scope update before implementation.

## Endpoint Adapter Strategy
1. Keep `apps/client-web/app/api/auth/customer/register/route.ts` as compatibility adapter.
2. Forward request payload to auth-service endpoint.
3. Pass through status/body/content-type/set-cookie without contract drift.
4. Keep frontend call sites unchanged.

## Verification Plan (Post-Implementation)
Contract parity checks
1. Success path returns same HTTP status and response shape.
2. Error paths preserve current 400/409/500 semantics and message text.
3. JWT claims and expiry remain unchanged.
4. Cookie attributes remain unchanged.

Failure-semantics checks
1. Simulate domain enrollment failure after user creation and verify matrix behavior.
2. Simulate email provider unavailable/missing-key behavior and verify matrix behavior.
3. Simulate token-generation failure and verify no unapproved compensation occurs.

Adapter and direct-path checks
1. Validate auth-service direct endpoint behavior.
2. Validate Next.js adapter parity against direct endpoint.

Regression checks
1. Re-run logout verification.
2. Re-run customer-login verification.
3. Re-run shared auth utility tests.

## Rollback Plan (If Verification Fails)
1. Restore `apps/client-web/app/api/auth/customer/register/route.ts` to direct implementation.
2. Remove register dispatch wiring from `services/auth-service/src/index.js`.
3. Remove created register controller/service files.
4. Re-run registration smoke baseline through legacy route.
5. Re-run logout and customer-login checks to ensure no collateral regression.

## Approval Gate Checklist
Implementation may start only after explicit approval that this plan satisfies:
1. Ownership boundaries preserved.
2. Delegation boundaries explicit.
3. Failure/rollback matrix accepted.
4. File-scope list accepted.
5. Verification and rollback steps accepted.
