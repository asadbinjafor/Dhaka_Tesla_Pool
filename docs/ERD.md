# Implemented relational model

Source of truth: dhaka-tesla-pool-backend/migrations/001_initial.sql. Integer poysha, timestamptz,
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

## ORM mapping — 2026-10-02

This unchanged relational schema is mapped by feature-local TypeORM entity classes
under backend src/{auth,rides,pools,history}/entities and src/database/entities.
Camel-case entity properties explicitly map to existing snake-case columns.
Generated ended_at is read-only; user passwordHash/session csrfToken are excluded
from default repository selection. Quote/passenger and vehicle/driver relations
retain composite join columns. SQL migrations/triggers/indexes remain authoritative;
no TypeORM synchronize or schema recreation is permitted.
