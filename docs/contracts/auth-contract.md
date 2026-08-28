# Auth API Compatibility Contract

Purpose

- This document defines the current auth API behavior that must remain unchanged during Auth Module Refactor Phase 1.
- Scope is documentation only. No source behavior is changed by this file.

Compatibility Rules

- Keep all existing URLs unchanged.
- Keep request and response shapes unchanged.
- Keep JWT payload claims unchanged per endpoint.
- Keep cookie name and expiry behavior unchanged.
- Keep frontend call paths and expectations unchanged.

## Global Auth Surface

Routes (must stay compatible)

- POST /api/auth/admin/login
- POST /api/auth/customer/login
- POST /api/auth/customer/register
- POST /api/auth/customer/oauth
- POST /api/auth/seller/login
- POST /api/auth/seller/register
- GET /api/auth/logout

Cookie behavior

- Cookie name: token
- Set on successful login/register/oauth responses.
- Cleared on logout.

JWT expiration

- 7 days for issued auth JWTs.

Role vocabulary in auth payloads and model usage

- user
- seller
- admin

## Endpoint Contracts

### 1) POST /api/auth/admin/login

Source

- apps/client-web/app/api/auth/admin/login/route.ts

Request body

- email: string
- password: string

Success response

- HTTP 200
- Body:
  - success: true
  - message: "Admin Login successfully"
  - userInfo:
    - id
    - name
    - email
    - role
    - profileImage
  - role
  - token

Error responses

- HTTP 404: { message: "Admin not found" }
- HTTP 401: { message: "Invalid password" }
- HTTP 500: { success: false, message: "Internal Server Error" }

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 7 _ 24 _ 60 \* 60
- path: "/"

JWT payload shape

- id
- email
- name
- role
- profileImage
- exp (derived by expiresIn)

Roles involved

- admin

### 2) POST /api/auth/customer/login

Source

- apps/client-web/app/api/auth/customer/login/route.ts

Request body

- email: string
- password: string

Success response

- HTTP 201
- Body:
  - success: true
  - message: "Customer Login successfully"
  - userInfo:
    - id
    - name
    - email
    - role
    - status
    - customerType
  - token

Error responses

- HTTP 404: { error: "Customer not found" }
- HTTP 401: { error: "Invalid credentials" }
- HTTP 500: { error: "Internal server error" }

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 7 _ 24 _ 60 \* 60
- path: "/"

JWT payload shape

- id
- role
- name
- email
- status
- customerType
- exp (derived by expiresIn)

Roles involved

- user (customer role in this implementation is encoded as user)

### 3) POST /api/auth/customer/register

Source

- apps/client-web/app/api/auth/customer/register/route.ts

Request body

- name: string
- email: string
- password: string
- referredBy: string | undefined
- joiningFee: number | undefined

Success response

- HTTP 201
- Body:
  - success: true
  - message: "User registered successfully"
  - userInfo:
    - id
    - name
    - email
    - role
    - status
    - customerType
    - referredBy
  - token

Error responses

- HTTP 400: { success: false, message: "All fields are required" }
- HTTP 409: { success: false, message: "Email already registered" }
- HTTP 500: { success: false, message: "Server error" }

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 60 _ 60 _ 24 \* 7
- path: "/"

JWT payload shape

- id
- name
- email
- role
- status
- customerType
- exp (derived by expiresIn)

Roles involved

- user

### 4) POST /api/auth/customer/oauth

Source

- apps/client-web/app/api/auth/customer/oauth/route.ts

Request body

- provider: "google" | "facebook"
- token: string

Success response

- HTTP 200
- Body:
  - success: true
  - message: "Login successful"
  - userInfo:
    - id
    - name
    - email
    - role
    - status
    - customerType
    - profileImage
  - token

Error responses

- HTTP 400: { message: "Provider must be google or facebook" }
- HTTP 400: { message: "Invalid Google token" }
- HTTP 400: { message: "Invalid Facebook token" }
- HTTP 400: { message: "Facebook account must have a verified email" }
- HTTP 400: { message: "OAuth authentication failed" } fallback

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 60 _ 60 _ 24 \* 7
- path: "/"

JWT payload shape

- id
- role
- name
- email
- status
- customerType
- exp (derived by expiresIn)

