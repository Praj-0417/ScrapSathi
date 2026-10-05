# ScrapSaathi Interview Notes: Caveats and Possible Solutions

This document describes the current codebase as inspected and gives practical solutions to discuss in an interview. It distinguishes implemented behavior from UI prototypes and planned architecture. Do not describe a proposed solution below as already implemented.

## Project summary

ScrapSaathi is a full-stack scrap-pickup marketplace prototype. Users can create pickup requests with item details, address, schedule, coordinates, and an optional photo. Collectors can view pending requests, accept one, release an accepted request, and mark it complete. The project includes rate cards, role-specific screens, admin endpoints, and a separate RAG chatbot.

The frontend uses React and Vite. The primary API uses Node.js, Express, and MongoDB/Mongoose. The chatbot uses FastAPI, LangChain, sentence-transformer embeddings, FAISS, and an external language-model API.

## High-priority caveats and proposed solutions

### 1. Signup API and frontend contract do not match

**Current behavior:** The backend registration controller returns a `userId`. The frontend looks for a token and user object to log in immediately.

**Possible solution:** Decide explicitly between two behaviors:

1. Register the user, return a session token and sanitized user, and establish a session; or
2. Return a successful registration response and route the user to the login page.

Document the response shape in an API contract and add an integration test for the selected behavior.

**Interview answer:** “I found a mismatch between the signup response and what the frontend expects. I’d choose whether signup creates a session or requires a separate login, then align both sides and add a contract test.”

### 2. Email OTP is not required for regular signup

**Current behavior:** OTP send and verify endpoints exist. OTP values are hashed, expire, and can be marked used. Regular registration does not require successful verification, and the registration UI does not complete that flow.

**Possible solution:** Create a server-side verification challenge tied to the normalized email. Require a verified challenge when registering, expire and consume it atomically, and add per-email attempt limits in addition to IP rate limits. Avoid relying on a client-only “verified” flag.

**Interview answer:** “The OTP foundation exists, but signup does not enforce it yet. I’d tie registration to a server-side verified challenge, expire and consume it safely, and test both successful and expired-code paths.”

### 3. Google credential claims are decoded but not verified

**Current behavior:** The backend decodes fields from the Google credential payload. Decoding is not proof that Google issued the token.

**Possible solution:** Verify the Google ID token with Google’s official verification library. Validate signature, issuer, audience/client ID, expiry, and subject before using the email or profile fields. Link an identity only after verification.

**Interview answer:** “The current code extracts claims but does not validate the token with Google, so I would not call that production-ready OAuth. I’d verify the ID token and its audience and issuer before trusting the claims.”

### 4. JWT storage, cookie usage, and logout are inconsistent

**Current behavior:** The frontend stores a JWT in `localStorage` and sends a Bearer token. The backend also sets an HTTP-only cookie, but protected middleware reads the Bearer header. Logout clears local state and the cookie but does not revoke an issued JWT.

**Possible solution:** Choose one coherent session design. A common browser design is short-lived access tokens plus rotating, revocable refresh tokens in secure, HTTP-only, same-site cookies, with CSRF protection where needed. Alternatively, use a server-side session. Add token revocation and tests for expiry, logout, and refresh rotation.

**Interview answer:** “The current implementation uses both a cookie and a local-storage Bearer token, but the API authenticates from the header. I’d simplify that into one session model and add revocation or refresh-token rotation.”

### 5. Frontend route protection is not sufficient authorization

**Current behavior:** React protected routes primarily check whether a user is logged in. Server-side role checks exist for collector and admin endpoints, but page visibility alone does not enforce permissions.

**Possible solution:** Keep frontend guards for user experience, but enforce role, ownership, and allowed operations in every relevant API route/service. Test access using users from each account type and test cross-user resource access.

**Interview answer:** “Frontend guards are only navigation controls. Authorization has to be enforced on the API for every protected operation, with ownership checks for individual records.”

### 6. Scrap price estimates are client-side and not saved as a quote

**Current behavior:** The frontend calculates estimated payout using displayed rates and quantities. The backend pickup record does not preserve a quote snapshot.

**Possible solution:** Have the backend calculate a quote from trusted catalog/rate data. Store the quoted items, unit rates, city, currency, rate version or timestamp, line totals, and total with the pickup. At collection time, store measured quantities and a separately recorded final settlement with an auditable adjustment reason.

**Interview answer:** “The current number is an estimate from the UI, not an authoritative quote. I’d move quote calculation to the server and save a snapshot so a later rate change can’t alter an existing booking.”

### 7. Pickup notes and operational evidence are incomplete

**Current behavior:** The frontend sends notes, but the pickup model does not define a notes field. The model does not persist final measured weight, evidence, or settlement details.

