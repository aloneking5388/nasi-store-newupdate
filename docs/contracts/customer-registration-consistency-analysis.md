# Customer Registration Consistency Analysis

Purpose
- Validate the customer registration delegation design against actual persistence and consistency behavior before treating the extraction as approved.
- This is an analysis artifact only. It does not approve new runtime behavior by itself.

## Inputs
- docs/contracts/customer-register-extraction-boundary.md
- docs/contracts/customer-registration-ownership.md
- docs/contracts/customer-registration-delegation-design.md
- docs/migration/customer-registration-implementation-plan.md

## Current Persistence Flow
Observed registration sequence:
1. Validate required fields.
2. Check email uniqueness.
3. Hash password.
4. Create and persist the new user.
5. If referral/subscription signup is requested:
   - validate referral code and joining fee
   - mutate the new user subscription fields
   - mutate the referrer downline/referral count
   - assign uplines through additional user update
6. Send registration email.
7. Generate JWT.
8. Set auth cookie and return response.

## Evidence From Current Code
Primary write steps are currently split across these files:
- apps/client-web/app/api/auth/customer/register/route.ts
- apps/client-web/utils/subscriptionEnrollment.ts
- apps/client-web/utils/mlmUtils.ts
- packages/validation/src/subscription.ts

Observed write operations:
1. Initial identity persistence
- `newUser.save()` or equivalent insert operation for the new user.

2. Subscription enrollment mutation
- `user.save()` after setting:
  - `customerType = "subscription"`
  - `referredBy = referrer._id`
  - `invested = SUBSCRIPTION_JOINING_FEE`
  - `status = "pending"`

3. Referrer mutation
- `referrer.save()` after:
  - appending the new user to `downline`
  - incrementing `referralCount`

4. Upline assignment mutation
- `User.findByIdAndUpdate(newUserId, { uplines })`

These are separate writes, not one atomic commit.

## Transaction Boundary Check
Observed result
- No MongoDB session handling was found in the registration path.
- No `startSession()` or `withTransaction()` usage was found in the relevant customer registration files.
- No compensating delete/update logic was found for failed downstream steps.

Conclusion
- Current customer registration behavior is non-transactional.
- Persistence semantics today allow partial completion.

## Current Partial-Failure Semantics
### Case A: User created, enrollment fails
Possible persisted state
- New user may already exist.
- User may remain a normal active user if enrollment failed before mutation.
- If failure occurs mid-enrollment, some related customer/referrer state may already be written.

HTTP result today
- Generic `500 { "success": false, "message": "Server error" }`

Consistency implication
- HTTP failure does not guarantee no persistence occurred.

### Case B: User created, enrollment succeeds, email fails
Possible persisted state
- New user exists.
- Subscription/referral state may already be applied.
- Downline/referral count/uplines may already be updated.
- Email may be missing.

HTTP result today
- Depends on helper execution path.
- Under throwing email failure, request returns generic 500.
- Under missing-key/no-op email path, registration remains successful.

Consistency implication
- The same logical registration may be persisted even when the HTTP request reports failure.

### Case C: User created, enrollment succeeds, JWT or cookie creation fails
Possible persisted state
- Identity and referral/domain side effects remain persisted.
- Client may receive failure even though account creation has already occurred.

HTTP result today
- Generic 500 on thrown failure path.

Consistency implication
- Response delivery is not a transaction boundary for persisted state.

## Idempotency Assessment
Observed result
- No idempotency key or replay protection was found.
- Retry after a partial-failure response can collide with the existing email uniqueness constraint.

Effect
- A client retry after an internal failure may receive `409 Email already registered` even if the original request looked failed from the client perspective.

Interpretation
- This is consistent with the current non-transactional model, but it must be treated as intentional compatibility behavior during extraction.

## Retry Behavior Assessment
Observed result
- No compensating retry workflow was found for:
  - incomplete enrollment
  - missed email send
  - failed JWT/cookie stage

Effect
- Recovery currently depends on manual follow-up or a second user action, not automatic reconciliation.

## Extraction Risk
Moving registration into an auth-service orchestration path can accidentally change consistency semantics in three ways:
1. Converting domain helper failures into early exits before user creation.
2. Introducing implicit rollback or cleanup that the current system does not perform.
3. Changing which side effects occur before the generic 500 response is emitted.

Any of those would change behavior even if the HTTP envelope stayed the same.

## Approval Constraint For Runtime Extraction
The registration extraction is only behaviorally safe if it preserves all of the following:
1. User creation still occurs before delegated domain side effects.
2. Domain side effects still occur before email.
3. Email still occurs before JWT/cookie.
4. Failures after persistence do not silently gain rollback behavior.
5. Generic 500 mapping remains unchanged for delegated domain failures.
6. Client retry behavior remains compatible with existing duplicate-email outcomes.

## Recommended Policy
For this phase, treat the following as the binding compatibility policy:
1. No Mongo transaction introduction.
2. No compensation delete/update workflow.
3. No idempotency-key introduction.
4. No normalization of partial-failure semantics.
5. Explicitly document that HTTP failure may coexist with persisted registration state.

## Decision
This analysis confirms that the main remaining risk is not the HTTP contract. It is persistence consistency across multi-step, cross-domain side effects.

Therefore:
- Customer registration should not be considered fully approved for production migration solely because its adapter and response contract work.
- The extraction must be evaluated against this non-transactional consistency model before being treated as complete.
- If the team wants stronger semantics later, that should be a separate approved change, not an incidental side effect of auth extraction.

## Current Repository State Note
The repository may already contain a partial or experimental registration extraction slice. This analysis does not retroactively approve any semantic change beyond the documented compatibility model above.
