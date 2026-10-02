# Dhaka Tesla Pool backend

Independent NestJS npm application. From this folder: `npm install`, then
`npm run start:dev`. Node24.17.x/npm12.0.2; API127.0.0.1:3001.

The prepared checkout retains the existing database; local .env supports Tech-Trolley-style connection fields. Without a local .env, the existing private parent .env is loaded automatically. On a
fresh checkout configure your own local .env from .env.example and existing PostgreSQL
database. Explicit process variables win; a local .env takes precedence over parent
fallback. Do not overwrite existing secrets/data. No automatic seed/reset.

| Folder | Responsibility |
|---|---|
| src/auth | Sessions, CSRF, roles, account and vehicle access |
| src/rides | Owned quotes/requests, fares, cancellation and transaction repositories |
| src/pools | Driver acceptance, three-seat capacity and trip lifecycle |
| src/history | Owned history and real completed-record statistics |
| src/database | Nest ConfigModule/TypeOrmModule, DataSource/QueryRunner, shared entity registration, checksum migration runner and opt-in named seed |
| src/health, common, config | Health/readiness, safe errors/commands, native environment |
| migrations | Applied numbered SQL, moved unchanged; never edit applied files |
| scripts | Source compiler watcher; restart only after successful compilation |

Commands: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run start:prod`,
`npm run db:migrate`. Explicit demo seed: ENABLE_DEMO_SEED=1 + private DEMO_PASSWORD,
then `npm run db:seed`. It does not overwrite existing records/passwords.
Full PostgreSQL/HTTP tests remain in ../tests, run through the optional root npm
tooling against a separate dtp_test database. [Run guide](../RUN_NPM_BN.md),
[architecture](../docs/IMPLEMENTED_ARCHITECTURE.md), [API](../docs/IMPLEMENTED_API.md).

## Database configuration and entities

Set DATABASE_HOST, DATABASE_PORT (default5432), DATABASE_NAME, DATABASE_USER and
DATABASE_PASSWORD in .env, plus DATABASE_SSL=false and DATABASE_SYNCHRONIZE=false.
DATABASE_URL is a compatible alternative and takes precedence; explicit process
variables retain priority over local .env. TLS connections verify the certificate.
The prepared local database uses the running Windows PostgreSQL service:
DATABASE_HOST=localhost, DATABASE_PORT=5432, DATABASE_NAME=dhaka_tesla_pool,
DATABASE_USER=postgres. The private .env already contains the local password.
The previous portable database is retained as a backup; all 13 table records were
copied and verified before switching. On other machines use your own credentials.

Feature mappings live in src/auth/entities, src/rides/entities, src/pools/entities,
src/history/entities; internal receipts and the migration ledger live in
src/database/entities. DatabaseModule registers TypeORM and repository providers.
AuthService/RideService/VehicleController use InjectRepository. Critical transaction
repositories keep ordered SQL locks on one QueryRunner and its EntityManager.
Automatic synchronization is disabled to preserve existing schema/data. Continue
using npm run db:migrate and the explicit opt-in npm run db:seed; applied SQL remains
unchanged. Root npm run test:typeorm covers mappings/relations/configuration/recovery.
