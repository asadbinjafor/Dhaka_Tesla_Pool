# Proposed transaction/concurrency protocol — current adapted contract

> Current context: use NestJS services/transaction-scoped repositories, Next.js +
> Tailwind and required en/bn + two themes + graphs. Core domain rules below remain
> proposals subject to actual decision approval. API locale-independent; only UI
> paths are locale-prefixed. Original detailed v2 archive is historical, not active.


PRD §12 requires the last seat to remain consistent. This design is NOT a tested backend: no business API, PostgreSQL migrations or full-stack integration tests are delivered by the kit. Confirm with real database tests during implementation.

## Invariants and write boundary

For each active pool, SUM(seats of MATCHED/DRIVER_ARRIVED/STARTED requests) <= capacity_snapshot. One request has at most one lifetime membership; one passenger has at most one active request; one driver/vehicle has at most one active pool. No new members after arrival. Final fare snapshots never change. Cancellation preserves history and has zero policy charge. Completion only affects currently STARTED members, never earlier canceled ones.

All supported writes use API services and coordinated transaction-scoped repositories. Read-only SQL may use the pool; transaction callbacks must use the SAME checked-out pg client. Seed fixtures are nonconcurrent test/demo setup, not a public bypass. No supported endpoint can change a vehicle owner/capacity or rematch a previously assigned request.

## Lock and statement order

Business transaction isolation is explicitly READ COMMITTED. Order for allocation and assigned-pool mutations:

```text
BEGIN
  → idempotency actor/action/key claim (one key per command)
  → persistent driver_profiles row lock
  → vehicle row lock
  → existing pool row lock, if present
  → affected ride_request rows in deterministic ID order
  → validated membership/price/event writes
  → committed receipt
COMMIT
```

The driver row exists even when there is no active pool. It must be locked BEFORE looking for/creating the active pool. After waiting on the driver lock, use LATER SQL statements for pool discovery/occupancy. Each statement at READ COMMITTED has its own snapshot (official PostgreSQL reference T3).

**Do not combine lock acquisition and membership COUNT/SUM in one CTE/SQL statement as an optimization.** A statement may have taken its read snapshot before it waited. Waiting for a row lock does not refresh every unrelated read in that statement. Complete the lock statement first, then read current membership in a new statement. This warning is an implementation hazard inferred from snapshot semantics, not a reproduced bug in an absent application.

No path may hold a request row and then wait for its driver. Assigned owner association is stable after first membership because rematching and ownership transfer are excluded. Lock multiple affected requests in sorted ID order. No network/map/email work inside the transaction.

## Acceptance — precise command semantics

1. Authenticate/CSRF, validate driver role/input/key and static target authorization policy. Use generic REQUEST_UNAVAILABLE for a foreign assignment; do not reveal another driver's identity.
2. BEGIN on one client; claim key under UNIQUE(actor_id,action_scope,key), with canonical target_ref/body hash.
3. A matching committed receipt is replayed after durable ownership validation even if its pool is now terminal. Do not require the old pool to be the driver's current pool. A changed target/body is conflict.
4. With no receipt, lock driver then vehicle; in a later statement find/lock the current pool. Lock target request; re-read request and lifetime membership.
5. A FRESH command requires REQUESTED with no membership. Already assigned, canceled or completed means REQUEST_UNAVAILABLE; there is no terminal early-success branch under a new key.
6. Require online driver; route's snapshotted pickup/group/version compatible with vehicle service and current pool. Existing pool must be ACCEPTED. Read current member seat SUM in a new statement after parent coordination.
7. Check reserved+requested<=capacity_snapshot (or fixed vehicle capacity for a new pool). Create pool only once preconditions are satisfied; unique active-resource constraints remain backstops.
8. Insert membership; request→MATCHED; increment request and pool versions; write domain events. Remaining members' estimates are derived from their immutable price bases plus current member count; pool version invalidates their representations.
9. Store receipt and COMMIT. Return only after known success. On known rollback, no partial membership/status/events/receipt survive. On unknown commit acknowledgement, use reconciliation below.

A losing last-seat request stays REQUESTED. Same key replays; a different key cannot bypass a lifetime membership. Do not increment versions/events for an idempotent receipt replay.

## Request creation and quote cutoff

Creation uses key→owned quote lock→validate→insert new request. This path acquires NO driver/vehicle lock. The active-request partial unique index arbitrates concurrent creations for the same passenger. A single quote cannot create another request after its first trip ends.

After quote lock is acquired, capture DB clock_timestamp() once as validated_at. Require expires_at > validated_at. CURRENT_TIMESTAMP/now() mean transaction-start time, so they are not this proposed after-lock expiry check (T13). Exact equality is expired. Replay an existing successful create before these fresh-quote guards. Expiry does not cancel a booked waiting request or its future acceptance.

Future route/pricing catalog changes do not rewrite the quoted booking basis. The trip's configured compatibility version and fare maximum remain what was approved in the quote. No live routing service is introduced.

## Passenger cancellation and discovery race

Assigned request: identify its immutable pool/driver association through an owned read, claim key, then driver→vehicle→pool→request and revalidate. A fresh passenger cancellation is valid only in REQUESTED/MATCHED. In the assigned case pool is ACCEPTED. Mark just that request canceled, preserve membership, set terminal time and write one cancellation event. Update pool version for remaining estimates; close pool when zero current members remain.

