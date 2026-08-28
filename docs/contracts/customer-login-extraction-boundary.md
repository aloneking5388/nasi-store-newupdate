# Customer Login Extraction Boundary

Purpose

- Define the exact customer login boundary before any extraction work begins.
- This document is analysis only and does not change runtime behavior.

## Current Owner

- apps/client-web/app/api/auth/customer/login/route.ts

## Future Owner

- services/auth-service/src/modules/auth

## Current Flow

1. Receive POST request.
2. Read email and password from request body.
3. Connect to database.
4. Load customer record by email.
5. Compare passwords with bcrypt.
6. Sign JWT.
7. Create JSON response.
8. Set token cookie.
9. Return response.

## Database Dependencies

- User model
- connectDB helper
- Password field must be selected explicitly with `.select("+password")`

## Validation Rules

- Email and password are required by the request contract.
- The implementation does not perform additional field validation before lookup.

## Password Verification

- bcrypt.compare(password, customer.password)
- Failure returns HTTP 401 with `Invalid credentials`.

## JWT Payload

- id
- role
- name
- email
- status
- customerType
- expires in 7 days

## Cookie Behavior

- Cookie name: token
- httpOnly: true
- secure: production only
- sameSite: strict
- maxAge: 7 days
- path: /

## Response Contract

Success response

```json
{
  "success": true,
  "message": "Customer Login successfully",
  "userInfo": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    "status": "...",
    "customerType": "..."
  },
  "token": "..."
}
```

Error responses

- 404: `{ error: "Customer not found" }`
- 401: `{ error: "Invalid credentials" }`
- 500: `{ error: "Internal server error" }`

## Hidden Side Effects

- No explicit side effects were found in the current implementation.
- No updates to last login, status, wallet, subscription, or referral state were observed in this route.
- If extraction uncovers shared helpers with side effects, they must be documented before moving code.

## Files Required for Extraction

- services/auth-service/src/modules/auth/controllers/customer-login.controller.js or .ts
- services/auth-service/src/modules/auth/services/customer-login.service.js or .ts
- apps/client-web/app/api/auth/customer/login/route.ts

## Risks

- Customer record shape and role/customerType claim generation must remain unchanged.
- Token and cookie handling must stay compatible with existing frontend auth flows.
- Any hidden dependency in User model or resolveCustomerType helper must be preserved.
- Response status code and envelope shape must remain stable.

## Notes

- This boundary intentionally avoids extraction decisions.
- It only records the current behavior and the files likely needed for a future move.
