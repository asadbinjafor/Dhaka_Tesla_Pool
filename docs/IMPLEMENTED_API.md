# Implemented REST API

Canonical API prefix **/api/v1**, independent of UI locale. Success is `{data:...}`; failure is `{error:{code,requestId,details?}}`, without raw SQL/stack/credentials. UI translates codes from both catalogs. GET/private results use private/no-store and Vary Cookie. Actual controllers/DTOs and tests are authoritative over earlier illustrative proposal payloads.

## Authentication and unsafe requests

GET /auth/csrf initializes an anonymous HttpOnly session cookie or returns the current session CSRF token. POST /auth/register takes `{name,email,password}` (name 1–100, email <=254, password 12–128) and creates PASSENGER only; POST /auth/login takes `{email,password}` (password 1–128) and rotates session. Both return `{user:{id,displayName,email,role},csrfToken}` and Set-Cookie. POST /auth/logout `{}` invalidates session; GET /me returns only the authenticated own user. Drivers/vehicles are provisioned by the explicit demo seed, not a role field on signup.

Every unsafe command, including authentication, requires exact configured **Origin** and **x-csrf-token** matching the server cookie session. Business commands additionally require **Idempotency-Key: UUID**, retained verbatim on uncertain retries. Authentication and quotes do not use business receipts. Browser credentials remain in cookies; caller-provided owner/driver/role/fare/state fields are rejected or ignored as trust claims. Login/registration have bounded in-process basic throttling, not a shared distributed limiter.

| Method / resource | Role | Body / result |
|---|---|---|
| GET /zones | Authenticated | `{zones:[{id,labelEn,labelBn}],routes:[{pickupId,destinationId}]}` |
| POST /fare-quotes | Passenger | `{pickupId,destinationId,seats}` numeric quantity; owner-bound 5-minute quote `{id,expiresAt,route,seats,solo,pooled}` |
| POST /ride-requests | Passenger | `{quoteId,paymentMethod:"CASH"}` -> minimal CREATE_REQUEST receipt |
| GET /ride-requests/current | Passenger | Own active detail or null; discovery only |
| GET /ride-requests/:id | Owning passenger | Stable owned detail, including terminal |
| POST /ride-requests/:id/cancel | Owning passenger | `{reason}` trimmed 1–200; REQUESTED/MATCHED only; own atomic release |
| PATCH /driver/availability | Driver | `{online:boolean}`; cannot go offline while own pool active |
| GET /driver/requests | Driver | Relevant oldest 50 REQUESTED records, quantity/canFit plus availableSeats; observations, no reservation |
| POST /driver/requests/:id/accept | Driver | `{}`; atomic own vehicle/pool assignment, receipt |
| GET /driver/vehicle | Driver | Own `{id,displayName,capacity,online}` |
| GET /driver/pools/current | Driver | Own active pool or null |
| GET /driver/pools/:id | Owning driver | Stable owned roster and lifecycle/fare details |
| POST /driver/pools/:id/arrive | Owning driver | `{}`; ACCEPTED -> DRIVER_ARRIVED; close joins/passenger cancellation and freeze fares |
| POST /driver/pools/:id/start | Owning driver | `{}`; DRIVER_ARRIVED -> STARTED |
| POST /driver/pools/:id/complete | Owning driver | `{}`; STARTED -> COMPLETED; only noncanceled members |
| POST /driver/pools/:id/cancel | Owning driver | `{reason}`; ACCEPTED/DRIVER_ARRIVED only, zero charge, retained final evidence |
| GET /ride-history | Passenger | Own terminal requests; filters/cursor below |
| GET /driver/trip-history | Driver | Own terminal pools; historical roster |
| GET /statistics/passenger | Passenger | Own completed fare/discount/trips per Dhaka day |
| GET /statistics/driver | Driver | Own completed pools/seats/capacity/utilization per Dhaka day |
| GET /health/live | Public | API liveness 200 independently of DB |
| GET /health/ready | Public | 200 only reachable migrated DB, otherwise safe 503 |

POST success status is 201; availability PATCH and GET are 200. Blank action bodies must be JSON objects with no extra fields. DTO writes reject unexpected fields and wrong scalar types. UUID paths are validated; unknown/non-owned private IDs return generic 404; assigned requests unavailable to another driver return generic REQUEST_UNAVAILABLE without private details.

## Detail, command and query contracts

Receipt: `{resourceId,action,appliedVersion}` only. Actor/action/key namespace and target/body hash bind original command. Same key replay succeeds only for authenticated durable owner; changed body/target is 409. Fresh commands apply current state/expiry/eligibility guards. Unknown commit acknowledgement is 503 COMMAND_OUTCOME_UNKNOWN; retry original, never a new key. Failure/rollback does not consume the command.

Passenger detail: own id/status/seats/route/createdAt/endedAt/cancellationReason; fare includes basePoysha/distancePoysha/discountPoysha/totalPoysha/soloMaximumPoysha plus kind/chargePoysha/collectionStatus/historicalFinal; aggregate pool capacity/reservedSeats/ownSeats/status and assigned driver displayName/vehicleName; allowedActions; matchingHint; representationVersion `{request,pool}`. No other passenger ID/name/status/fare or internal event stream. Display charge is zero for cancellation; historicalFinal is evidence, not cash/refund tracking. Driver pool detail contains its legitimate roster and historical quantities. Stable detail remains available after /current=null.

History query: status absent/ALL/COMPLETED/CANCELLED, search <=100, limit integer 1–50 (default20), optional opaque cursor <=2048. Search treats wildcard characters literally; zone labels support both languages. Cursor binds actor, role and filter, preserving full PostgreSQL timestamp precision plus UUID ordering. Return `{items,nextCursor}`. Changing filters resets cursor in UI.

Statistics query: both from/to YYYY-MM-DD, or omit both for the last seven Dhaka days including today; valid inclusive period1–90 days. Return `{actorRole,timeZone:"Asia/Dhaka",currency:"BDT",population:"COMPLETED_ONLY",from,to,daily,totals}`. Passenger daily `{date,trips,farePoysha,discountPoysha}`; driver daily `{date,trips,seats,capacity}`, totals additionally utilization0–1. Zero days are explicit. Canceled rows contribute zero; pool capacity counted once per distinct completed pool. No earnings/revenue/paid claims.

## Errors

400 INVALID_INPUT (wrong type, malformed UUID/cursor/date, unexpected fields), 401 AUTH_REQUIRED/INVALID_CREDENTIALS, 403 CSRF_REJECTED/FORBIDDEN_ROLE, 404 NOT_FOUND, 422 INVALID_SEAT_QUANTITY/ROUTE_UNSUPPORTED, 409 ACTIVE_RIDE_EXISTS/QUOTE_EXPIRED/QUOTE_ALREADY_USED/DRIVER_OFFLINE/ACTIVE_POOL_EXISTS/REQUEST_UNAVAILABLE/POOL_CLOSED/POOL_CAPACITY_EXCEEDED/INVALID_TRANSITION/CANCELLATION_CLOSED/IDEMPOTENCY_KEY_REUSED/ACCOUNT_EXISTS, 429 RATE_LIMITED, safe500 INTERNAL_ERROR, 503 TEMPORARILY_UNAVAILABLE/COMMAND_OUTCOME_UNKNOWN. Only authorized driver capacity conflicts expose requestedSeats/availableSeats. API transport bounds JSON to64KiB, timeout5seconds, forbids escaping its fixed upstream origin. Server failure logs contain safe event/requestId/code, not private payloads.
