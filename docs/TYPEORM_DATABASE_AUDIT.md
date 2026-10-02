# TypeORM database conversion — 2026-10-02

## Authority and observed baseline

The user explicitly requested the database setup used by the read-only Tech-Trolley
reference project. Its PostgreSQL connection uses Nest ConfigModule/TypeOrmModule,
feature entity classes, injected repositories and separate DATABASE_HOST, PORT,
NAME, USER, PASSWORD and SSL settings. This request supersedes the earlier pg-only
data-access choice, not the ride policies, authentication mechanism or applied schema.

Baseline: pre-release 17fbbc6; tracked files clean; original untracked handoff files
preserved. Feature branch: feature/typeorm-database. The actual original PRD requires
defensible database choices, constraints, migration/seed, Docker, privacy and real
capacity/concurrency tests; it does not require a particular ORM. Current implementation
uses one pg client per transaction, coordinated parent locks, immutable pricing/terminal
triggers and checksum-locked 001_initial.sql. These must survive the conversion.

## Changes and acceptance

- Add current compatible pinned TypeORM/Nest integration and configuration dependencies.
- Map every existing table to feature entities; keep current PostgreSQL names/types/IDs.
- Register TypeORM through Nest; use injected repositories for ordinary entity access.
- Execute coordinated allocation/lifecycle/history SQL through a single TypeORM
  QueryRunner connection; preserve statement order, row counts, driver error codes,
  isolation, timeouts, rollback and unknown-commit recovery.
- Support reference-style connection fields plus retained DATABASE_URL compatibility.
  Keep automatic synchronization disabled: existing composite constraints, partial
  indexes, generated columns, triggers and migration checksums remain authoritative.
- Retain explicit non-destructive seed and migration commands, Docker and all API/UI
  contracts. No schema migration or data reset is needed to change the access layer.
- Execute build/type/lint, unit and isolated real PostgreSQL/HTTP/concurrency suites,
  ORM relation/CRUD/config/transaction tests and available production browser gates.
- Verify hashes of existing local data, applied SQL and immutable references before/after.

Status at audit: implementation and new verification NOT_RUN. Historical prior PASS
results are not proof of this change. Video remains DEFERRED_BY_USER.

Sources: actual Tech-Trolley app.module.ts/users entity/service/.env.example; current
application database/auth/rides/pools/history sources, existing DB/race tests and PRD.
Official API references: https://docs.nestjs.com/techniques/database and
https://typeorm.io/docs/data-source/data-source-options/ .

## Native execution checkpoint

- Both production builds, typechecks and all app/root lint PASS. Unit9/9 PASS.
- Complete native suite33/33 PASS, no skips/cancellations: all28 existing scenarios
  plus5 TypeORM mapping/repository/manager/config/retry/reconnection cases.
- Actual two-instance last-seat races, original allocation rollback/receipt replay,
  lifecycle cutoffs, privacy/CSRF/role/ownership, terminal fares/history and real graphs
  PASS through TypeORM. Dev source compilation/restart/child cleanup also PASS.
- ORM metadata matches all13 actual tables and every column. Composite relations,
  generated ended_at, default hidden password selection and immutable DB protection
  are checked through real repositories, not only inspected decorators.
- EntityManager and SQL share pg_backend_pid and roll back together; read-only
  queries remain REPEATABLE READ. Known serialization retry leaves one insert;
  lost real COMMIT acknowledgement leaves one effect and discards the old PID.
- Field-only settings run migration/repeat seed and real Nest login from unrelated
  cwd. Existing private backend .env was created from retained database identity,
  using split fields; root private .env remains untouched. No credentials in evidence.
- Existing local13-table data hashes unchanged after access-layer conversion and
  actual app-local migration command. Original001 SQL unchanged;84 reference hashes PASS.
- New dependency audit0 reported vulnerabilities; npm ls has no peer failures.
- Initial compilation exposed public TypeORM1 API differences (readonly connection
  options/subpath export/removed onConflict); corrected with public DataSourceOptions
  types, assignment-safe options and orIgnore. Assertions/invariants were not weakened.
- Log: evidence/runs/2026-10-02-typeorm/native.txt. Production Docker/browser verification
  for this revision remains pending CI, not inferred from previous releases.

The unconfigured health test now explicitly passes null, ensuring absent-database
readiness remains503 even when local/CI environment supplies connection fields.
Normal app startup accepts those environment settings; unreachable readiness still503.
The same-name TypeORM warning seen when tests create two isolated Nest containers in
one process does not replace their independently injected sources; both real contention
orderings pass. A normal single-container application does not need duplicate sources.
