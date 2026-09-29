# Proposed API contract — current adapted contract

> Current context: use NestJS services/transaction-scoped repositories, Next.js +
> Tailwind and required en/bn + two themes + graphs. Core domain rules below remain
> proposals subject to actual decision approval. API locale-independent; only UI
> paths are locale-prefixed. Original detailed v2 archive is historical, not active.


REST and these paths are implementation choices, not names mandated by the PRD. All paths below are relative to /api/v1. Use runtime-validated shared DTO contracts, not unrestricted ORM/DB rows. State table: docs/12-STATE-CONTRACT.md.

## Endpoints

| Method/path | Actor | Semantics |
|---|---|---|
| GET /auth/csrf | Public/session | Selected CSRF library's bootstrap; no business mutation. |
| POST /auth/register | Public | Passenger only; reject role/user-ID elevation. |
| POST /auth/login | Public | Verify, rotate and save session before response. |
| POST /auth/logout | Authenticated | Destroy server session, clear correct cookie attributes. |
| GET /me | Authenticated | Server-derived identity/role; no secrets. |
| GET /zones | Authenticated | Catalog and supported route selections. |
| POST /fare-quotes | Passenger | Validated pickup/destination/seats; immutable owner-bound quote and price basis; five-minute validity proposed. |
| POST /ride-requests | Passenger | {quoteId,paymentMethod:"CASH"}; successful quote consumption; idempotent. |
| GET /ride-requests/current | Passenger | Own active request or data:null. Discovery only; not terminal tracking. |
| GET /ride-requests/:id | Owner passenger | Stable owned detail in all states, including terminal; safe aggregate pool info only. |
| POST /ride-requests/:id/cancel | Owner passenger | Nonempty bounded reason; state/ownership checks and atomic release. |
| GET /ride-history | Passenger | Own terminal requests; ended_at keyset pagination; status/search filters. |
| PATCH /driver/availability | Driver | {online:boolean}; guard active pool; lock persistent driver row. |
| GET /driver/requests | Driver | Relevant REQUESTED rows, oldest first; capacity/eligibility hints are observations. |
| POST /driver/requests/:id/accept | Driver | Own driver/vehicle only; create/join under common locks; do not trust client pool/driver/fare. |
| GET /driver/pools/current | Driver | Own active pool or null; discovery only. |
| GET /driver/pools/:id | Owning driver | Stable detail in all states; appropriate current/historical roster. |
| POST /driver/pools/:id/arrive | Owning driver | ACCEPTED → DRIVER_ARRIVED, close joins/cancel cutoff, freeze prices. |
| POST /driver/pools/:id/start | Owning driver | DRIVER_ARRIVED → STARTED. |
| POST /driver/pools/:id/complete | Owning driver | STARTED → COMPLETED; current members complete. |
| POST /driver/pools/:id/cancel | Owning driver | ACCEPTED/DRIVER_ARRIVED only; required reason; all current members cancel. |
| GET /driver/trip-history | Driver | Own terminal pools with historical links and deterministic pagination. |
| GET /driver/vehicle | Driver | Own immutable vehicle/capacity. |
| GET /statistics/passenger | Passenger | Selected extension: own completed metrics, validated date range. |
| GET /statistics/driver | Driver | Selected extension: own completed pools/seats/utilization; no revenue claims. |

In NestJS, define/test static /current and parameterized /:id routes so static routes are not swallowed by ID routes; do not rely on only a frontend route guard. Use UUID validation; malformed IDs are 400, unknown or non-owned private resources 404. Never return a foreign ID/name in the error. Dispatch hides other drivers' assigned records; a request becoming unavailable uses a generic REQUEST_UNAVAILABLE response.

## Error and validation mapping

400 INVALID_INPUT for malformed body, wrong scalar types, invalid ID/cursor, unexpected write fields (including client fare/identity/status); 401 AUTH_REQUIRED; 403 FORBIDDEN_ROLE or CSRF_REJECTED; 404 NOT_FOUND for unknown/non-owned private resources; 422 ROUTE_UNSUPPORTED or INVALID_SEAT_QUANTITY for typed but domain-invalid selections; 409 named business/state/idempotency conflicts; 429 RATE_LIMITED; 500 INTERNAL_ERROR; 503 TEMPORARILY_UNAVAILABLE for known transient availability failure or COMMAND_OUTCOME_UNKNOWN when commit acknowledgement is uncertain.

A syntactically numeric quantity of 0/-1/4/1.5 is 422; a quantity string is 400. Do not silently coerce untrusted write fields. Proposed bounds: name 1–100 trimmed characters, cancellation reason 1–200, idempotency key UUID; cap total JSON body and queries. Set actual password/session/CSRF policy with the selected libraries in phase 01/03 rather than inventing a custom protocol.

```json
{"error":{"code":"POOL_CAPACITY_EXCEEDED","message":"This request is still waiting; not enough seats remain.","requestId":"correlation-id","details":{"requestedSeats":1,"availableSeats":0}}}
```

Other business codes: ACTIVE_RIDE_EXISTS, QUOTE_EXPIRED, QUOTE_ALREADY_USED, DRIVER_OFFLINE, ACTIVE_POOL_EXISTS, REQUEST_UNAVAILABLE, POOL_CLOSED, INVALID_TRANSITION, CANCELLATION_CLOSED, IDEMPOTENCY_KEY_REUSED. Only owning driver receives detailed relevant capacity; passenger DTOs contain safe aggregates. Detailed DB diagnostics stay redacted in server logs.

