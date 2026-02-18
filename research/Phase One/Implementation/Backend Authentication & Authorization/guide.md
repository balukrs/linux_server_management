---
task: '[[Backend Authentication & Authorization]]'
phase: Phase One
created: 2026-02-16
status: Done
---

# Implementation Guide: Backend Authentication & Authorization

## Overview

Implement the complete authentication and authorization system for the Express API. This is the gateway for every protected endpoint — login, signup, logout, token management, auth middleware, and role-based access control. The database (User, AccessCode models) and frontend auth pages are already built and waiting for backend integration.

## Prerequisites

- Database set up with Prisma schema (User, AccessCode models migrated)
- `@linux-mgmt/db` package exporting Prisma client
- Express app initialized in `apps/api`
- `bcrypt` and `jsonwebtoken` packages installed in `apps/api`
- `cookie-parser` middleware installed in Express

## Scope

Backend API auth layer — covers `apps/api` route handlers, middleware, and utility functions. Touches `packages/db` only for a new RefreshToken model. Does not modify frontend code.

## Architecture Context

**Authentication flow** (from `architecture.md`):

```
Frontend (login) -> Backend (validate) -> Database (user lookup) -> Backend (set HTTP-only cookie with JWT) -> Frontend (authenticated)
```

**Key components:**

- **Auth endpoints**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/signup`
- **Auth middleware**: Reads JWT from `accessToken` cookie, verifies, attaches user to `req`
- **Refresh flow**: When access token expires, middleware checks `refreshToken` cookie against DB, issues new token pair
- **Role middleware**: `requireAdmin` guard for admin-only routes like `/api/users`

**Token strategy** (decided this session):

- Access token: JWT, 1 hour, stored in HTTP-only cookie
- Refresh token: opaque or JWT, 7 days, stored in DB (revocable) and HTTP-only cookie
- Both cookies: `httpOnly`, `secure` (in production), `sameSite=strict`

**Error format** (existing codebase pattern):

```ts
{
  code: 'ERR_UNAUTHORIZED',
  message: 'Invalid credentials',
  statusCode: 401,
}
```

## Related Implementations

- **[[Set Up Database (PostgreSQL + Prisma)/guide]]** — Defines the User, AccessCode, and ActivityLog models that this task depends on. Follow the same Prisma patterns (UUIDs, UTC timestamps, `@@index` directives) when adding the RefreshToken model.

## Implementation Steps

### Step 1: Add RefreshToken Model to Prisma Schema

- **What**: Add a `RefreshToken` model to store refresh tokens in the database for revocation support
- **Where**: Prisma schema in `packages/db`
- **Details**:

  ```
  model RefreshToken {
    id        String   @id @default(uuid())
    token     String   @unique
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    expiresAt DateTime
    createdAt DateTime @default(now())

    @@index([token])
    @@index([userId])
    @@index([expiresAt])
  }
  ```

  - Add reverse relation `refreshTokens RefreshToken[]` to the User model
  - `onDelete: Cascade` ensures tokens are deleted when user is deleted
  - `expiresAt` index supports cleanup of expired tokens
  - Run migration after adding the model

- **Depends on**: None

### Step 2: Create Auth Utilities

- **What**: Build helper functions for password hashing, JWT operations, and cookie configuration
- **Where**: Auth utilities module in `apps/api`
- **Details**:
  - **Password utilities**:
    - `hashPassword(plain)` — bcrypt hash with salt rounds (10-12)
    - `comparePassword(plain, hash)` — bcrypt compare
  - **JWT utilities**:
    - `generateAccessToken(payload)` — signs JWT with user id and role, 1 hour expiry
    - `generateRefreshToken()` — generates a cryptographically random token string (use `crypto.randomUUID()` or `crypto.randomBytes(32).toString('hex')`)
    - `verifyAccessToken(token)` — verifies and decodes JWT, returns payload or throws
  - **Cookie configuration**:
    - `setAuthCookies(res, accessToken, refreshToken)` — sets both cookies with proper flags
    - `clearAuthCookies(res)` — clears both cookies
    - Cookie options: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'strict'`, appropriate `maxAge` for each token
  - **Environment variables** needed: `JWT_SECRET`, `JWT_REFRESH_SECRET` (or reuse one secret)
- **Depends on**: None

### Step 3: Implement Auth Middleware

