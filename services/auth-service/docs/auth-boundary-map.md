# Auth Ownership Boundary Map

Purpose

- Document the current ownership of auth endpoints before any extraction work begins.
- This file is documentation only. No runtime behavior changes are made here.

## Endpoint Ownership Map

### POST /api/auth/admin/login

- Current implementation location: apps/client-web/app/api/auth/admin/login/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Not migrated
- Dependencies: Admin model, DB connection, bcrypt, JWT, client auth slice
- Extraction risks: Response shape and status code must remain compatible.

### POST /api/auth/customer/login

- Current implementation location: apps/client-web/app/api/auth/customer/login/route.ts
- Current owner: services/auth-service/src/modules/auth
- Future owner: services/auth-service/src/modules/auth
- Migration status: Completed
- Verification: PASS
- Dependencies: User model, DB connection, bcrypt, JWT, customer type helper, client auth slice
- Extraction risks: Must preserve token payload, cookie behavior, and response envelope.

### POST /api/auth/customer/register

- Current implementation location: apps/client-web/app/api/auth/customer/register/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Not migrated
- Dependencies: User model, DB connection, bcrypt, JWT, referral and subscription helpers, email helper, validation package
- Extraction risks: Registration side effects and referral logic must remain intact.

### POST /api/auth/customer/oauth

- Current implementation location: apps/client-web/app/api/auth/customer/oauth/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Not migrated
- Dependencies: User model, DB connection, OAuth provider verification, JWT, customer type helper, client auth slice
- Extraction risks: External provider verification and profile-image behavior must remain compatible.

### POST /api/auth/seller/login

- Current implementation location: apps/client-web/app/api/auth/seller/login/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Not migrated
- Dependencies: Seller model, DB connection, bcrypt, JWT, client auth slice
- Extraction risks: Preserve status, cookie, and token semantics.

### POST /api/auth/seller/register

- Current implementation location: apps/client-web/app/api/auth/seller/register/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Not migrated
- Dependencies: Seller model, DB connection, bcrypt, JWT, seller method handling, client auth slice
- Extraction risks: Keep method validation/default behavior and response format stable.

### GET /api/auth/logout

- Current implementation location: apps/client-web/app/api/auth/logout/route.ts
- Current owner: apps/client-web
- Future owner: services/auth-service/src/modules/auth
- Migration status: Completed
- Verification: PASS
- Dependencies: Query-string role label, token cookie clearing, client logout state cleanup
- Extraction risks: Logout must remain message-only and continue clearing the token cookie.

## Boundary Notes

- The current auth-service runtime at services/auth-service/src/index.js is still a proxy layer.
- The real auth behavior remains implemented in Next.js route handlers under apps/client-web/app/api/auth.
- No ownership has been migrated yet; this map is a pre-extraction planning artifact.

## Next Allowed Step

- Phase 1C may extract only GET /api/auth/logout after an explicit implementation plan is approved.
