# ScrapSaathi Backend Product & Architecture Roadmap

## Product Reference

ScrapSaathi should support a marketplace-style scrap collection workflow:

1. A seller schedules a pickup for scrap items.
2. The platform estimates value using city/category/item rates.
3. A verified collector accepts or is assigned to the pickup.
4. The collector reaches the address, weighs items, records final weight and evidence.
5. The seller gets paid and the order is closed.
6. Businesses receive documentation and sustainability reports.

Inspired product capabilities from ScrapUncle-style workflows:

- On-demand doorstep pickups.
- Transparent item/category rates.
- Verified collectors.
- Accurate digital weighing.
- Instant payment.
- Household and business flows.
- Live pickup tracking.
- Wallet, coupons, referrals, and reports as later-stage features.

## Backend Principles

- Modular monolith first, microservices later only when needed.
- Domain modules own their controllers, services, repositories, DTOs, validators, and tests.
- Controllers should be thin.
- Services hold business use cases.
- Repositories isolate database access.
- Models represent persistence, not business workflows.
- AuthN and AuthZ must be separate.
- Every write operation should be validated, authorized, logged, and traceable.
- Background jobs should handle slow side effects such as emails, reports, and notifications.

## Recommended Runtime Stack

- Node.js + Express initially, optionally TypeScript migration after module boundaries stabilize.
- MongoDB + Mongoose for current continuity.
- Redis for rate limiting, session/token denylist, queues, and caching.
- BullMQ or equivalent for background jobs.
- Passport or custom OAuth adapter for Google OAuth and future providers.
- OpenAPI for API contracts.
- Jest + Supertest for backend tests.
- Docker Compose for local development.
- Kubernetes manifests or Helm chart for deployment.

## Target Folder Structure

```text
server/src/
  app.js
  index.js
  config/
  common/
    errors/
    http/
    middleware/
    responses/
    security/
    validation/
  infrastructure/
    database/
    email/
    object-storage/
    queue/
    oauth/
    payments/
  modules/
    auth/
    users/
    profiles/
    collectors/
    catalog/
    pricing/
    pickups/
    assignments/
    payments/
    wallet/
    coupons/
    referrals/
    notifications/
    reports/
    admin/
    support/
  docs/
  tests/
```

## Core Domain Modules

### Auth

Responsibilities:

- Local email/password login.
- Email OTP verification.
- Google OAuth.
- Refresh tokens.
- Token revocation.
- Password reset.
- Session/device tracking.

Important design:

- `AuthProvider` interface: local, Google, future Apple/phone.
- `TokenService`: access token, refresh token, rotation, revocation.
- `PasswordService`: hashing and password policy.
- `OtpService`: OTP issuance, verification, expiry, attempt limits.

### Users & Profiles

Responsibilities:

- Common user identity.
- Role and user type.
- Seller profiles.
- Collector profiles.
- Business profiles.
- Recycler profiles.
- KYC/verification lifecycle.

Important design:

- Separate platform roles from customer type.
- Add `collectorStatus`: pending, verified, suspended.
- Add address book instead of single free-text address.

### Catalog & Pricing

Responsibilities:

- City-wise recyclable categories.
- Scrap item rates.
- Rate history.
- Serviceability by city/pincode/geo-area.
- Minimum pickup quantity/value rules.

Important design:

- Pickups should reference quoted rates at booking time.
- Rate updates must not mutate old pickup economics.

### Pickups

Responsibilities:

- Schedule pickup.
- Track lifecycle.
- Store requested items and final collected items.
- Store address/location.
- Evidence images.
- Cancellation/reschedule rules.

Suggested states:

- `draft`
- `scheduled`
- `assigned`
- `accepted`
- `collector_en_route`
- `arrived`
- `weighed`
- `payment_pending`
- `completed`
- `cancelled`
- `expired`

### Assignments

Responsibilities:

- Collector matching.
- Manual admin assignment.
- Collector accept/reject.
- Concurrency-safe claiming.
- Collector capacity and service area.

Important design:

- Use atomic update when accepting a pickup.
- Never trust `wasteCollectorId` from body if an authenticated collector is available.

### Payments & Wallet

Responsibilities:

- Seller payout records.
- Payment method.
- Settlement state.
- Optional wallet ledger.
- Refund/reversal support.

Important design:

- Use append-only ledger entries for wallet movement.
- Keep payment provider IDs and idempotency keys.

### Notifications

Responsibilities:

- Email.
- SMS/WhatsApp later.
- In-app notifications.
- Push notifications later.

Important design:

- Controllers should enqueue notification jobs, not send mail inline.

### Reports

Responsibilities:

- Business pickup history.
- Sustainability metrics.
- Recycling impact.
- Exportable invoices/certificates.

## Database Collections

Recommended collections:

- `users`
- `authIdentities`
- `sessions`
- `refreshTokens`
- `otpChallenges`
- `profiles`
- `addresses`
- `collectorVerifications`
- `collectorServiceAreas`
- `scrapCategories`
- `scrapItems`
- `scrapRates`
- `pickupRequests`
- `pickupEvents`
- `pickupAssignments`
- `pickupEvidence`
- `payments`
- `walletEntries`
- `coupons`
- `referrals`
- `notifications`
- `supportTickets`
- `auditLogs`

## API Shape

Use versioned REST:

```text
/api/v1/auth/register
/api/v1/auth/login
/api/v1/auth/oauth/google/start
/api/v1/auth/oauth/google/callback
/api/v1/auth/refresh
/api/v1/auth/logout
/api/v1/users/me
/api/v1/catalog/rates
/api/v1/pickups
/api/v1/pickups/:pickupId
/api/v1/pickups/:pickupId/cancel
/api/v1/collector/pickups/available
/api/v1/collector/pickups/:pickupId/accept
/api/v1/collector/pickups/:pickupId/status
/api/v1/admin/users
/api/v1/admin/pickups
```

Standard response:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {},
  "errors": []
}
```

## Security Backlog

- Add Helmet security headers.
- Add request ID middleware.
- Add rate limiting by IP and identity.
- Add strict validation for body, query, params, files, and headers.
- Add RBAC middleware.
- Add ownership checks.
- Add refresh token rotation.
- Add token denylist.
- Add audit logging for sensitive changes.
- Add upload file type and size constraints.
- Move file storage to object storage.
- Remove all raw `console.log` calls from backend.
- Stop exposing raw error messages.

## Kubernetes Readiness Backlog

- Dockerfile for Express backend.
- Dockerfile for FastAPI chatbot.
- Docker Compose for local MongoDB/Redis.
- `/health/live` and `/health/ready`.
- Graceful shutdown.
- Environment variable documentation.
- Kubernetes Deployment, Service, Ingress, ConfigMap, Secret.
- Horizontal Pod Autoscaler.
- Resource requests and limits.
- Structured logs to stdout.
- External MongoDB/Redis managed services.

## Suggested Implementation Milestones

1. Foundation: common response, async handler, request ID, security middleware, API versioning.
2. Auth v2: modular auth, Google OAuth, refresh tokens, RBAC, ownership middleware.
3. User/profile v2: unified profile model, address book, collector verification.
4. Catalog/pricing: categories, items, city-wise rates, quote snapshots.
5. Pickup v2: scheduling, lifecycle events, assignment, atomic accept, status tracking.
6. Payments/wallet: settlement records and future payment provider integration.
7. Notifications/jobs: queue-backed email and in-app notifications.
8. Tests/docs: integration tests and OpenAPI.
9. Dockerization and Kubernetes deployment.
