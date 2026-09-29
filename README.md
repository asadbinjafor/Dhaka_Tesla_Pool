# Dhaka Tesla Pool — Final Codex Handoff v3
**Handoff revision 3, not an application release.**

Start with START_HERE_BN.md, AGENTS.md and START_CODEX.md.

Latest user choices: Next.js frontend, NestJS backend, Tailwind CSS, PostgreSQL;
required graphs, Dark/Light themes and Bangla/English product UI. First task is an
original-PDF/source/UI audit, followed by justified scoped improvements. Use the
actual PRD Git workflow during development; push tested scopes to the explicitly
provided repository after verifying the destination/access. Video stays deferred
until after implementation and the final audit.

The initial handoff supplied a reference prototype and guidance, with no Next/Nest
application. The original five-page PDF, source, UI interactions and repository were
audited before application edits. See [the recorded audit](docs/INITIAL_AUDIT.md).
The immutable reference is excluded from Git/runtime/container publication. Its supplied
rickshaw artwork has a runtime-owned copy with [provenance](apps/web/public/images/PROVENANCE.md).
Historical prototype tests are not backend proof.

The first implemented slice is a Next App Router / Nest / Tailwind workspace with
English and Bangla sign-in/sign-up entry screens, both themes, preference cookies,
in-memory draft retention across presentation switches, keyboard skip access and a
same-origin API transport gateway. It preserves the selected Bullet artwork, palette
and split layout. This is **not a working booking MVP**: signup/login deliberately show
unavailable until real sessions and ownership are implemented. There is no account
selector, fake login, fake DB result or synthetic graph.

Requires Node 24.17.x and pnpm 12.6.0. Install this pinned manager from its official
registry distribution; do not use a different manager/lockfile. From this directory:

```sh
pnpm install --frozen-lockfile
pnpm build
# Two terminals (no DB required for liveness/the entry screens):
pnpm --filter @dtp/api start
pnpm --filter @dtp/web start
```

Open http://127.0.0.1:3000. The API defaults to 127.0.0.1:3001; web forwards /api/v1
to API_INTERNAL_ORIGIN (default local API). DATABASE_URL is optional in this slice;
readiness is 503 without a working PostgreSQL connection. Liveness is 200 independently.
Copy .env.example to a private .env for Compose; native Nest reads process environment,
so export DATABASE_URL/API_PORT explicitly when running without Compose. No secret is
provided. Use a generated URI-safe DB password for Compose's interpolated URL; encode
reserved characters if constructing a native DATABASE_URL. Never commit .env.

```sh
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:api
pnpm test:smoke  # requires the started production web + API above
pnpm test:i18n
pnpm check:reference  # local handoff integrity; requires ignored original reference
```

The repository's runnable tests do not require the unpublished reference. Only the
optional local integrity command does. Unit transport fixtures are not login/security
tests. Health tests run actual Nest HTTP and prove safe DB-failure behavior, not DB
success. Production smoke tests cover SSR preferences, routing and actual Next→Nest.
Browser evidence covers both locales/themes and 390/1440px layouts. Details and open
gaps: [slice audit](docs/FOUNDATION_AUDIT.md), [PDF matrix](docs/PDF_REQUIREMENT_MATRIX.md),
[user-extras matrix](docs/EXTRA_REQUIREMENT_MATRIX.md), [dependency choices](docs/DEPENDENCIES.md).

Current implementation:

```text
Browser -> Next localized entry UI -> /api/v1 transport -> Nest -> pg readiness query
apps/web           Next/Tailwind, dictionaries, provider, gateway
apps/api           Nest health, validation/error boundary, pg connection service
packages/contracts Canonical presentation types and state/locale helpers
tests              Unit, actual Nest HTTP, running-production smoke
```

Health endpoints: GET /api/v1/health/live and GET /api/v1/health/ready. Errors contain
stable codes and a server request ID, with private/no-store caching and no raw SQL/DSN.
No business API/ERD is claimed implemented. The planned schema is in docs/04-DATABASE.md.
Pending material fare/matching/cancellation/booking policy was asked once and is not
treated as approved. Next dependent slice: non-destructive SQL migrations and named
opt-in seeds, then real account sessions/CSRF/ownership and booking transactions.

Compose declares pinned app/DB images, private DB/API networking, persistent PostgreSQL
volume and health dependencies. `docker compose --env-file .env up --build` is **BLOCKED
in this environment: Docker is unavailable**. It is not a tested fallback deployment;
migrations/seeds are still absent. No public deployment or demo credentials exist yet.

Development follows feature/* → master → pre-release → release/v1.0.0 against the exact
supplied repository. Release branches wait for an integrated verified MVP. See
GITHUB_REPOSITORY.md and docs/TASK_BOARD.md for actual commits/ref evidence.
AI-assisted audit, implementation and checks are disclosed in docs/AI_USAGE_LOG.md;
human explanation/debugging remains to be demonstrated. Full independent final audit
and the required maximum-six-minute video remain outstanding. Video is
**DEFERRED_BY_USER**; no recording, script or upload was created.
