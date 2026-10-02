# Local database connection audit — 2026-10-02

User requested the actual database connection to match Tech-Trolley. Baseline Git
HEAD: f55d3d4a4c8c00ab7936ab967933dd1a71dc9b2d. Existing TypeORM integration already
supports the reference's DATABASE_HOST/PORT/NAME/USER/PASSWORD fields.

Observed before changes: Tech-Trolley uses localhost:5432 on the running Windows
postgresql-x64-18 service. Dhaka's ignored backend configuration still targets
127.0.0.1:15432/dtp_app on a stopped portable PostgreSQL cluster. This requires an
extra manual database start and does not match the user's requested run flow.

Plan: connect Dhaka to the installed service using a separate dhaka_tesla_pool
database. Copy and verify all existing Dhaka table records before switching private
configuration. Preserve the original cluster and Tech-Trolley database. Retain
numbered migrations, synchronize=false, existing API/web origins and session rules.
Credentials and database backups remain outside tracked/publication files. Update
native connection instructions and run affected real PostgreSQL checks. Execution
and data-preservation verification are recorded below.

## Executed results

- Authenticated to the reference's existing local PostgreSQL service. Created a new
  dedicated dhaka_tesla_pool database, with no writes to tech_trolley_db.
- Started the original portable cluster temporarily for a private pg_dump backup.
  Restored into the new database in one transaction, retaining the original cluster.
  All 13 public tables have identical row counts and SHA-256 hashes with timestamps
  normalized to UTC. Retained private dump and pre-change environment backups in
  the outer .local-runtime directory, outside Git.
- Ignored backend .env now uses localhost:5432/dhaka_tesla_pool, user postgres,
  the existing local server password and synchronize=false. The ignored root
  DATABASE_URL fallback matches; TEST_DATABASE_URL targets separate dtp_test.
  Docker's own POSTGRES_* configuration remains intact.
- npm run test:integration: PASS 33/33, including real contention, transaction
  rollback/commit recovery, authentication, migration, schema and field-only ORM
  configuration. These create and remove only their own isolated fixture databases.
- The actual Nest application, using backend-local split fields and no DATABASE_URL,
  returned HTTP200 for /api/v1/health/live and /api/v1/health/ready. QueryRunner
  current_database()/inet_server_port() confirmed dhaka_tesla_pool and 5432.
  Verification used a temporary API port and closed the application afterward.
- Backend db:migrate/build PASS: existing migration checksum accepted with no new
  schema migration. Repeated data verification after these checks still matched all
  13 tables. Reference hash check PASS 84/84; scoped diff/secret checks PASS.
- PostgreSQL service is Running with StartMode=Auto. Native instructions and example
  now use the installed service. On another machine supply that machine's credentials;
  private local connection settings/passwords are never included in Git publication.

This connection-only slice changes native environment and documentation. Runtime,
UI, business policies, applied migration, Docker deployment and existing release
browser evidence remain unchanged; no new browser/Docker execution is claimed.
