# Run and maintain the application

> 2026-09-30: use [RUN_NPM_BN](../RUN_NPM_BN.md) and the current [README](../README.md)
> for independent npm/frontend/backend commands. Older pnpm/apps instructions in
> prior commits and original handoff files are superseded. Backend loads its .env or the existing
> root fallback; SQL is unchanged in dhaka-tesla-pool-backend/migrations. Docker
> commands, secrets handling, exact origins and persistent-volume rules still apply.

Docker/shared test commands run from the repository root; native app commands run inside their respective app folder. Node 24.17.x, npm 12.0.2/compatible12.x and PostgreSQL 18.x are required for native execution. Docker Engine with Compose v2 is the tested reproducible alternative. Ports 3000/3001 must be free; preserve and stop your own previous processes intentionally before starting this version.

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

Use the independent npm commands in [README](../README.md) or [Bangla guide](../RUN_NPM_BN.md).
Node24.17.x, npm12.0.2/compatible12.x, PostgreSQL18.x. Backend and frontend each
have their own complete dependencies/lock/config; root npm is optional test tooling.

From backend: `npm install`, then `npm run start:dev`. From another terminal in
frontend: `npm install`, then `npm run dev`. Backend source changes compile/restart;
frontend uses Next's development refresh. Existing ports are web3000/API3001.
Use127.0.0.1 consistently for the documented APP_ORIGIN and cookies.

Prepared workspace: preserve private root .env and .local-runtime/data. Backend
loads its app-local .env if present, otherwise the root fallback; explicit process
variables take precedence, including Docker/CI. Frontend loads its .env.local and
only reads the root private API_INTERNAL_ORIGIN fallback when needed. DB credentials
never become NEXT_PUBLIC values. A fresh checkout must supply its own backend .env
from the local .env.example and its own existing PostgreSQL database.

If the prepared PostgreSQL cluster is stopped, start the same data (never init/reset):

```powershell
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' status
# Only if stopped; this prepared cluster uses explicit port15432:
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' -l 'E:\Dhaka_Tesla_Pool\.local-runtime\postgres.log' -o '-h 127.0.0.1 -p 15432' start
```

From backend, `npm run db:migrate` validates/applies numbered SQL in migrations
independently of working directory. The conversion moves001 unchanged and needs no
new schema or reseed. Fresh database named seed is explicit: ENABLE_DEMO_SEED=1 and
private DEMO_PASSWORD, then `npm run db:seed`. Never seed/reset automatically on start.
Repeated seed preserves records/passwords. For production build both apps, run backend
`npm run start:prod`, frontend `npm start`. Stop your own terminals with Ctrl+C.
If a port is occupied, inspect its owning process; do not kill an unknown process.
Use `npm ci` for exact clean lockfile installs; no pnpm workspace is required.

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
# Optional root regression tooling; install apps separately first.
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm run build
# Native real PostgreSQL/HTTP suites; root private .env provides TEST_DATABASE_URL:
npm run test:integration
# Against already running production app:
npm run test:smoke
# Against an isolated freshly migrated/seeded Docker fixture only:
# set E2E_PASSWORD to that fixture's DEMO_PASSWORD, install Chromium, then npm run test:e2e
npm audit
```

Full E2E tests create/complete/cancel records and are for an isolated test deployment, not your live local application database. CI provisions that fixture automatically. Playwright video and traces are disabled; screenshots and reports are retained. Optional `npm run check:reference` verifies 84 handoff reference files locally; a clean public checkout intentionally omits private/reference files and must not depend on them to run.

`GET /api/v1/health/live` returns 200 independently of DB. `GET /api/v1/health/ready` returns 200 after reachable migrated DB or safe 503 when unavailable. CSRF failures: check exact APP_ORIGIN/cookie host; don't disable CSRF. Database unavailable: verify DB/credentials/migration, don't reset volumes. An uncertain command: use **Retry original command** with the retained key; reauthenticate as the same account if prompted. Confirmed business conflicts are localized and require a fresh valid user decision. History/stable IDs continue to explain terminal outcomes even when /current is null. No raw SQL, credentials or cookie values are emitted by application error responses/logs.