**Possible solution:** Define an explicit pickup DTO and schema for customer notes, collector weighment, evidence photos, timestamps, and final settlement. Validate each field and restrict who can write it. Use separate immutable events or audit records for important changes.

**Interview answer:** “Some booking data is sent by the UI but not represented in the pickup schema. I’d align the request contract and model, and add explicit records for final weighment and evidence.”

### 8. Pickup lifecycle has incomplete states and non-atomic transitions

**Current behavior:** Persisted states are pending, accepted, completed, and cancelled. Acceptance uses a conditional atomic update. Some cancellation and completion operations perform a read followed by a write. Releasing a pickup changes the status back to pending but does not clearly clear the collector assignment.

**Possible solution:** Define an allowed transition table. Use conditional atomic updates that include the expected current state and assigned user, clear assignment on release, and append the event in the same operation. Add tests for valid transitions, invalid transitions, and concurrent requests.

Possible later states include `scheduled`, `assigned`, `accepted`, `en_route`, `arrived`, `weighed`, `payment_pending`, `completed`, `cancelled`, and `expired`, if the product needs that level of detail.

**Interview answer:** “Acceptance is protected against double claiming, but the rest of the lifecycle needs the same rigor. I’d define allowed transitions and make each state change conditional and atomic.”

### 9. Collector matching is a pending-request list, not geographic dispatch

**Current behavior:** Collectors fetch pending requests. The API does not match by collector location, service area, distance, availability, or capacity.

**Possible solution:** Add verified collector service areas and availability, geospatial indexes and radius filtering, and a dispatch policy. Keep the final claim atomic even after filtering candidates; discovery must not reserve the request.

**Interview answer:** “The current collector flow is a shared pending pool. A future dispatch system could filter by service area and availability, while retaining the atomic claim to resolve races.”

### 10. Live tracking is simulated

**Current behavior:** The customer map animates a generated route and derives illustrative progress, distance, and ETA. There is no API that ingests collector GPS and streams it to the customer. Browser geolocation on the collector map is local UI behavior, not a tracking backend.

**Possible solution:** Add authenticated location updates tied to an active assigned pickup. Validate assignment and coordinate bounds, throttle updates, store a timestamped latest position, and deliver updates over WebSockets or a managed pub/sub service. Restrict access to the customer and assigned collector, set retention limits, and display stale-location status.

**Interview answer:** “The current map is a visual simulation, not live GPS. A real version needs authenticated collector location updates, access controls, and a real-time delivery mechanism.”

### 11. Payments and payouts are not verified end to end

**Current behavior:** Donation UI creates a UPI link and QR and allows manual confirmation. Donation service marks records completed without a verified provider callback. The payment strategy files are scaffolding; no provider implementation is wired in. Pickup completion ignores settlement fields sent by the frontend.

**Possible solution:** Integrate a payment provider with server-created payment intents/orders, signed callback verification, idempotency keys, transaction references, explicit pending/succeeded/failed states, reconciliation, and an append-only ledger. Never mark a payment completed based only on a browser action. Treat seller payout as its own stateful workflow.

**Interview answer:** “The current UPI screen is a demo flow, not provider-verified payment processing. I’d only mark a payment complete after validating the provider callback and recording an idempotent transaction.”

### 12. Donation certificate claims need verification

**Current behavior:** The service can generate a certificate-like ID, but there is no evidence in the code that this creates a legally valid tax receipt or verifies the donation.

**Possible solution:** Generate receipts only after confirmed payments and only with the required legal and organization data. Treat tax-related wording as a compliance requirement to validate, not as a UI-generated guarantee.

**Interview answer:** “The generated identifier is not proof of a valid tax certificate. I’d connect receipt generation to verified payment and confirm applicable requirements before making that claim.”

### 13. Chatbot is RAG over static documents, with external dependencies

**Current behavior:** The FastAPI service loads Markdown, builds an in-memory FAISS index at startup, retrieves up to five chunks, and calls an external language model. It sends a small number of previous user queries but does not maintain durable conversation history. The browser timeout is shorter than the backend model-call timeout.

**Possible solution:** Version and refresh the knowledge base deliberately, persist or share the vector index for multi-instance deployments, return source references, add retrieval confidence thresholds and evaluation cases, handle provider timeouts consistently, and avoid logging sensitive prompts. Align frontend and backend timeouts or use a streaming response.

**Interview answer:** “It’s a RAG assistant, not a model trained on our data. It retrieves from static project documents and relies on an external model, so I’d improve source visibility, evaluation, index updates, and timeout handling.”

### 14. Geocoding does not establish serviceability

**Current behavior:** The API checks a hardcoded locality directory and may call OpenStreetMap Nominatim. That provides geocoding suggestions, not authoritative pickup coverage.

