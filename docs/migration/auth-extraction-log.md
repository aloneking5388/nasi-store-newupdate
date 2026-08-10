# Auth Extraction Log

Purpose
- Track auth endpoint extraction history in one place.
- This is a documentation-only ledger and does not change runtime behavior.

## Logout

Status
- Completed

Date
- 2026-08-05

Old owner
- apps/client-web/app/api/auth/logout

New owner
- services/auth-service/src/modules/auth

Changed files
- services/auth-service/src/index.js
- services/auth-service/src/modules/auth/controllers/logout.controller.js
- services/auth-service/src/modules/auth/services/logout.service.js
- apps/client-web/app/api/auth/logout/route.ts

Verification
- GET /api/auth/logout?role=user

Result
- PASS

Behavior preserved
- Endpoint path unchanged
- HTTP method unchanged
- Role query parameter preserved
- Response format preserved
- Cookie name preserved
- Cookie clearing preserved
- Expiry behavior preserved
- Frontend changes not required

Rollback
- Available

Notes
- The Next.js logout route remains a compatibility adapter during Phase 1D.
- auth-service now owns the logout handling path directly.

Verification Detail
- PASS

## Customer Login

Status
- Completed

Date
- 2026-08-05

Old owner
- apps/client-web/app/api/auth/customer/login

New owner
- services/auth-service/src/modules/auth

Changed files
- services/auth-service/src/index.js
- services/auth-service/src/modules/auth/controllers/customer-login.controller.js
- services/auth-service/src/modules/auth/services/customer-login.service.js
- apps/client-web/app/api/auth/customer/login/route.ts

Verification
- POST /api/auth/customer/login with valid credentials

Result
- PASS

Behavior preserved
- HTTP 201 on success
- Response fields: success, message, userInfo, token
- userInfo keys: id, name, email, role, status, customerType
- Cookie name: token
- Cookie HttpOnly: YES
- Cookie SameSite: strict
- HTTP 404 for unknown email: { error: "Customer not found" }
- HTTP 401 for wrong password: { error: "Invalid credentials" }
- JWT claims preserved
- Frontend changes not required

Compatibility table (direct auth-service vs Next.js adapter)

| Check | Result |
|---|---|
| Runtime compilation | PASS |
| Direct service endpoint (port 4001) | PASS |
| Compatibility adapter (port 3000) | PASS |
| HTTP status match | YES |
| Response JSON fields match | YES |
| Response message match | YES |
| userInfo keys match | YES |
| JWT claims match | YES |
| JWT expiry match | YES |
| Cookie HttpOnly — direct | YES |
| Cookie HttpOnly — adapter | YES |
| Cookie SameSite — direct | strict |
| Cookie SameSite — adapter | strict |
| 404 body match | YES |
| 401 body match | YES |
| Logout regression | PASS |

Rollback
- Available

Notes
- The Next.js customer login route is now a compatibility adapter.
- auth-service owns the full customer login business logic path.

## Shared Auth Utilities

Status
- Completed

Date
- 2026-08-07

Changed files
- services/auth-service/src/modules/auth/utils/jwt.service.js
- services/auth-service/src/modules/auth/utils/password.service.js
- services/auth-service/src/modules/auth/utils/cookie.service.js
- services/auth-service/src/modules/auth/utils/response.factory.js
- services/auth-service/src/modules/auth/utils/user.mapper.js
- services/auth-service/src/modules/auth/services/customer-login.service.js
- services/auth-service/src/modules/auth/services/logout.service.js
- services/auth-service/project.json
- services/auth-service/tests/utils/jwt.service.test.js
- services/auth-service/tests/utils/password.service.test.js
- services/auth-service/tests/utils/cookie.service.test.js
- services/auth-service/tests/utils/response.factory.test.js

Verification
- npx nx test auth-service
- node services/auth-service/tests/customer-login-smoke.js
- GET /api/auth/logout?role=user

Result
- PASS

Behavior notes
- Endpoint behavior remains unchanged for customer login and logout.
- password.service now returns false for null, undefined, or empty plaintext input instead of allowing bcrypt.compare to throw.
- This is intentional boundary hardening in the shared utility; it does not change the observed endpoint contract.

Compatibility table

| Check | Result |
|---|---|
| Auth-service test target | PASS |
| Utility unit tests | 28/28 PASS |
| Customer login smoke test | PASS |
| Logout regression | PASS |
| Scope check via git diff | Not available |

Scope check limitation
- The workspace is not inside a Git repository, so git diff and git status cannot provide changed-file scope evidence here.
- Scope was instead verified against the explicit file list above.

## Future Entries
- Add one entry per auth endpoint extraction as the migration progresses.
