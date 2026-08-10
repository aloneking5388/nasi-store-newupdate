# Customer Registration Ownership Decision

Purpose
- Define ownership for the current customer registration flow before any extraction plan or code movement begins.
- This document is analysis only. No runtime behavior changes are made here.

## Source of Truth
Current entrypoint
- apps/client-web/app/api/auth/customer/register/route.ts

Current helper dependencies
- apps/client-web/utils/subscriptionEnrollment.ts
- packages/validation/src/subscription.ts
- apps/client-web/utils/mlmUtils.ts
- apps/client-web/lib/registerHelper.ts
- apps/client-web/models/User.ts
- apps/client-web/utils/customerType.ts
- apps/client-web/utils/ConnectDB.ts
- apps/seller-web/store/Auth/authSlice.ts

## Current Flow Summary
1. Accept registration request.
2. Validate required fields.
3. Check email uniqueness.
4. Hash password.
5. Generate referral code.
6. Optionally validate subscription entry.
7. Create and save user.
8. Optionally apply subscription enrollment.
9. Send registration email.
10. Generate JWT.
11. Set auth cookie.
12. Return auth response.

## Ownership Decision

### Auth-owned
These operations belong to authentication or identity bootstrap and are valid candidates for eventual auth-service ownership.

1. Request parsing and required-field validation
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: checks `name`, `email`, `password`
- Ownership decision: Auth
- Reason: This is part of accepting an authentication/identity request.

2. Existing-user check by email
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `User.findOne({ email })`
- Ownership decision: Auth
- Reason: Identity uniqueness is part of account creation.

3. Password hashing
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `bcrypt.hash(password, 10)`
- Ownership decision: Auth
- Reason: Credential handling belongs to auth.

4. Initial identity creation
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `new User({...})` with baseline auth/account fields
- Ownership decision: Auth
- Reason: The first user record creation is part of establishing identity.

5. JWT generation
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `jwt.sign(...)`
- Ownership decision: Auth
- Reason: Token issuance belongs to auth.

6. Auth cookie creation
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `data.cookies.set("token", token, ...)`
- Ownership decision: Auth
- Reason: Session/auth cookie handling belongs to auth.

7. Final auth response shape
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `{ success, message, userInfo, token }`
- Ownership decision: Auth
- Reason: The endpoint contract is the auth API surface.

### Customer / Referral Domain-owned
These operations are not purely authentication. They should not be absorbed into auth-service without an explicit domain decision.

1. Referral code business rule usage
- Current location: apps/client-web/app/api/auth/customer/register/route.ts
- Current function/behavior: `normalizedReferral`, `isSubscriptionSignup`
- Ownership decision: Customer/Referral domain
- Reason: Referral participation is business-domain behavior, not credential handling.

2. Subscription eligibility validation
- Current location: packages/validation/src/subscription.ts
- Current function/behavior: `validateSubscriptionEntry(referralCode, joiningFee)`
- Ownership decision: Customer/Referral domain
- Reason: This enforces referral code validity, joining-fee policy, and referral limits.

3. Subscription enrollment mutation
- Current location: apps/client-web/utils/subscriptionEnrollment.ts
- Current function/behavior: `applySubscriptionEnrollment(user, referrer)`
- Ownership decision: Customer/Referral domain
- Reason: This mutates customer status, investment state, referral linkage, and downline state.

4. Referrer downline updates
- Current location: apps/client-web/utils/subscriptionEnrollment.ts
- Current function/behavior: pushes into `referrer.downline`, updates `referralCount`
- Ownership decision: Customer/Referral domain
- Reason: This is MLM/referral graph maintenance.

5. Upline assignment
- Current location: apps/client-web/utils/mlmUtils.ts
- Current function/behavior: `assignUplines(newUserId, referrerId)`
- Ownership decision: Customer/Referral domain
- Reason: This is MLM structure logic, not auth logic.

6. Joining-fee policy
- Current location: packages/constants/src/subscription.ts
- Current function/behavior: `SUBSCRIPTION_JOINING_FEE`
- Ownership decision: Customer/Referral domain
- Reason: Pricing/policy rules are domain-owned.

7. Customer subscription state projection
- Current location: apps/client-web/utils/subscriptionEnrollment.ts and apps/client-web/utils/customerType.ts
- Current function/behavior: sets `customerType`, `invested`, `status`, `referredBy`
- Ownership decision: Customer/Referral domain
- Reason: These fields represent subscription/referral state, not just auth state.

### Infrastructure-owned
These operations are cross-cutting and should remain infrastructure concerns even if called from auth or customer flows.

1. Registration email delivery
- Current location: apps/client-web/lib/registerHelper.ts
- Current function/behavior: `sendRegisterSuccessEmail(email, name)`
- Ownership decision: Infrastructure
- Reason: External email delivery and template rendering are infrastructure concerns.

2. Template rendering and email provider integration
- Current location: apps/client-web/lib/registerHelper.ts
- Current function/behavior: Resend + EJS + filesystem template loading
- Ownership decision: Infrastructure
- Reason: This is delivery plumbing, not domain logic.

## Boundary Recommendation
Customer registration should not be moved as one block into auth-service.

Recommended split for future implementation:
1. Auth handles:
- credential validation
- password hashing
- initial identity creation
- JWT issuance
- cookie issuance
- final auth response

2. Customer/Referral domain handles:
- subscription signup decision
- referral validation
- joining-fee policy
- enrollment mutations
- downline/upline/referral-count side effects

3. Infrastructure handles:
- registration email dispatch

## Current Coupling Risks
- The route currently creates the user before enrollment side effects run, which means domain side effects are sequenced after identity creation.
- The route currently collapses helper failures into a generic 500 response, so extraction must preserve that behavior unless explicitly approved otherwise.
- Auth-service should not become the long-term owner of MLM graph mutation just because registration triggers it.

## Required Next Step
Before implementation planning, produce a customer-registration extraction plan that explicitly states:
- which auth-owned functions move
- which customer/referral-domain functions stay outside auth-service
- how auth-service calls or delegates domain behavior
- how current error behavior and side-effect ordering are preserved
