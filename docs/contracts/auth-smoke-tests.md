# Auth Smoke Test Baseline

Purpose

- Capture the current observed behavior before any auth extraction begins.
- This document is a baseline contract only. No runtime behavior is changed here.

## Logout Baseline

Endpoint

- GET /api/auth/logout?role=user

Preconditions

- A token cookie exists before the request.

Expected Status

- 200

Expected Response

```json
{
  "success": true,
  "message": "User logout successful!"
}
```

Expected Cookie Behavior

- Before: token exists
- After: token is cleared
- After: token expires immediately
- After: cookie path remains /
- After: response does not return any authentication payload

Notes

- The role query parameter is used only to format the success message.
- The current implementation does not emit a refresh token or any additional auth data.

## Customer Login Baseline

Endpoint

- POST /api/auth/customer/login

Preconditions

- A customer account exists with a valid hashed password.

Expected Status

- 201 on success

Expected Response

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

Expected Cookie Behavior

- Before: no token cookie or old token
- After: token cookie set, HttpOnly, SameSite=Strict, 7 day MaxAge

Error Cases

- Unknown email: 404 `{ "error": "Customer not found" }`
- Wrong password: 401 `{ "error": "Invalid credentials" }`

JWT Compatibility

- Claims: id, role, name, email, status, customerType
- Secret: JWT_SECRET env
- Expiry: 7 days

## Future Expansion

- Add the remaining auth endpoints to this document after each extraction is verified.