**Possible solution:** Model supported service areas separately and validate the pickup coordinates against those areas before accepting a booking. Add caching and rate-limit handling for external geocoding, and keep a graceful fallback when the provider is unavailable.

### 15. Backend layering is incomplete

**Current behavior:** Several domains use controllers, services, and repositories, but rates and geocoding include business or persistence logic directly in route files.

**Possible solution:** Migrate one domain at a time: keep route definitions focused on HTTP wiring, move use cases into services, isolate database operations in repositories, and wrap external providers in adapters. Avoid a broad rewrite before tests and behavior contracts exist.

### 16. Rate limiting needs shared storage when scaled

**Current behavior:** Express rate limits exist for general API traffic, authentication, OTP, and contact submissions. A process-local limiter does not coordinate counters across multiple app instances.

**Possible solution:** Use a shared Redis-backed rate-limit store when horizontally scaling. Add account/email-based OTP attempt limits and monitor rejected requests, while keeping limits configurable.

### 17. Upload validation can be strengthened

**Current behavior:** Multer limits files to 5 MB and checks MIME type against allowed image types. Uploads are held in memory and optionally sent to Cloudinary.

**Possible solution:** Verify actual file signatures rather than trusting the MIME header, use quotas, handle upload cleanup, restrict public access as needed, and consider malware scanning. For large files, use direct signed uploads to object storage with server-side validation.

### 18. Tests and API documentation are missing or incomplete

**Current behavior:** The backend package test script is a placeholder that exits with “no test specified.” There is no maintained OpenAPI contract.

**Possible solution:** Add integration tests for registration, login, protected profile, pickup creation and ownership, atomic collector acceptance, and lifecycle transitions. Add OpenAPI documentation from the agreed request/response contracts. Run tests in CI before deployment.

### 19. API prefix and deployment configuration should be verified

**Current behavior:** Express mounts its router under `/api`, while frontend calls include `/v1/...`. Configuration files and comments refer to versioning, but route mounting and deployed proxy behavior need to agree.

**Possible solution:** Pick a canonical prefix such as `/api/v1`, mount it explicitly, update the frontend base URL and endpoint paths, and add a deployment smoke test against the actual built app and proxy configuration.

### 20. Deployment files do not prove production deployment

**Current behavior:** Dockerfiles, Docker Compose, Render/Railway configuration, and Kubernetes manifests exist. The root Compose setup runs the Express API and frontend, not the FastAPI chatbot. These files alone do not prove a live production cluster or monitoring setup.

**Possible solution:** Keep deployment claims tied to observed environments. Add the chatbot as an explicit service if Compose is meant to run the full product, document required secrets and health checks, and verify deployment with health checks, logs, and a release pipeline.

## Suggested improvement order

1. Align signup response and frontend behavior; add integration tests for signup and login.
2. Verify Google ID tokens correctly and make signup email verification enforceable if required.
3. Choose one coherent session strategy and implement logout/revocation behavior.
4. Define pickup states and make all transitions atomic and ownership-checked.
5. Move rate calculations to the backend and save quote snapshots.
6. Add final weighment and evidence records.
7. Integrate verified payments and payouts with idempotency and an audit trail.
8. Implement real collector location updates before advertising live tracking.
9. Add shared rate-limit storage, background jobs, tests, and API documentation.
10. Verify API prefixes and deployment configuration in the actual target environment.

## Interview-ready summary

> “ScrapSaathi is a full-stack prototype for scrap pickup booking. The booking and collector request flows are backed by an Express and MongoDB API, and collector acceptance uses a conditional atomic update to prevent double claiming. The rate estimate is currently calculated in the frontend, the tracking animation is simulated, and payments are not provider-verified. My next steps would be to align the signup contract, make pickup transitions consistently atomic, create server-side quote snapshots, and add verified payment and location integrations with integration tests.”

## Quick facts to memorize

- **Frontend:** React, Vite, React Router, Axios, Tailwind, React-Leaflet.
- **Main API:** Node.js, Express, Mongoose, MongoDB.
- **Authentication:** bcrypt password hashing, JWT Bearer token, role checks.
- **Validation:** Zod at request boundaries plus Mongoose model validation.
- **Pickup concurrency:** atomic conditional update for collector acceptance.
- **Uploads:** Multer memory storage, 5 MB limit, allowed image MIME types, optional Cloudinary.
- **Chatbot:** FastAPI, Markdown knowledge base, sentence-transformer embeddings, FAISS, external LLM.
- **Important prototype caveats:** signup contract mismatch, OTP not required for signup, Google credential not cryptographically verified, estimated client-side pricing, simulated GPS, and unverified payments.
