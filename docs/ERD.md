# Implemented relational model

Source of truth: database/migrations/001_initial.sql. Integer poysha, timestamptz,
version-bound JSON fare facts, immutable terminal records. Capacity is three passengers;
driver is separate. Occupancy requires coordinated transactional parent locks, not
an invalid cross-row CHECK. No duplicate history or payment ledger.

```mermaid
erDiagram
  users ||--o{ sessions : identity
  users ||--o| driver_profiles : driver_role_fk
  driver_profiles ||--|| vehicles : fixed_vehicle
  users ||--o{ fare_quotes : owns
  zones ||--o{ route_rules : geography
  route_rules ||--o{ fare_quotes : version_basis
  fare_quotes ||--o| ride_requests : composite_owner_fk
  users ||--o{ ride_requests : owns
  vehicles ||--o{ pools : composite_driver_fk
  driver_profiles ||--o{ pools : drives
  pools ||--|{ pool_memberships : groups
  ride_requests ||--o| pool_memberships : lifetime_assignment
  ride_requests ||--o{ ride_events : history
  pools ||--o{ ride_events : history
  users ||--o{ idempotency_keys : command_namespace
```

Indexes match active resources, dispatch by group/pickup/creation, owned terminal
ended_at+ID keyset, roster, aggregate events, sessions/quotes expiry. CHECK/FK/unique
constraints reject invalid owner pairs, driver roles, quantities, lifecycle terminal
timestamps and unlinked events. Immutable triggers protect quotes, booking facts,
vehicle capacity/owner and finalized/terminal evidence. Application services enforce
cross-row state/capacity, copy consistency and event associations under one client.
