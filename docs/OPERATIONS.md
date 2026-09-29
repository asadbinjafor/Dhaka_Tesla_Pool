# Run and maintain the application

Run commands from the repository root (the directory containing package.json and compose.yaml). Node 24.17.x, pnpm 12.6.0 and PostgreSQL 18.x are required for native execution. Docker Engine with Compose v2 is the tested reproducible alternative. Ports 3000/3001 must be free; preserve and stop your own previous processes intentionally before starting this version.

## Docker fallback

No free hosted backend account or public deployment was configured. Original PDF §6 permits reproducible Docker deployment when free backend hosting is unavailable. Actual GitHub CI runs build and run the application, not just parse Compose. No paid infrastructure is used. Local Windows Docker is absent; the verified environment is Ubuntu 24.04 GitHub Actions.

For a fresh checkout, copy .env.example to .env **only if .env does not already exist**. Keep existing settings/data. Set POSTGRES_PASSWORD to a generated alphanumeric secret and DEMO_PASSWORD to your chosen 12–128 character demo password. Never commit this private file. POSTGRES_USER/POSTGRES_DB must match an existing volume if one exists; changing a variable does not reset or rotate existing database credentials.

```powershell
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
# Edit private .env: POSTGRES_PASSWORD, DEMO_PASSWORD; retain APP_ORIGIN's exact browser origin.
docker compose --env-file .env up --build --wait
docker compose --env-file .env --profile demo run --rm seed
```

Open **http://127.0.0.1:3000/en/sign-in** or **http://127.0.0.1:3000/bn/sign-in**. Use 127.0.0.1 consistently: localhost is a different origin and unsafe commands deliberately fail CSRF checks unless APP_ORIGIN is changed to that exact origin. Only the web port is published, on loopback; API and database stay on the Compose network. The migrate service finishes before API startup; readiness includes database connectivity and migration ledger. Demo seed is an explicit optional profile, never a public reset route. New users can register without seeding; the named driver requires the seed.

`docker compose down` preserves the database volume. `docker compose up --wait` reconnects existing records/sessions. Never use `down --volumes` against data you intend to retain. Back up PostgreSQL before operational migrations; migrate validates prior checksums and applies each new numbered file atomically under a DB advisory lock. Never edit applied 001_initial.sql. Repeated seed leaves existing password hashes, roles, timestamps and rides intact; changing DEMO_PASSWORD afterwards does not reset an existing account.

HTTPS deployment requires an operator-controlled TLS reverse proxy, exact HTTPS APP_ORIGIN and SESSION_COOKIE_SECURE=true. Compose now forwards those settings. Actual public TLS termination is NOT_RUN; secure cookie attributes/origin denial are tested. The supplied fallback runs local HTTP. Do not expose the loopback demo unchanged as a public production service.

## Native setup and execution

```powershell
npm install --global pnpm@12.6.0
pnpm install --frozen-lockfile
pnpm build
```

Use your own PostgreSQL database and private .env DATABASE_URL. For this already prepared workspace, an isolated local PostgreSQL 18.6 cluster and application database exist; **retain the existing .env and data**. Its loopback port is 15432. Native API reads process environment, not Next's directory-local .env automatically:

If this prepared local cluster is stopped after reboot, inspect its status and start that same data directory (do not initialize another cluster):

```powershell
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' status
# Only if status reports stopped:
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' -l 'E:\Dhaka_Tesla_Pool\.local-runtime\postgres.log' start
```

These paths belong to this prepared workspace, not prerequisites for a new public checkout.

```powershell
node --env-file=.env apps/api/dist/database/migrate.js
# Opt-in named seed, if desired; no existing records are overwritten:
$env:ENABLE_DEMO_SEED = '1'
node --env-file=.env apps/api/dist/database/seed.js
Remove-Item Env:ENABLE_DEMO_SEED
# Terminal 1:
node --env-file=.env apps/api/dist/main.js
# Terminal 2, from repository root:
node --env-file=.env apps/web/node_modules/next/dist/bin/next start apps/web --hostname 127.0.0.1
```

For development, compile API after API source edits (`pnpm --filter @dtp/api build`) and use Node --watch on its compiled main; `pnpm dev:web` runs Next development. Production build/start is the verified delivery mode. Native TEST_DATABASE_URL must point to a separate loopback base database whose name begins dtp_test; the test helper creates/drops only its own unique generated databases. Never point tests at application records.

## Demo accounts

All use **your private .env DEMO_PASSWORD** as supplied on the initial seed, not a hard-coded application password:

| Email | Identity | Role |
|---|---|---|
| jashim@demo.dhaka.test | Jashim, owns Bullet (three passenger seats; driver separate) | Driver |
| nusrat@demo.dhaka.test | Nusrat | Passenger |
| rafiq@demo.dhaka.test | Rafiq | Passenger |
| shirin@demo.dhaka.test | Shirin | Passenger |

Use separate browser profiles/private contexts for simultaneous actors. Sign out and sign in for a new identity; there is no account selector or client role switch. Existing seeded accounts keep the password from their initial insertion. CI passwords in tests/workflows are explicitly nonsecret, isolated fixtures and do not grant access to local/user data.

## Verification and troubleshooting

```powershell
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm build
# Native real PostgreSQL/HTTP suites; root private .env provides TEST_DATABASE_URL:
node --env-file=.env --test --test-concurrency=1 tests/integration/health.test.mjs tests/integration/database.test.mjs tests/integration/auth.test.mjs tests/integration/requests.test.mjs tests/integration/allocation.test.mjs tests/integration/lifecycle.test.mjs tests/integration/statistics.test.mjs tests/integration/hardening.test.mjs
# Against already running production app:
pnpm test:smoke
# Against an isolated freshly migrated/seeded Docker fixture only:
# set E2E_PASSWORD to that fixture's DEMO_PASSWORD, install Chromium, then pnpm test:e2e
pnpm audit
```

Full E2E tests create/complete/cancel records and are for an isolated test deployment, not your live local application database. CI provisions that fixture automatically. Playwright video and traces are disabled; screenshots and reports are retained. Optional `pnpm check:reference` verifies 84 handoff reference files locally; a clean public checkout intentionally omits private/reference files and must not depend on them to run.

`GET /api/v1/health/live` returns 200 independently of DB. `GET /api/v1/health/ready` returns 200 after reachable migrated DB or safe 503 when unavailable. CSRF failures: check exact APP_ORIGIN/cookie host; don't disable CSRF. Database unavailable: verify DB/credentials/migration, don't reset volumes. An uncertain command: use **Retry original command** with the retained key; reauthenticate as the same account if prompted. Confirmed business conflicts are localized and require a fresh valid user decision. History/stable IDs continue to explain terminal outcomes even when /current is null. No raw SQL, credentials or cookie values are emitted by application error responses/logs.