- **What**: Create middleware that protects routes by verifying JWT from cookies
- **Where**: Middleware module in `apps/api`
- **Details**:
  - **`authenticate` middleware**:
    1. Read `accessToken` from `req.cookies`
    2. If present, verify JWT — on success, attach `req.user = { id, role }` and call `next()`
    3. If access token is missing or expired, read `refreshToken` from `req.cookies`
    4. If refresh token present, look it up in DB (`RefreshToken` table)
    5. If found and not expired: generate new access token + new refresh token, delete old refresh token from DB, save new one, set new cookies, attach user and call `next()`
    6. If no valid token at all: respond with `{ code: 'ERR_UNAUTHORIZED', message: 'Authentication required', statusCode: 401 }`
  - **`requireAdmin` middleware**:
    1. Must run after `authenticate`
    2. Check `req.user.role === 'ADMIN'`
    3. If not admin: respond with `{ code: 'ERR_FORBIDDEN', message: 'Admin access required', statusCode: 403 }`
- **Depends on**: Step 2 (JWT utilities)

### Step 4: Implement POST /api/auth/login

- **What**: Authenticate user with username + password, issue tokens
- **Where**: Auth route handlers in `apps/api`
- **Details**:
  1. Validate request body: `username` and `password` required
  2. Find user by username in DB
  3. If not found: return `{ code: 'ERR_UNAUTHORIZED', message: 'Invalid credentials', statusCode: 401 }`
  4. Compare password with bcrypt
  5. If mismatch: return same error (don't reveal which field is wrong)
  6. Generate access token (JWT with `{ id: user.id, role: user.role }`)
  7. Generate refresh token, save to DB with userId and expiresAt (7 days)
  8. Set both as HTTP-only cookies via `setAuthCookies()`
  9. Log `LOGIN` activity to ActivityLog
  10. Return: `{ user: { id, username, role } }`
- **Depends on**: Steps 2, 3

### Step 5: Implement POST /api/auth/logout

- **What**: Clear auth cookies and revoke refresh token
- **Where**: Auth route handlers in `apps/api`
- **Details**:
  1. Read `refreshToken` from cookies
  2. If present, delete matching record from RefreshToken table
  3. Clear both cookies via `clearAuthCookies()`
  4. Log `LOGOUT` activity to ActivityLog (using `req.user` from auth middleware)
  5. Return: `{ message: 'Logged out successfully' }` with 200
  - This endpoint should be behind `authenticate` middleware so we know who's logging out
- **Depends on**: Steps 2, 3

### Step 6: Implement GET /api/auth/me

- **What**: Return the current authenticated user's info
- **Where**: Auth route handlers in `apps/api`
- **Details**:
  1. User is already attached by `authenticate` middleware as `req.user`
  2. Fetch full user from DB by `req.user.id` (to get username and any other fields)
  3. Return: `{ user: { id, username, role } }`
  4. If user not found in DB (edge case — deleted after token issued): return 401
- **Depends on**: Step 3

### Step 7: Implement POST /api/auth/signup

- **What**: Register a new user with access code validation
- **Where**: Auth route handlers in `apps/api`
- **Details**:
  1. Validate request body: `email`, `username`, `password`, `accessCode` required
  2. Find AccessCode in DB where `code` matches, `email` matches, `used` is false, `expiresAt` > now
  3. If not found or invalid: return `{ code: 'ERR_VALIDATION', message: 'Invalid or expired access code', statusCode: 400 }`
  4. Check username uniqueness (Prisma will throw on duplicate, but better to check explicitly for a clear error message)
  5. Hash password with bcrypt
  6. Create User with `role` from the AccessCode record
  7. Mark AccessCode as `used: true`
  8. Wrap steps 6-7 in a Prisma transaction to ensure atomicity
  9. Log `SIGNUP` activity to ActivityLog
  10. Return: `{ message: 'Account created successfully' }` with 201
  - Note: Signup does NOT auto-login. User goes to login page after.
  - This endpoint is public (no auth middleware)
- **Depends on**: Step 2

### Step 8: Register Routes and Apply Middleware

- **What**: Wire up all auth routes and apply middleware to protected route groups
- **Where**: Route registration / app setup in `apps/api`
- **Details**:
  - **Public routes** (no middleware):
    - `POST /api/auth/login`
    - `POST /api/auth/signup`
  - **Authenticated routes** (`authenticate` middleware):
    - `POST /api/auth/logout`
    - `GET /api/auth/me`
    - All other `/api/*` routes
  - **Admin routes** (`authenticate` + `requireAdmin`):
    - `GET /api/users`
    - `POST /api/users`
    - `DELETE /api/users/:id`
  - Ensure `cookie-parser` middleware is registered before auth routes
- **Depends on**: Steps 3-7

### Parallel Work

- **Can run in parallel**: Step 1 (Prisma model) and Step 2 (auth utilities) — no dependencies between them
- **Sequential chain**: Steps 1+2 -> Step 3 (middleware) -> Steps 4, 5, 6, 7 (endpoints, can be parallel once middleware exists) -> Step 8 (wiring)

## API Changes

All endpoints defined in `api_specification.md` under the Authentication section. No changes needed to the spec — implementation follows it directly. One addition not explicitly in the spec:

- **Refresh flow** is implicit — handled by the auth middleware transparently (no dedicated refresh endpoint). When a request comes in with an expired access token but valid refresh token, middleware silently refreshes and continues.

## Database Changes

**New model: RefreshToken**

```
RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String   (FK -> User)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

This requires a Prisma migration. The User model gets a new reverse relation `refreshTokens RefreshToken[]` but no new columns.

## Key Decisions

| Decision               | Choice                               | Reference                 |
| ---------------------- | ------------------------------------ | ------------------------- |
| Authentication method  | JWT with HTTP-only cookies           | Decisions.md              |
| Access token duration  | 1 hour                               | Decided 2026-02-16        |
| Refresh token duration | 7 days                               | Decided 2026-02-16        |
| Refresh token storage  | DB-backed (revocable)                | Decided 2026-02-16        |
| Password hashing       | bcrypt                               | db_schema.md              |
| Signup flow            | Access code validated against email  | Decisions.md              |
| Activity logging       | Included (LOGIN, LOGOUT, SIGNUP)     | Decided 2026-02-16        |
| Error format           | Flat `{ code, message, statusCode }` | Existing codebase pattern |

## Subtask Breakdown

The task description suggests these subtasks. Map to implementation steps:

| Step   | Subtask                                    | Status |
| ------ | ------------------------------------------ | ------ |
| Step 1 | Add RefreshToken model and migrate         | To Do  |
| Step 2 | Create auth utilities (hash, JWT, cookies) | To Do  |
| Step 3 | Create auth middleware + requireAdmin      | To Do  |
| Step 4 | Implement POST /api/auth/login             | To Do  |
| Step 5 | Implement POST /api/auth/logout            | To Do  |
| Step 6 | Implement GET /api/auth/me                 | To Do  |
| Step 7 | Implement POST /api/auth/signup            | To Do  |
| Step 8 | Register routes and apply middleware       | To Do  |

## Testing Considerations

- **Login**: Valid credentials return user object and set cookies. Invalid username or password returns 401 with same error (no user enumeration). Missing fields return 400.
- **Logout**: Clears cookies and deletes refresh token from DB. Subsequent requests with old tokens fail.
- **Me**: Returns current user when authenticated. Returns 401 when no token.
- **Signup**: Valid access code + email creates user and marks code as used. Expired code, wrong email, already-used code, or duplicate username all return appropriate errors. User role matches code's role.
- **Auth middleware**: Expired access token with valid refresh token issues new tokens transparently. Expired refresh token returns 401. Tampered tokens return 401.
- **Role middleware**: Non-admin user hitting admin route gets 403. Admin user passes through.
- **Token refresh**: Old refresh token is deleted after rotation (prevents reuse).
- **Cookie flags**: Verify `httpOnly`, `sameSite=strict` are set. `secure` only in production.

## Notes

- The refresh flow is handled transparently by middleware — no separate `/auth/refresh` endpoint needed. This keeps the frontend simple (no token management logic).
- Access code signup: The `email` field on AccessCode is used for validation during signup. After signup, the user logs in with `username` (not email). Consider whether the User model should also store email — currently it doesn't per `db_schema.md`. This could be a future enhancement.
- Expired refresh tokens should be cleaned up periodically. This can be added to the existing data retention cleanup job (from the database task).
- The `secure` cookie flag must be `false` in development (no HTTPS on localhost). Use an environment check.

## Revision History

| Date       | Change                | Reason |
| ---------- | --------------------- | ------ |
| 2026-02-16 | Initial guide created | --     |
