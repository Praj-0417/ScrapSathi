# ScrapSaathi Backend Audit

## Scope

This audit covers only backend code:

- `server/`: Express + MongoDB/Mongoose application backend.
- `Backend_chatapp/`: FastAPI RAG chatbot backend.

Frontend implementation is intentionally out of scope.

## Current Architecture Problems

- `server/src/index.js` previously mixed process startup, database connection, CORS, middleware, route mounting, logging, error handling, and frontend fallback serving.
- Several modules used singular import paths such as `../model`, `../controller`, and `../middleware` while the actual folders are `models`, `controllers`, and `middlewares`.
- Controllers contain direct database logic and repeated `try/catch` response handling instead of consistently delegating to services/repositories.
- Auth has a partial service/repository split, but other domains such as donations, contact, admin, and pickup requests are still controller-heavy.
- There is no API versioning, no formal module boundary, no OpenAPI contract, and no test suite.
- The Express backend and FastAPI chatbot are operationally separate but undocumented as separate deployable services.

## Security Issues

- JWT signing previously fell back to a hardcoded secret.
- Auth middleware logged authorization headers, raw tokens, decoded JWT payloads, and user data.
- Admin login previously used a hardcoded JWT secret and an undeclared `bcryptjs` dependency.
- OTP values were stored in plaintext and were not marked as used after successful verification.
- CORS origins were hardcoded in the entrypoint and could not be controlled per environment.
- API responses are inconsistent and sometimes return raw error messages.
- No rate limiting or brute-force protection exists for login, OTP, donation, or pickup endpoints.
- File upload handling uses in-memory storage without file size/type validation.
- FastAPI chatbot allows `allow_origins=["*"]`, prints retrieved context and model output, and depends on an external LLM API without structured retry/error policy.

## Database Issues

- User/profile creation attempted to save profile documents before the user existed, while profile schemas required `user`.
- Pickup request controller fields did not match the pickup request schema.
- The pickup schema added geospatial fields as required even though existing request creation is address-based.
- Donation `userId` is not declared as a required foreign reference to `User`.
- Contact records do not have timestamps, normalized email, or indexing.
- User phone is required but not normalized or unique.
- OTP data lacked a proper consumed/used marker.
- There are no migrations or seed scripts; schema changes rely on Mongoose model drift.
- Index strategy is incomplete across common lookup fields such as email, userId, status, wasteCollector, and createdAt.

## Code Quality Issues

- Several modules had startup-breaking import paths.
- Error handling is inconsistent across controllers.
- Response shapes are inconsistent.
- Logging used `console.log` directly and included sensitive data.
- Dead/commented code remains in mail and pickup modules.
- Naming is inconsistent: `ScrapSathi` vs `ScrapSaathi`, `usertype` vs `userType`, `WasteRequest` vs `PickupRequest`.
- Mail utility mixes OTP mail, pickup notification mail, and an HTTP OTP verification handler.
- No dependency injection boundary exists for repositories, mail, JWT, or hashing.

## First Refactor Increment Completed

- Split Express app construction into `src/app.js`.
- Split database connection into `src/config/database.js`.
- Added `src/config/env.js` with validated environment variables.
- Added `src/config/cors.js` with configurable origins.
- Added structured redacting logger in `src/utils/logger.js`.
- Removed hardcoded JWT fallback from auth and admin login.
- Removed sensitive auth middleware debug logs.
- Fixed broken `models/controllers/middlewares` import paths.
- Fixed registration user/profile creation order.
- Added `role` field for admin authorization groundwork.
- Updated OTP verification validation to require the OTP value.
- Stored OTP values hashed and marked OTP records as used after successful verification.
- Aligned pickup request creation with the `wasteDetails` schema and made geolocation optional.
- Added `server/.env.example`.

## Recommended Target Architecture

```
server/src/
  app.js
  index.js
  config/
    env.js
    cors.js
    database.js
  common/
    errors/
    responses/
    middleware/
    validation/
  modules/
    auth/
      auth.controller.js
      auth.service.js
      auth.repository.js
      auth.routes.js
      auth.validators.js
    users/
    otp/
    contacts/
    donations/
    pickups/
    admin/
  models/
  docs/
  tests/
```

Keep the existing app functional while migrating one module at a time.

## Next Migration Steps

1. Move auth and OTP into `modules/auth` and `modules/otp` with route-local validators and service interfaces.
2. Add centralized response helpers and convert controllers away from ad hoc JSON shapes.
3. Add rate limiting for auth and OTP endpoints.
4. Add upload file size/type validation and move images to object storage instead of Mongo/base64.
5. Add indexes and schema hardening for users, pickups, donations, contacts, and OTP records.
6. Add integration tests for health, register, login, protected profile, OTP, and pickup creation.
7. Add an OpenAPI spec for all backend endpoints.
8. Refactor FastAPI chatbot config, CORS, logging, and startup index loading.
