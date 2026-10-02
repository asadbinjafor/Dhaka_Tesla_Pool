# Proposed relational model — current adapted contract

> Current context: use NestJS services/transaction-scoped repositories, Next.js +
> Tailwind and required en/bn + two themes + graphs. Core domain rules below remain
> proposals subject to actual decision approval. API locale-independent; only UI
> paths are locale-prefixed. Original detailed v2 archive is historical, not active.


PRD §6 requires relationships, constraints, indexes and types; it does not prescribe these exact tables. This is a design to implement after approval, not runnable migrations or a verified database.

## Tables and authority

| Table | Main fields / responsibility |
|---|---|
| users | UUID id; unique normalized email; display_name; password_hash; immutable role; created_at. |
| sessions | Use the chosen PostgreSQL session adapter's actual schema and expiry index; no duplicate custom store. |
| driver_profiles | user_id PK/FK; online flag; permanent parent coordination row. |
| vehicles | id; driver_id UNIQUE FK; display_name; positive capacity; UNIQUE(id, driver_id). Owner/capacity immutable in this MVP. |
| zones | Stable ID, display name, supported/selectable labels. |
| route_rules | ID/version; pickup/destination; immutable compatibility group/version and demo_distance_m; active-for-new-quotes flag. |
| fare_quotes | ID; owner_id; route rule/version; immutable route, group/version, quantity, policy and complete price basis; currency; created_at/expires_at; UNIQUE(id, owner_id). |
| ride_requests | ID; passenger_id; quote_id UNIQUE; immutable copied booking facts; status; version; final_fare_snapshot nullable; finalized_at; matched/arrived/started/completed/cancelled timestamps; derived ended_at. |
| pools | ID; driver_id; vehicle_id; immutable pickup/group/version and capacity_snapshot; status/version; arrived/started/completed/cancelled timestamps; derived ended_at. |
| pool_memberships | ID; pool_id; ride_request_id UNIQUE; joined_at. No competing member status field. |
| ride_events | ID; at least one of ride_request_id/pool_id; actor; event type; previous/next states; aggregate versions; recorded_at; typed internal metadata. |
| idempotency_keys | actor_id, action_scope, key, target_ref, request_hash, small committed receipt, created_at; UNIQUE(actor_id, action_scope, key). |

No passenger_history/driver_history copies. Canonical terminal rows and membership links remain. Quote-to-request duplication is intentional immutable historical snapshotting: the service copies and validates correspondence once; no update endpoint can modify either. Composite owner FKs do not prove all duplicated price/route facts agree, so test that mapping independently.

`final_fare_snapshot` stores policy version, currency, seats, demo distance, unit/base/distance/discount values and total. Validate exact integer arithmetic; use typed columns for values being indexed and a versioned JSON breakdown where appropriate. Do not sum raw pg bigint/numeric results as unchecked JavaScript numbers; serialize counts/money into the approved bounded safe-integer API representation or reject overflow. The small demo amounts fit that representation; arbitrary future scale does not justify silent precision loss.

## Constraints to implement

1. Required IDs, status, role, quantity and ownership fields are NOT NULL; normalize email once; allowed role/status domains; requested seats are integer 1–3; capacity positive; pickup differs from destination.
2. Partial unique passenger_id for request status REQUESTED/MATCHED/DRIVER_ARRIVED/STARTED.
3. Partial unique driver_id and vehicle_id for pool status ACCEPTED/DRIVER_ARRIVED/STARTED.
4. UNIQUE membership.ride_request_id for lifetime assignment; UNIQUE request.quote_id for lifetime consumption. Do not delete membership to release a seat.
5. Composite FK pools(vehicle_id, driver_id) → vehicles(id, driver_id). Individual FKs alone prove existence, not the pairing. Add matching referenced UNIQUE constraint.
6. Composite FK ride_requests(quote_id, passenger_id) → fare_quotes(id, owner_id), with the referenced UNIQUE constraint. It supplements API ownership checks; it does not replace them.
7. Restrictive deletes on historical relationships; no cascade deleting trip evidence. Roles, ownership, quote facts and capacity are not mutable through the MVP API.
8. Positive/zero-bounded monetary values; final snapshot and finalized_at must exist in DRIVER_ARRIVED/STARTED/COMPLETED. CANCELLED can have a preserved final snapshot or none, depending on cutoff timing.
9. For terminal state, exactly the appropriate completed_at or cancelled_at is set; both remain null in active states. Define ended_at as a generated stored COALESCE(completed_at, cancelled_at) value. It is non-null for terminal records and immutable once terminal.
10. Event CHECK: request_id IS NOT NULL OR pool_id IS NOT NULL. When both references exist, service logic must verify their actual association under the transaction; no ordinary cross-row CHECK claim. No unrestricted event metadata serialization.
11. Idempotency uniqueness is exactly actor/action/key, all non-null; target_ref is non-null normalized text (e.g. collection:ride_requests for creation; ride:<id> or pool:<id> otherwise) bound into request_hash. Same key with another target/body is conflict. Do not create a second incompatible uniqueness rule.
12. Quote expiry exceeds creation time. Quote validity is evaluated at locked validation using the server's actual wall-clock, not a client date.

