# Auth Extraction Boundary

Purpose

- Define the exact boundary for the first runtime extraction before any code changes begin.
- This document is documentation only and does not change behavior.

## Phase 1D: Logout Extraction Boundary

Scope

- Extract only GET /api/auth/logout.
- Do not change any other auth endpoint.
- Do not change API paths.
- Do not change response shape.
- Do not change cookie behavior.
- Do not change frontend code.
- Do not change the gateway.

Target Structure

- services/auth-service/src/modules/auth/controllers/
- services/auth-service/src/modules/auth/services/

Minimal implementation shape

- controllers/auth.controller.js
- services/auth.service.js

Behavior to preserve

- role query parameter is still accepted.
- token cookie is cleared.
- cookie expiry behavior remains immediate.
- response message remains the same.
- status code remains the same.

Out of scope for this step

- login
- register
- token generation
- refresh tokens
- session redesign
- gateway redesign
- frontend token handling changes

Decision Rule

- If the extraction requires any additional auth endpoint changes, stop and re-approve the scope before editing.

Execution Order

1. Analyze
2. Approve
3. Change
4. Test
5. Commit

Rollback Expectation

- If the extracted logout behavior diverges from the baseline, revert only the extraction step and restore the previous route implementation.
