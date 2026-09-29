# Business and implementation decisions

**Mixed authority:** U01–U11 in EXTRA_REQUIREMENT_MATRIX are explicit current user choices.
D01–D29 below remain engineering proposals unless existing approval is found; confirm
material unsettled business decisions once in the first audit. Do not ask the user to
reapprove Next.js/NestJS/Tailwind/PostgreSQL, graphs, themes, languages or the PDF Git flow.
D30 is updated to the user's required charts. Latest policy supersedes old archived guidance.

Business choices below are proposed policy unless explicitly marked user-selected. None becomes an exact PRD rule merely by appearing in this document. Keep a decision log when any choice changes and update schema, API, UI, tests and README together.

## Business baseline

| ID | Proposed decision | Reason / observable consequence |
|---|---|---|
| D01 | One active request per passenger | Protect with a partial unique index, not a client-only check. Active = REQUESTED, MATCHED, DRIVER_ARRIVED, STARTED. |
| D02 | One fixed vehicle per seeded driver; one active pool per driver/vehicle | Bullet has capacity 3. No ownership transfer or capacity editing in the MVP. |
| D03 | A ride request does not reserve seats; driver acceptance does | Waiting is explicitly unconfirmed. Test acceptance races, not only request creation. |
| D04 | Same pickup and same configured compatibility group | Banani→Mohakhali/Gulshan 1/Gulshan 2 in demo group BANANI_V1. Real road overlap is not asserted. |
| D05 | Driver creates the pool on first accept; later compatible accepts join it | Driver must be online. If current pool is not accepting, no new booking. |
| D06 | Join and passenger cancellation stop at DRIVER_ARRIVED | One visible boundary; no joins or passenger cancellations after it. D09 still permits driver whole-pool cancellation before start. |
| D07 | Arrival freezes each current member's price | Estimates can change before arrival; solo maximum is disclosed before booking. |
| D08 | One booking can request 1–3 seats; discount needs ≥2 distinct bookings | Quantity != booking count. A lone two-seat booking is not pooled. |
| D09 | Driver may cancel the entire pool in ACCEPTED or DRIVER_ARRIVED | All noncancelled member requests become CANCELLED; preserve reasons and price evidence. |
| D10 | No cancellation fee | Cancellation-policy chargePoysha on any canceled request is zero; cash collection is NOT_TRACKED. An already frozen fare snapshot remains immutable. |
| D11 | Canceling the last current member closes the pool | Driver/vehicle is then eligible for a new pool. |
| D12 | Pool completion completes all noncancelled members together | Matches supplied prototype; no separate passenger drop-off execution. |
| D13 | Do not reassign a previously assigned request | A canceled user makes a new request. One membership per request for its lifetime. |
| D14 | Explicit offline action rejected with active pool | Closing a browser does not imply offline; heartbeat/presence is deferred. |
| D15 | No automatic waiting-request expiry in MVP | Waiting request remains cancelable; no invented arrival SLA. |
| D16 | Cash-only first release | Choose the Cash option allowed by PRD §5, matching the latest Dark/Light demo. Do not add a wallet silently. |
| D17 | Public signup creates only PASSENGER | Drivers are seeded; driver registration/admin approval is outside the brief. |
| D18 | Real timestamps; display/report in Asia/Dhaka | Fixed dates belong only to tests; no synthetic live clock. |
| D19 | Poll active resources every ~5 seconds while visible | Configurable UI refresh, not a latency SLA. Refetch on focus/mutation; slow/back off errors. |
| D20 | Quotes are owner-bound, immutable, valid for 5 minutes at request creation | Request references a server quote. No re-expiry after successful booking. A consumed quote cannot create a second ride. |
| D21 | Successful business commands have idempotency keys | UNIQUE(actor_id, action_scope, key); target_ref is bound in the canonical request hash. Replaying an authorized stored success bypasses fresh-state guards but never repeats side effects. |

## Fare policy v1 — invented fixtures, not real transport prices

| Route | Demo distance | Solo, 1 seat | Pooled, 1 seat |
|---|---:|---:|---:|
| Banani → Mohakhali | 2 km | 4000 poysha = ৳40 | 3000 poysha = ৳30 |
| Banani → Gulshan 1 | 3 km | 5000 poysha = ৳50 | 4000 poysha = ৳40 |
| Banani → Gulshan 2 | 4 km | 6000 poysha = ৳60 | 5000 poysha = ৳50 |

```text
base per seat = 2000 poysha
rate per demo km per seat = 1000 poysha
discount per seat = 1000 poysha, only with ≥2 accepted, noncancelled bookings
fare = seats × (base + demoDistanceKm × rate − applicableDiscount)
```

Store integer poysha and integer demo distance meters. The three configured distances are exact kilometers, so v1 has no fractional-distance rounding. Reject unsupported configurations or add an explicit versioned rounding policy before supporting them. Store base, distance component, discount, total, currency, seat quantity and policy version in price snapshots.