## Owned detail and representation version

Illustrative MATCHED response:
```json
{
  "data": {
    "id":"ride-id", "status":"MATCHED", "seats":1,
    "route":{"pickup":"Banani","destination":"Mohakhali","isDemoGeography":true},
    "fare":{
      "kind":"ESTIMATE", "currency":"BDT", "basePoysha":2000,
      "distancePoysha":2000,"discountPoysha":1000,"totalPoysha":3000,
      "soloMaximumPoysha":4000,"chargePoysha":null,"collectionStatus":"NOT_TRACKED"
    },
    "pool":{"id":"pool-id","capacity":3,"reservedSeats":2,"ownSeats":1},
    "driver":{"displayName":"Jashim","vehicleName":"Bullet"},
    "allowedActions":["CANCEL"],
    "representationVersion":{"request":2,"pool":3}
  }
}
```

Request version advances for direct request changes. Pool version advances for membership/lifecycle changes; that can change an unchanged MATCHED request's estimate. Compare both versions for the SAME resource/immutable pool, not just request.version or a wall-clock. A canceled unassigned request has pool version 0. Read the entire DTO in one SQL snapshot or a short read-only consistent transaction. Internal event metadata, other member IDs/names/statuses/fares and arbitrary SQL rows never enter passenger JSON.

After arrival fare.kind=FINAL and chargePoysha=final total; after cancellation fare.kind=CANCELLED and chargePoysha=0. Any preserved final snapshot is explicitly labeled historical, not a payable amount. collectionStatus=NOT_TRACKED never changes; this MVP cannot assert cash receipt. Terminal passenger details show a historical trip summary, not live seats in a later pool.

REQUESTED details may include matchingHint={state:NO_ELIGIBLE_DRIVER|WAITING_FOR_ACCEPTANCE|UNKNOWN,asOf:...}. Compute from compatible route/group version, online driver, capacity and accepting/no-current-pool state in the authorized read; no precise ETA, guarantee or directory of drivers. An unavailable observation is UNKNOWN, not an invented empty driver fleet. Drivers with a closed/full/incompatible active pool are not eligible. For the proposed fixed Banani service only configured pickups are eligible.

## Stable route tracking

After create returns resourceId, navigate to /passenger/rides/<id> and poll GET by ID through terminal state. /passenger/ride is an active resolver; null means no active request, not proof of cancellation/completion. Likewise /driver/pool resolves to /driver/pools/<id>. Completion/cancellation screens stay available on refresh and from history. Do not require a client-only last-ride object.

## Command identity, replay and uncertain outcomes

Unique DB identity is (actor_id, action_scope, key). Save target_ref and hash of canonical action+target+validated normalized body; object-key ordering must not affect semantic equality. Same actor/action/key with another target or body → 409 IDEMPOTENCY_KEY_REUSED. Creation uses target_ref=collection:ride_requests; assigned commands use ride:<id> or pool:<id>.

Order: authenticate/session/CSRF → validate syntax → establish durable ownership (not 'currently active') → claim/check key → replay an authorized stored success OR run fresh-action business guards. In particular a successful create retry must replay even when its quote has expired/been consumed or the ride has completed. Do not run QUOTE_ALREADY_USED or state guards ahead of replay. Resource ownership is rechecked; replay cannot cross users.

Successful receipt is small: {resourceId,action,appliedVersion}. Same-key replay returns that receipt, not a stale full ride snapshot. Fetch stable detail for current state. A new key on an already-consumed transition fails normal preconditions; it never reactivates anything. An unchanged availability boolean is an allowed no-op; it does not emit a duplicate change event.

Claim and receipt are in the SAME transaction as the mutation. Only successful commands persist; failed attempts roll back claims and effects. Do not purge successful keys during this small assessment MVP; a retention/cleanup policy is future scope. An in-flight placeholder is never committed as success.

Known transaction-abort errors may be retried within the bounded policy. A broken connection/HTTP timeout while COMMIT may have succeeded is UNKNOWN: discard the connection, retain the same key, re-authenticate, and reconcile/retry with that key on a fresh connection. A failed rollback attempt does not prove absence of the original commit. No new intent/key or 'not booked' reassurance based only on missing acknowledgement.

## History and query bounds

Proposed limits: max 50 rows per page, statistics last 7 Asia/Dhaka days including today by default, max 90 selected days. History order is ended_at DESC,id DESC; cursor contains full DB-precision ended_at, ID and canonical filter binding. Validate, never trust actor IDs in a cursor. Canceled rows have ended_at too; no completed_at-only cursor.

Poll queries consume abort signals. On session/account change, increment local generation, cancel in-flight reads, clear private queries/drafts/intents and discard responses from the old generation. Abort of a browser fetch does NOT cancel a server-side committed business transaction; reconcile mutations using the original key after authentication. Authenticated endpoints are private/no-store throughout the gateway.
## Bilingual frontend contract
Return stable error codes plus safe structured parameters/field identifiers. Frontend
maps them into en/bn messages. Never render raw Nest/SQL errors. Canonical status enums,
IDs, integers and receipt data do not change with locale. Date/amount localization is
presentation only. UI language/theme must not be included in a business-command hash.
If an endpoint deliberately localizes descriptive fields, include locale in cache
identity and keep receipt reconstruction/canonical values independent of it.
The error filter must cover guard/pipe/service failures as well as controller errors.
Quote input changes invalidate/requote; changing language/theme alone does NOT.
