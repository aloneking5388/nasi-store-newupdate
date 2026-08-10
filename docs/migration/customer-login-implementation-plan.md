# Customer Login Extraction Implementation Plan

Purpose
- Plan the first business-logic extraction after logout.
- Keep runtime behavior unchanged while moving customer login into the auth-service boundary.
- This document is planning only. No source code is modified here.

## Inputs
- [docs/contracts/customer-login-extraction-boundary.md](../contracts/customer-login-extraction-boundary.md)
- [docs/contracts/auth-contract.md](../contracts/auth-contract.md)
- [docs/contracts/auth-extraction-boundary.md](../contracts/auth-extraction-boundary.md)
- [services/auth-service/docs/auth-boundary-map.md](../../services/auth-service/docs/auth-boundary-map.md)
- [docs/migration/auth-extraction-log.md](auth-extraction-log.md)

## Goal
Move only POST /api/auth/customer/login into the auth-service path while preserving:
- request shape
- response shape
- JWT claims
- cookie behavior
- status codes
- error envelopes
- frontend call sites

## Current Flow
1. Client sends POST /api/auth/customer/login.
2. Next.js route in apps/client-web handles the request.
3. Route connects to MongoDB.
4. Route loads the User record by email.
5. Route compares password with bcrypt.
6. Route signs JWT directly.
7. Route returns JSON response and sets token cookie.
8. Frontend auth slice consumes token from response and cookie.

## Future Flow
1. Client sends POST /api/auth/customer/login.
2. Next.js route remains the compatibility adapter.
3. Request reaches auth-service.
4. auth-service routes the request to customer-login controller.
5. Controller delegates business logic to customer-login service.
6. Service performs database lookup, password verification, and token creation.
7. Controller returns the same JSON response and cookie.
8. Frontend behavior remains unchanged.

## JWT Compatibility Strategy
- Use the same JWT secret source: process.env.JWT_SECRET.
- Preserve the same expiry: 7d.
- Preserve the same payload keys:
  - id
  - role
  - name
  - email
  - status
  - customerType
- Preserve token placement in the response body and token cookie.
- Do not alter token format, signing algorithm, or claim naming.
- Do not introduce refresh tokens.

## Database Dependency Handling
- Keep the same User model.
- Keep the same connectDB helper.
- Keep the `.select("+password")` behavior so bcrypt comparison still works.
- Do not change the User schema or validation rules in this extraction.
- Treat resolveCustomerType as a required dependency because it contributes to token and response payloads.

## Error Response Preservation
- 404 must remain `{ error: "Customer not found" }`.
- 401 must remain `{ error: "Invalid credentials" }`.
- 500 must remain `{ error: "Internal server error" }`.
- Success message must remain `Customer Login successfully`.
- Response status code must remain 201.

## Cookie Preservation
- Preserve cookie name: token.
- Preserve httpOnly: true.
- Preserve secure behavior tied to NODE_ENV === "production".
- Preserve sameSite: strict.
- Preserve maxAge of 7 days.
- Preserve path: /.
- Do not add or rename cookies.

## Hidden Side Effects
- No side effects were observed in the current customer login route.
- No last-login update, wallet mutation, subscription mutation, or referral update was found in the current implementation.
- If shared helpers introduce side effects later, they must be analyzed before extraction lands.

## Exact Files To Create
- services/auth-service/src/modules/auth/controllers/customer-login.controller.js
- services/auth-service/src/modules/auth/services/customer-login.service.js

## Exact Files To Modify
- services/auth-service/src/index.js
- apps/client-web/app/api/auth/customer/login/route.ts

## Planned Responsibility Split
### Controller
- Read request data.
- Call service.
- Format HTTP response.
- Attach cookie.

### Service
- Connect to database.
- Load customer by email.
- Verify password.
- Build token payload.
- Create JWT.
- Return normalized result to controller.

## Rollback Procedure
1. Restore apps/client-web/app/api/auth/customer/login/route.ts to the existing direct implementation.
2. Remove the customer-login dispatch from services/auth-service/src/index.js.
3. Delete the new customer-login controller and service files.
4. Re-run the customer login smoke test against the old route.

## Testing Plan
### Baseline checks before change
- Confirm current route still returns 201 for valid login.
- Confirm token cookie is set.
- Confirm response contains success, message, userInfo, and token.
- Confirm invalid password returns 401.
- Confirm unknown email returns 404.

### Post-change checks
- Verify POST /api/auth/customer/login still returns the same response body.
- Verify token cookie is still set with the same attributes.
- Verify token claims still decode to the same keys.
- Verify frontend auth slice continues to consume the response without changes.

### Manual smoke test
1. Submit valid customer credentials.
2. Confirm token cookie exists.
3. Confirm response body is unchanged.
4. Submit invalid password.
5. Confirm 401 and error envelope remain unchanged.
6. Submit unknown email.
7. Confirm 404 and error envelope remain unchanged.

## Implementation Notes
- Keep the Next.js route as a compatibility adapter during the extraction.
- Keep all other auth endpoints unchanged.
- Do not introduce extra abstraction layers unless the implementation proves they are needed.
- Do not move customer register, seller, admin, or OAuth code in this step.

## Decision Summary
This plan intentionally limits the first business-logic extraction to customer login only. It preserves the current contract while establishing the auth-service as the owner of the business logic path.
