# Customer Registration Delegation Design

Purpose

- Define how auth registration delegates non-auth concerns without transferring customer/referral or infrastructure ownership into auth-service.
- This is a design artifact only. No runtime code changes are made here.

Inputs

- docs/contracts/customer-registration-ownership.md
- docs/contracts/customer-register-extraction-boundary.md

## Design Objective

Keep `POST /api/auth/customer/register` externally stable while ensuring:

1. Auth module owns only authentication-adjacent behavior.
2. Customer/referral module owns subscription and MLM side effects.
3. Infrastructure layer owns email delivery.

## Target Runtime Shape

1. Next.js route remains compatibility adapter.
2. Adapter forwards request to auth-service registration controller.
3. Auth registration service performs auth-owned steps.
4. Auth registration service delegates domain side effects via explicit boundary call.
5. Auth registration service delegates email dispatch via infrastructure boundary call.
6. Auth registration service returns current response contract unchanged.

## Boundary Contracts

### A) Auth Registration Input Contract

Input (from adapter to auth service)

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "referredBy": "string",
  "joiningFee": 0
}
```

Auth-owned preconditions

- `name`, `email`, and `password` are required.
- Email must be unique.

### B) Domain Delegation Contract (Customer/Referral)

This boundary is a call from auth-owned registration flow to customer/referral-owned behavior.

Proposed call shape

```json
{
  "userId": "ObjectId",
  "referredBy": "string",
  "joiningFee": 0
}
```

Possible outcomes

1. `NO_OP`

- Meaning: no subscription/referral enrollment requested.
- Side effects: none.

2. `ENROLLED`

- Meaning: subscription/referral enrollment applied.
- Side effects (domain-owned):
  - user subscription state mutation
  - referrer downline/referral count mutation
  - upline assignment

3. `DOMAIN_REJECTED`

- Meaning: referral/joining-fee/domain rule failure.
- Current compatibility requirement: surface as generic 500 `Server error` at endpoint level.

Non-negotiable ownership rule

- Auth service triggers this boundary call but does not own or reimplement domain logic internals.

### C) Infrastructure Delegation Contract (Email)

Call shape

```json
{
  "type": "registration_success",
  "email": "string",
  "name": "string"
}
```

Expected behavior

- Best-effort send consistent with current helper behavior.
- Missing email provider credentials must not break registration flow.

## Error Mapping Rules (Compatibility First)

Current endpoint contract must remain:

- 400: `All fields are required`
- 409: `Email already registered`
- 500: `Server error`

Delegation mapping

- Any domain delegation failure currently maps to generic 500.
- Any infrastructure/email failure currently maps to existing behavior (warning/skip where applicable).
- No error normalization in this phase.

## Side-Effect Ordering Guarantee

Current order to preserve:

1. Create and save user.
2. Apply domain enrollment side effects if requested.
3. Send registration email.
4. Issue JWT and cookie.
5. Return response.

Why this ordering matters

- Existing behavior and persisted state transitions depend on this sequence.
- Reordering may alter failure semantics and user status transitions.

## Transaction and Failure Semantics (Current State)

- Current implementation is not fully transactional across identity creation + domain side effects + email.
- Design must preserve current semantics unless explicitly approved to change.

Accepted current behavior to preserve

- Domain helper errors result in generic 500 response.
- Email helper may no-op when API key is missing.

## Responsibility Matrix

Auth-owned

- required field validation
- unique email check
- password hashing
- initial user creation
- JWT generation
- auth cookie generation
- final auth response

Customer/referral-domain-owned

- referral code policy checks
- joining-fee policy checks
- subscription enrollment mutation
- downline/referral-count updates
- upline assignment

Infrastructure-owned

- registration email template rendering and delivery

## Test Obligations For Future Implementation

Before merge

1. contract-level tests for status/body/cookie parity
2. side-effect ordering verification
3. referral and joining-fee failure path verification (still maps to 500)
4. smoke tests through auth-service and through Next.js adapter
5. logout and customer-login regression checks

## Rollback Requirement

Rollback must restore:

1. Next.js customer register direct implementation path.
2. Previous ownership behavior and side-effect ordering.
3. Existing response and cookie contract.

## Approval Gate For Implementation Plan

An implementation plan may proceed only if it explicitly includes:

1. exact files to create/modify
2. explicit delegation call boundary and payloads
3. preserved error and side-effect semantics
4. compatibility assertions for JWT/cookie/response
5. rollback steps and verification checklist
