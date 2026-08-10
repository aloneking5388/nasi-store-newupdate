# Customer Register Extraction Boundary

Purpose
- Define the current customer registration behavior and the extraction risks before any implementation work begins.
- This document is analysis only. No runtime behavior changes are made here.

## Current Owner
- apps/client-web/app/api/auth/customer/register/route.ts

## Future Candidate Owner
- services/auth-service/src/modules/auth

## Current Flow
1. Receive POST request.
2. Connect to database.
3. Read `name`, `email`, `password`, `referredBy`, and `joiningFee`.
4. Validate required fields: `name`, `email`, `password`.
5. Check for existing user by email.
6. Hash password with bcrypt.
7. Generate referral code.
8. Detect subscription signup from `referredBy`.
9. Validate referral code and joining fee when subscription signup is requested.
10. Create and save the new user.
11. If subscription signup, mutate the new user and referrer through enrollment logic.
12. Send registration success email.
13. Sign JWT.
14. Return response and set token cookie.

## Request Contract
Frontend payload source
- apps/seller-web/store/Auth/authSlice.ts

Effective request body
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "referredBy": "string",
  "joiningFee": 0
}
```

Notes
- Frontend sends `referralCode`; route receives it as `referredBy` after mapping in the auth slice.
- `joiningFee` is converted to a number before the request is sent.

## Success Response Contract
HTTP status
- 201

Response body
```json
{
  "success": true,
  "message": "User registered successfully",
  "userInfo": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    "status": "...",
    "customerType": "...",
    "referredBy": null
  },
  "token": "..."
}
```

## Error Response Contract
- 400: `{ "success": false, "message": "All fields are required" }`
- 409: `{ "success": false, "message": "Email already registered" }`
- 500: `{ "success": false, "message": "Server error" }`

Important side-effect caveat
- Referral validation and enrollment helpers throw additional errors such as invalid referral code or incorrect joining fee.
- The current route catches those and returns the generic 500 response, not a domain-specific validation response.

## JWT Contract
Claims
- id
- name
- email
- role
- status
- customerType

JWT settings
- Secret source: `process.env.JWT_SECRET`
- Expiry: `7d`
- Algorithm: current jsonwebtoken default (`HS256`)

## Cookie Contract
- Cookie name: `token`
- httpOnly: true
- secure: `process.env.NODE_ENV === "production"`
- sameSite: `strict`
- maxAge: 60 * 60 * 24 * 7
- path: `/`

## Database Dependencies
- User model
- connectDB helper
- `validateSubscriptionEntry`
- `applySubscriptionEnrollment`
- `assignUplines` through enrollment logic
- `SUBSCRIPTION_JOINING_FEE`

## Hidden Side Effects
Observed side effects beyond authentication:
- Creates a new user record.
- Generates and persists a referral code.
- For subscription signup:
  - changes `customerType` to `subscription`
  - sets `referredBy`
  - sets `invested`
  - changes `status` from `active` to `pending`
  - updates referrer downline
  - increments referrer referral count
  - assigns uplines recursively
- Sends registration success email through Resend/EJS template rendering.

## Boundary Risk Assessment
Authentication-adjacent concerns
- password hashing
- user creation bootstrap
- JWT creation
- cookie creation
- final auth response

Non-auth domain concerns that need an explicit ownership decision before extraction
- subscription/referral validation
- subscription enrollment mutation
- downline and upline graph updates
- referral count updates
- joining-fee policy
- registration success email

## Files Required For Any Extraction Plan
Likely adapter and auth-service files
- services/auth-service/src/modules/auth/controllers/customer-register.controller.js or .ts
- services/auth-service/src/modules/auth/services/customer-register.service.js or .ts
- apps/client-web/app/api/auth/customer/register/route.ts

Existing dependencies that must be evaluated before moving
- apps/client-web/utils/subscriptionEnrollment.ts
- packages/validation/src/subscription.ts
- apps/client-web/utils/mlmUtils.ts
- apps/client-web/lib/registerHelper.ts
- apps/client-web/models/User.ts

## Key Risks
- Auth extraction could incorrectly absorb referral and MLM domain behavior.
- Subscription enrollment currently changes persisted user state after initial save.
- Error semantics may be unintentionally improved or normalized during extraction, which would break compatibility.
- Email sending is currently inline in the auth route and may not belong in the auth module long term.

## Recommendation
Do not move customer registration directly into auth-service until the ownership of referral, subscription enrollment, and registration email side effects is explicitly decided.

Recommended next step
- Create a customer registration ownership decision note or implementation plan that separates:
  - auth-owned steps
  - customer/referral-domain-owned steps
  - cross-cutting infrastructure steps
