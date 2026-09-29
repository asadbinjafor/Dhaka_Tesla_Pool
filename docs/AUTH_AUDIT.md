# Authentication slice audit — 2026-09-29

Actual PostgreSQL 18.6 and real Nest HTTP: PASS. Four executed integration tests cover schema/non-destructive seeding, authentication, absent/unreachable database readiness. Eight unit tests, production build, typecheck, lint and all 84 immutable reference hashes: PASS.

Login verifies Argon2id hashes, rotates opaque database sessions, and sends HttpOnly/SameSite cookies. Secure is mandatory for configured HTTPS origin. csrf-sync synchronizer tokens plus exact Origin checks protect unsafe actions. Server-derived role guards deny passenger access to the driver vehicle. Registration cannot elevate roles; own identity serialization excludes hashes/tokens. Login throttling, expiry, forgery, session rotation, logout invalidation and Unicode passwords are exercised against PostgreSQL.

Root session/view providers preserve credentials in memory across presentation switches while clearing private state at authentication boundaries. Account/sign-out replace the public demo selector. No shared passenger dataset is exposed. Catalog parity includes all currently implemented forms/errors/account controls; this is not full-product completion.

Browser authentication tests are implemented for four theme/locale combinations plus a real delayed login while both controls change. Execution: NOT_RUN locally because automatic approval review rejected the additional frontend preview (reason: blocked by policy). CI runs them against the actual Compose gateway; its result must be recorded before integration.

Remaining PDF/user gaps: booking, matching/allocation, lifecycle, persistent history, database graphs, full product UI and independent final audit. Next smallest correction: immutable owner-bound quotes and idempotent requests, tested for quantity/route validation, foreign quote denial, after-lock expiry, duplicate active request and authorized historical replay.

Docker foundation verification is independently PASS in GitHub Actions run 36526747393 at database commit bebaea3: fresh build/start, migrations/readiness, repeated start and database checks. This does not prove unimplemented business features.

Video stays DEFERRED_BY_USER (P38/U11); no recording or scripting is included.
