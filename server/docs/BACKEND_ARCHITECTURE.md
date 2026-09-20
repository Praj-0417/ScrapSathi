# ScrapSaathi Backend Architecture

## Architecture Style

ScrapSaathi should be built as a modular monolith first.

This gives us:

- One deployable backend while the product is still evolving.
- Clear domain boundaries without premature microservices.
- Easier local development, testing, debugging, and deployment.
- A clean path to split modules later if traffic or team ownership requires it.

## High-Level Flow

```text
HTTP request
  -> app middleware
  -> versioned route
  -> module route
  -> controller
  -> validator / DTO
  -> service use case
  -> domain strategy / factory when needed
  -> repository
  -> database / external infrastructure
  -> standard response
```

## Layer Rules

### Controllers

- Own HTTP details only.
- Read request input.
- Call one service method.
- Return standardized responses.
- Do not contain business rules.
- Do not directly query MongoDB.

### Services

- Own business use cases.
- Coordinate repositories and infrastructure adapters.
- Enforce domain rules.
- Use strategies/factories where behavior differs by provider or type.

### Repositories

- Own database access.
- Hide Mongoose query details from services.
- Return domain-friendly data.
- Do not send emails, create tokens, or know HTTP.

### Infrastructure

- Own external systems.
- OAuth providers.
- Email providers.
- Object storage.
- Queue workers.
- Payment providers.
- AI services.

### Common

- Shared middleware, responses, errors, validation, security, constants.
- Should stay small and generic.
- Do not place domain business logic here.

## Design Patterns

### Strategy

Use when behavior changes by provider or business rule.

Examples:

- OAuth provider strategy: Google now, Apple later.
- Pricing strategy: household vs business vs bulk pickup.
- Assignment strategy: nearest collector vs admin manual assignment.
- Payment strategy: cash, UPI, wallet, payment gateway.

### Factory

Use when a service needs the correct implementation based on input/config.

Examples:

- `OAuthProviderFactory.create("google")`
- `PaymentProviderFactory.create("razorpay")`
- `AssignmentStrategyFactory.create("nearest_available")`

### Singleton

Use for process-level shared resources.

Examples:

- MongoDB connection.
- Queue connection.
- Logger.
- Configuration object.

### Repository

Use to isolate persistence.

Examples:

- `PickupRepository`
- `UserRepository`
- `RateRepository`
- `WalletRepository`

### Adapter

Use around third-party systems.

Examples:

- Email adapter.
- Object storage adapter.
- Payment gateway adapter.
- AI waste-detection adapter.

## API Versioning

New backend APIs should live under:

```text
/api/v1
```

Legacy APIs can remain under:

```text
/api
```

Migration approach:

1. Build new module under `/api/v1`.
2. Keep old endpoint working.
3. Update frontend when ready.
4. Remove legacy route after parity and tests.

## Bounded Contexts

### Identity

- Auth.
- OAuth.
- OTP.
- Refresh tokens.
- RBAC.
- Sessions.

### Marketplace

- Sellers.
- Collectors.
- Businesses.
- Service areas.
- Pickup assignment.

### Catalog

- Scrap categories.
- Scrap items.
- Accepted/restricted materials.
- City-wise availability.

### Pricing

- Rates.
- Quotes.
- Rate snapshots.
- Bulk pricing.

### Pickup Operations

- Scheduling.
- Lifecycle.
- Tracking.
- Evidence.
- Weighing.
- Completion.

### Settlement

- Payments.
- Wallet.
- Ledger.
- Coupons.
- Referrals.

### Communication

- Email.
- In-app notifications.
- Queue jobs.
- Future SMS/WhatsApp/push.

### AI

- YOLO waste detection.
- RAG assistant.
- These should be isolated behind AI service adapters and should not leak into core pickup logic.

## Deployment Direction

Before Kubernetes:

1. Stable module boundaries.
2. Health and readiness endpoints.
3. Dockerfile.
4. Docker Compose for local MongoDB and Redis.
5. Tests.
6. CI pipeline.
7. Kubernetes manifests or Helm chart.

Kubernetes should run:

- Express API deployment.
- FastAPI AI/RAG deployment.
- Redis if not managed.
- Ingress.
- Secrets.
- ConfigMaps.
- HPA.