Initially unassigned: a request-only path may lock and re-read. If still REQUESTED with no membership, cancel there. If acceptance appeared before the lock was obtained, rollback the ENTIRE attempt (including key claim), discover the association again, and retry driver-first. Never hold the request while acquiring driver. Bound discovery retries; report classified transient conflict rather than spin forever.

Same-key completed cancellation replays; a fresh key on a terminal request returns INVALID_TRANSITION. Ownership is always checked. An already canceled member is preserved unchanged when a later driver cancellation/complete affects other members.

## Arrival/start/complete/driver cancellation and availability

Reuse parent locks plus sorted current-member request locks. See docs/12-STATE-CONTRACT.md for exact preconditions and changes. Arrival freezes prices from ONE membership snapshot; joining or passenger cancellation either wins before it or fails after it. Driver cancellation in ACCEPTED/DRIVER_ARRIVED remains allowed and preserves final price evidence while policy charge=0. No driver cancel after STARTED.

Explicit availability change locks driver first. Going offline fails while any active pool exists; closing a browser is not this command. Setting the already-current availability is a no-op with no duplicate change event. Request creation does not reserve seats and cannot satisfy the capacity test by itself.

## Idempotency and failures

One uniqueness definition everywhere: UNIQUE(actor_id, action_scope, key); target_ref participates in request_hash, not a second incompatible key namespace. INSERT ON CONFLICT may wait for another identical transaction; after it resolves, inspect the committed receipt or obtain the claim. No unfinished placeholder is durably committed. Keep one key per command, not per SQL substep.

Successful receipt is minimal {resourceId,action,appliedVersion}; read current detail afterward. Authenticate and verify historical ownership before any replay, but do not reject a valid old receipt solely because the action is no longer currently allowed. Same action/key with another target or canonical body fails. No retention cleanup for successful receipts in this small release; future policy needs its own design.

Classify failures:

- Known business/authorization/validation conflict: rollback, no automatic fresh-intent retry.
- Known transaction abort (such as 40001/40P01): bounded whole-attempt retry, e.g. at most three attempts with jitter and a total deadline. Hold no old transaction across attempts.
- Broken connection or missing acknowledgement while COMMIT is being issued: outcome UNKNOWN, not 'rolled back'. Discard the client, retain the same key, and reconcile/retry on a new authenticated transaction. The committed receipt is the evidence when present. A failed connection cannot prove rollback (T14/T16).

Implement rollback/release in finally safely; do not reuse a broken or indeterminate connection. Document actual lock_timeout, statement_timeout, pool size and total request deadline. No indefinite blocked requests and no forced browser-side seat rollback after an uncertain success.

## Read-model consistency

GET detail composes own ride, safe pool summary, fare estimate and both versions from one statement snapshot. If multiple statements are needed, explicitly use a short REPEATABLE READ, READ ONLY transaction for that representation; merely marking a READ COMMITTED transaction read-only does not make all its statement snapshots identical. Keep this read-model choice separate from the approved READ COMMITTED mutation-lock protocol. Version checks never replace locks.

The representation tuple is (request.version,pool.version), meaningful only for the same immutable request/pool and session. A new member may change pool.version without changing another request.version. Ignore stale response tuples and canceled query generations; terminal records are read through stable IDs.

## Required empirical checks

Rafiq holds two seats. Concurrent Nusrat/Shirin accepts must share the same Bullet pool, Jashim driver row and database, including when sent to two independent API instances using separate sessions for the SAME Jashim identity. A second driver is for the different-request-owner test, not a substitute for this contention.

Use distinct connections, deterministic barriers/lock-wait observation and a bounded test deadline. Two HTTP requests or Promise.all alone do not prove overlap. Do not add production sleeps/public test hooks. Test both winner orderings, no-pool creation, same-request/two-driver, rollback injection, ambiguous commit recovery, quote expiry across a lock wait, and cutoff races. Assert committed memberships, actual seat sums, pool count, request states, immutable fares and events, not only HTTP codes or a cached seat counter.

This protocol is a proposal for all supported write paths, not proof against arbitrary privileged database writes or unspecified future endpoints.
## NestJS and locale implementation notes
Implement a DatabaseModule with a pooled connection provider and explicit transaction
callback passing one PoolClient into every repository call. A decorator/guard alone
does not make service operations transactional. No mutable global transaction client.
Idempotency depends on actor/action/key + canonical business target/payload, not
Accept-Language, theme, translated status/zone labels or UI page language. Test a
language switch during an unresolved successful command: one stored effect/receipt.
Reference markers T3/T13/T14/T16 above refer to primary PostgreSQL/pg explanations
retained in SOURCE_REFERENCES.md; they are not claims of a newly run database test.

## Implemented access-layer update — 2026-10-02

The user requested Tech-Trolley-style TypeORM database integration. The existing
schema and invariants above remain; the same-connection contract is now implemented
by a TypeORM QueryRunner and transaction EntityManager instead of a standalone
pg.PoolClient. Ordered lock statements, later occupancy reads, receipts and fare/
history snapshots are retained. Numbered SQL/checksums remain authoritative; schema
synchronization is disabled. See IMPLEMENTED_ARCHITECTURE/TYPEORM_DATABASE_AUDIT.
