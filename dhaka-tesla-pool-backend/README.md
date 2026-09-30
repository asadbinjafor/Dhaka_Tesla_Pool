# Dhaka Tesla Pool backend

Independent NestJS npm application. From this folder: `npm install`, then
`npm run start:dev`. Node24.17.x/npm12.0.2; API127.0.0.1:3001.

The prepared checkout uses the existing private parent .env automatically. On a
fresh checkout configure your own local .env from .env.example and existing PostgreSQL
database. Explicit process variables win; a local .env takes precedence over parent
fallback. Do not overwrite existing secrets/data. No automatic seed/reset.

| Folder | Responsibility |
|---|---|
| src/auth | Sessions, CSRF, roles, account and vehicle access |
| src/rides | Owned quotes/requests, fares, cancellation and transaction repositories |
| src/pools | Driver acceptance, three-seat capacity and trip lifecycle |
| src/history | Owned history and real completed-record statistics |
| src/database | PostgreSQL access, checksum migration runner and opt-in named seed |
| src/health, common, config | Health/readiness, safe errors/commands, native environment |
| migrations | Applied numbered SQL, moved unchanged; never edit applied files |
| scripts | Source compiler watcher; restart only after successful compilation |

Commands: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run start:prod`,
`npm run db:migrate`. Explicit demo seed: ENABLE_DEMO_SEED=1 + private DEMO_PASSWORD,
then `npm run db:seed`. It does not overwrite existing records/passwords.
Full PostgreSQL/HTTP tests remain in ../tests, run through the optional root npm
tooling against a separate dtp_test database. [Run guide](../RUN_NPM_BN.md),
[architecture](../docs/IMPLEMENTED_ARCHITECTURE.md), [API](../docs/IMPLEMENTED_API.md).
