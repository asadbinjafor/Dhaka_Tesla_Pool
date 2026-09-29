# Database slice audit

2026-09-29; feature/database-schema; P20/P23/P24/P28/P34/I39/I47.
User requested completion of non-video scope; adopted engineering baseline is recorded
in DECISION_LOG. Prior question/history retained; no prior applied migration existed.

Implemented relational constraints/indexes/immutable facts and terminal history;
one-client READ COMMITTED mutations / REPEATABLE READ read models; bounded locks,
deadlock retries and uncertain COMMIT error. Checksummed, advisory-serialized migration
ledger; transactional application. Explicit named seed never overwrites existing
passwords/roles/dates/history. ERD.md derives from SQL. Compose migration job gates API;
demo seed is opt-in. No reset/destructive migration or live credentials published.

PASS actual PostgreSQL 18.6: clean/repeated migration, repeat seed preserves identities/
hashes/dates, invalid driver/owner-pair FKs/quantity checks, immutable user/quote triggers,
unlinked-event rejection, injected transaction rollback and failed migration rollback
without ledger/probe residue. Native API build/lint/health tests run separately. Domain
capacity/lifecycle/API ownership tests are next. Docker CI execution remains pending
until an actual hosted run, not inferred from YAML.

Official portable source: PostgreSQL Windows page → EDB binary listing →
https://get.enterprisedb.com/postgresql/postgresql-18.6-4-windows-x64-binaries.zip .
SHA256 1df55002afe95b945d934c078b13e82c1603fa546731e511d068aa983b4ead28.
Isolated loopback cluster on port 15432 outside Git, generated private SCRAM credentials
in ignored .env, no OS service/global config changes. Initial download/extraction overlap
was corrected by re-extracting the owned verified archive; actual DB execution passed.

Next: real PG sessions, Argon2id, library synchronizer CSRF, bounded auth attempts,
server role/ownership and bilingual account UI. Video DEFERRED_BY_USER. Full product
and independent final audit remain incomplete.
