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