Roles involved

- user

### 5) POST /api/auth/seller/login

Source

- apps/client-web/app/api/auth/seller/login/route.ts

Request body

- email: string
- password: string

Success response

- HTTP 201
- Body:
  - success: true
  - message: "Seller Login successfully"
  - userInfo:
    - id
    - name
    - email
    - role
    - status
    - profileImage
  - token

Error responses

- HTTP 404: { error: "Seller not found" }
- HTTP 401: { error: "Invalid credentials" }
- HTTP 500: { error: "Seller login failed" }

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 7 _ 24 _ 60 \* 60
- path: "/"

JWT payload shape

- id
- role
- name
- email
- profileImage
- status
- exp (derived by expiresIn)

Roles involved

- seller

### 6) POST /api/auth/seller/register

Source

- apps/client-web/app/api/auth/seller/register/route.ts

Request body

- name: string
- email: string
- password: string
- method: string

Success response

- HTTP 201
- Body:
  - success: true
  - message: "Seller registered successfully"
  - userInfo:
    - id
    - name
    - email
    - role
    - status
    - profileImage
  - token

Error responses

- HTTP 400: { error: "All fields are required" }
- HTTP 409: { error: "Seller already exists" }
- HTTP 500: { error: "Seller Register failed" }

Cookie set on success

- token
- httpOnly: true
- secure: process.env.NODE_ENV === "production"
- sameSite: "strict"
- maxAge: 7 _ 24 _ 60 \* 60
- path: "/"

JWT payload shape

- id
- name
- email
- role
- status
- profileImage
- exp (derived by expiresIn)

Roles involved

- seller

### 7) GET /api/auth/logout

Source

- apps/client-web/app/api/auth/logout/route.ts

Query parameters

- role: string | optional

Success response

- HTTP 200
- Body:
  - success: true
  - message: "<Role> logout successful!"

Error responses

- No explicit non-200 branch in current implementation.

Cookie behavior

- token cookie is cleared:
  - value: ""
  - httpOnly: true
  - expires: new Date(0)
  - path: "/"

JWT payload shape

- Not applicable (no new JWT created).

Roles involved

- Accepts role as query-string label only for message formatting.

## Route Compatibility Invariant

The following mapping MUST remain unchanged during Phase 1 refactor:

Frontend:

`/auth/*`

↓

API SDK baseURL:

`/api`

↓

Backend:

`/api/auth/*`

Any change requires explicit approval.

## Frontend Dependencies

Frontend Auth Consumers

Client Web:

- login page
- OAuth buttons
- customer auth state

Seller Web:

- seller auth slice
- seller login flow

Admin:

- admin login flow
- admin auth components

Shared:

- API SDK client
- auth state management

Observed endpoint usage

- POST /auth/admin/login
- POST /auth/seller/register
- POST /auth/seller/login
- POST /auth/customer/register
- POST /auth/customer/login
- POST /auth/customer/oauth
- GET /auth/logout?role={role}

Transport expectations

- Client uses @nasi/api-sdk/client with:
  - baseURL: process.env.NEXT_PUBLIC_API_URL || http://localhost:3000/api
  - withCredentials: true
- The frontend path /auth/_ is translated by the API SDK base URL into backend /api/auth/_ requests.

State expectations in auth flows

- Expects token in response body for login/register/oauth.
- Persists token in localStorage in fulfilled flows where implemented.
- Also relies on cookie-based auth (withCredentials true).

## Known Inconsistencies to Preserve in Phase 1

- Success status codes vary by endpoint (200 for admin login/oauth/logout, 201 for customer/seller login/register).
- Error envelope keys vary (message vs error vs success/message pairs).
- Admin login returns a top-level role field in response; other login/register routes do not.
- Dual token handling exists (cookie + response token consumed by frontend/localStorage).

## Logout Behavior

Logout does not return authentication data.

Success response:

{
message: string
}

Primary logout action:

- Clear token cookie
- Expire session cookie

Frontend token cleanup remains client responsibility.

## Seller Registration Compatibility Note

The registration request accepts:

method

Validation requires the field.

Implementation currently applies a default value during seller creation.

Do not remove this behavior during refactoring.

These inconsistencies are part of the compatibility contract for the upcoming refactor and must not change in Phase 1.