Current occupancy is a SUM across joined rows. A row CHECK does not enforce that aggregate; all supported allocation/cancellation/lifecycle writes must use docs/06-CONCURRENCY.md. Protected application writes plus independent FK/unique constraints are the claimed design, not immunity against privileged arbitrary SQL.

## Seat and fare history

Active reserved seats = SUM(request.seats) for members in MATCHED/DRIVER_ARRIVED/STARTED. REQUESTED, CANCELLED and COMPLETED consume zero current capacity. Seats served = SUM(COMPLETED member seats) in a COMPLETED pool. A canceled member remains linked for history but contributes neither served seats nor completed fare.

Never treat an old membership as permission to accept/reactivate a terminal request. Arrival freezes each price using its immutable quote/booking basis and the same locked current-membership set. Canceled-after-arrival price stays stored; its policy charge is zero. No payment ledger is introduced.

## Index/query alignment

Owned history: actor + ended_at DESC + id DESC for terminal rows; filter by actor in SQL before pagination. The cursor includes full database timestamp precision and ID; do not truncate cursor timestamps through JavaScript Date. Cursor parsing validates length/types/filter binding; cursor contents never determine authorization.

Dispatch: REQUESTED status plus immutable route/group/version and creation order; membership: pool_id plus unique request_id; events: aggregate identifier/order; quote/session expiry; the active uniqueness indexes above. Use actual queries and EXPLAIN to justify indexes; avoid speculative indexes.

## Seed and lifecycle

Seed Jashim/Bullet(3), Nusrat/Rafiq/Shirin with hashed passwords supplied through explicit demo configuration. Route/rate constants are invented fixtures. Normal, empty, last-seat (Rafiq=2), cancel and historical-statistics fixtures are separate cases. A second named driver is only needed for cross-driver ownership tests, not the same-Jashim two-instance race.

Seed is opt-in, idempotent and non-destructive on repeat startup. Existing users' passwords/roles and history are not overwritten to restore a demo. Reset is verified-local/test only and explicitly authorized; no public reset route. Maintain separate test database/credentials and never accept an arbitrary destructive DATABASE_URL.

Live timestamps use the database; tests inject a controlled clock at defined boundaries. Do not mutate process-wide fake time during a concurrent test. Asia/Dhaka is the display/report zone; timestamptz stores instants. Relative demo history dates are chosen on first seed and remain unchanged on repeat runs; label it demonstration data.

Generate the actual ERD from implemented migrations and update it with the code. Text proposals and source screenshots do not prove migrations exist.
## Localization boundary
Zone IDs, state enums, role values, currency and numeric poysha are locale-neutral.
Keep configured display labels en/bn (catalog or explicit localized fields) without
translating primary keys. User-supplied names/reasons remain stored as entered. Locale
preference may be stored in a validated cookie; cross-device profile preference is
optional and requires its own explicit column/migration, not an undocumented field.
Do not duplicate trips/fares/memberships by theme or language.

## Implemented access-layer update — 2026-10-02

The user requested Tech-Trolley-style TypeORM database integration. The existing
schema and invariants above remain; the same-connection contract is now implemented
by a TypeORM QueryRunner and transaction EntityManager instead of a standalone
pg.PoolClient. Ordered lock statements, later occupancy reads, receipts and fare/
history snapshots are retained. Numbered SQL/checksums remain authoritative; schema
synchronization is disabled. See IMPLEMENTED_ARCHITECTURE/TYPEORM_DATABASE_AUDIT.
