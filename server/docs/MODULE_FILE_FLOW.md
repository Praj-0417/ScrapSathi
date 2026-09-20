# Module File Flow

Every production module should follow this shape:

```text
modules/<module-name>/
  <module-name>.routes.js
  <module-name>.controller.js
  <module-name>.service.js
  <module-name>.repository.js
  <module-name>.validators.js
  <module-name>.dto.js
  <module-name>.policy.js
  <module-name>.events.js
  <module-name>.types.js
  README.md
```

## Example: Pickups

```text
modules/pickups/
  pickup.routes.js
  pickup.controller.js
  pickup.service.js
  pickup.repository.js
  pickup.validators.js
  pickup.dto.js
  pickup.policy.js
  pickup.events.js
  strategies/
    collector-assignment.strategy.js
    nearest-collector.strategy.js
    manual-assignment.strategy.js
  README.md
```

## Request Flow

```text
POST /api/v1/pickups
  -> pickup.routes.js
  -> validate(createPickupSchema)
  -> protect
  -> pickup.controller.create
  -> pickup.service.schedulePickup
  -> pricingService.createQuoteSnapshot
  -> pickupRepository.create
  -> notificationQueue.enqueue
  -> response.success
```

## Dependency Direction

Allowed:

```text
controller -> service -> repository -> model
service -> infrastructure adapter
service -> domain strategy
```

Avoid:

```text
model -> service
repository -> controller
controller -> model
module A repository -> module B model
```

Cross-module calls should go through services or published events.

