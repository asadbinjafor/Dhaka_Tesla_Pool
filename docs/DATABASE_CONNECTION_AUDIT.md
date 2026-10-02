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
and data-preservation verification are pending until recorded below.