Waiting: show owned quote's solo maximum and potential pooled price, clearly not a confirmed discount. Matched: derive current estimate from current pool membership. Arrival: freeze all current members' final snapshots atomically. Completion: reuse snapshots, do not reprice. Cancellation after driver arrival: preserve finalized snapshot for history, but cancellation-policy chargePoysha is zero. Fare amounts are not proof that cash was collected.

## Selected stack and remaining tooling decisions

Next.js App Router + TypeScript; NestJS/Node REST API; PostgreSQL; `pg` parameterized SQL repositories; SQL migrations through one maintained migration tool; cookie sessions stored in PostgreSQL; Argon2id; TanStack Query; Tailwind CSS mapped to the selected Dark/Light tokens/layout, complete en/bn localization; unit tests, real-Postgres integration tests, and Playwright E2E.

A conventional ORM is an alternative, not forbidden. This baseline chooses explicit SQL because the critical lock/constraint behavior should be visible and explainable. Switching to Prisma/Kysely requires an ADR and retaining exactly the same transaction semantics. Do not use multiple ORMs or independent transaction owners.

Use supported stable dependency versions verified in phase 01, pin them and the package-manager version. No beta/canary/legacy versions by default. Source mandates React/Next.js and Node; it does not mandate these remaining libraries.

## Approval log

| Date | Decision IDs | Approved/changed by user | Notes |
|---|---|---|---|
| Current request | U01–U11 | Selected by user | Next/Nest/Tailwind/Postgres; graphs, two themes, en/bn; audit-first; PDF Git; video later. |
| Pending/reconcile | D01–D29, remaining tooling, locale-policy details | Not presumed approved | Review existing approvals, resolve material choices once in phase 00. |

## V2 clarification proposals (D22–D30)

| ID | Proposed rule | Consequence |
|---|---|---|
| D22 | Exact replay and a fresh command are different | Same key + same target/body replays the committed receipt after identity/ownership checks. A new key applies normal preconditions; consumed transitions return 409. Availability set-to-same-value alone may return a no-op. |
| D23 | Stable detail routes own lifecycle tracking | /passenger/rides/[id] and /driver/pools/[id] keep terminal screens readable; /current discovers an active ID or null. |
| D24 | Owned ride representation depends on request AND pool versions | Own status can stay MATCHED while membership changes estimate/seats; request.version alone is insufficient. No cross-user state in the response. |
| D25 | Quote validation happens after relevant lock waits | Capture actual DB wall-clock once after locking the quote. Require expires_at > validated_at. A successful prior booking is replayable after expiry; a booked request does not expire with its quote. |
| D26 | Historical pricing and compatibility stay version-bound | Copy the immutable quote facts to the immutable booking snapshot; acceptance/arrival use that version, not the live price catalog. Pool compatibility compares pickup, group and group version. |
| D27 | One terminal ordering field for history | ended_at derives from completed_at/cancelled_at. Cursor order is ended_at DESC, id DESC with full DB precision and actor/filter scope. |
| D28 | Prices are not payment receipts | chargePoysha=null while estimated; final total after arrival; zero after cancellation. collectionStatus=NOT_TRACKED always. Retain any final snapshot after cancellation. |
| D29 | Waiting hint is an aggregate observation, not a dispatch promise | Current/detail response may show NO_ELIGIBLE_DRIVER, WAITING_FOR_ACCEPTANCE or UNKNOWN from a coherent authorized read; never expose a global driver/passenger dataset. |
| D30 | Charts are USER-REQUIRED in the current scope | Build DB-backed graphs in both languages/themes. Core integrity comes first, but do not mark all user scope complete without them or an explicit later scope change. |

Catalog changes only affect new quotes. Existing quote validity is its owner/version/expiry, not a second silent fare recalculation. No live route/price administration is added. Use an immutable compatibility_group_version snapshot in the quote/request/pool; a mismatched version cannot join an existing pool under this proposal. A migration changing future configuration does not rewrite earlier rows.

V1's phrase 'amount owed zero' is represented as cancellation-policy **chargePoysha=0**, not a claim that a debt was refunded or cash was collected. Show the prior finalized price only as historical evidence. This clarification adds no payment ledger.

## Current presentation proposals (not exact PDF rules)
- Stable UI paths gain `/en` or `/bn` prefix; API paths stay `/api/v1`. Translation
  changes display only, never IDs, authorization, quote pricing or transaction identity.
- Default locale en when no explicit preference; URL locale > valid saved cookie > en.
  An explicit language choice is remembered. Both languages use LTR layout.
- Dark is the selected initial design; explicit Light/Dark preference is remembered.
  Optional system mode is not required. Theme is independent of locale.
- Format numbers/date/currency with en-BD or bn-BD, BDT and Asia/Dhaka; store numeric
  poysha/UTC timestamps. Proposed locale strategy is detailed in 07-UI-I18N.md.
- Only canonical business payload participates in mutation idempotency hashing. Locale,
  translated labels and theme do not create a new command or change a retry's identity.
