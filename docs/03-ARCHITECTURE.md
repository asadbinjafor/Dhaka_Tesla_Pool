# Selected architecture — Next.js / NestJS / Tailwind / PostgreSQL
The four technologies are selected by the user. TypeScript, pg, cookie sessions,
validation/migration/testing/i18n libraries below are engineering choices; reconcile
actual code and record alternatives/reasons in DECISION_LOG/README (PRD §7).

## Runtime and responsibility
```text
Browser: Next.js UI (Tailwind, en/bn, Dark/Light, charts)
  -> same-origin /api/v1 forwarding boundary
  -> NestJS Node API
  -> PostgreSQL
```
Next owns routing/presentation, language/theme initialization and forwarding. Nest
owns session identity, validation, roles+ownership, quotes, matching, allocation,
lifecycle, history, stats and persistence. No Prisma/SQL in browser or independent
business routes hidden in Next. Nest may use its documented default Express HTTP
adapter; this is not permission to build a second standalone Express service.

## Monorepo to create/adapt after audit
```text
apps/web/src/app/[locale]/...
apps/web/src/components/...
apps/web/src/features/...
apps/web/src/i18n/messages/en.json
apps/web/src/i18n/messages/bn.json
apps/web/src/lib/...
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/common/{guards,pipes,filters,...}
apps/api/src/database/...
apps/api/src/modules/{auth,users,vehicles,routes,quotes,rides,pools,history,statistics}/...
packages/contracts/...
database/migrations/...
database/seeds/...
tests/integration/...
tests/e2e/...
docs/...
```
No source files are delivered at these target paths yet. Preserve a compatible existing
layout rather than restructuring for aesthetics alone.

## Nest patterns
Use modules and injected providers. Controllers parse/route and delegate; services
implement use cases; repositories execute parameterized SQL with explicit PoolClient.
Session/AuthGuard + role guard + per-resource ownership checks; global ValidationPipe
configured for chosen DTO schemas and bounded/whitelisted inputs. Global exception
filter maps known failures to stable error codes, hides internals and logs request IDs.
Configure security/session/CSRF on the actual adapter, not copied Express boilerplate
outside Nest. Test pipes, guards, exception mapping and real HTTP gateway end-to-end.

Prefer pg with one connection per transaction, since the pool lock rules must be
visible and explainable. Nest does not require introducing an ORM. An alternative ORM
needs a documented decision preserving SQL/lock/isolation semantics; never use two
transaction owners. Domain tests can be pure; Nest integration tests must exercise
guards/DTOs/service repositories against actual PostgreSQL.

## Transport/auth proposal
PostgreSQL session store; Argon2id passwords; Secure/HttpOnly/SameSite cookies for the
deployed HTTPS path with a documented localhost development variation. Rotate/save
sessions before login response, destroy/logout, verified CSRF defense, rate limits,
body limits and no token/password logs. Chosen session adapter owns its schema.
Validate all identity from the server session, never a role/header provided by UI.
Same-origin forwarding must preserve multiple Set-Cookie headers and credentialed
requests, reject untrusted proxy claims, and avoid shared caching of private responses.
Use no-store where appropriate. Locale routing must exclude /api, /_next and assets.

## Tailwind/UI proposal
Translate current palette/spacing/type/card/navigation tokens into semantic CSS
variables + Tailwind utilities. Maintain selected Dark and Light references; don't
ship two unrelated designs or a second React runtime. Use static variant maps for
status/action styling. Small custom CSS is allowed for illustrations/complex charts,
not as an excuse to ignore Tailwind. Both theme and locale must initialize consistently
on server/client; test refresh/first paint/hydration rather than hiding warnings.

## Libraries and versions
Verify currently supported stable compatible Node/Next/Nest/Tailwind/Postgres and
actual session/migration/CSRF/i18n/test library docs at scaffold time. Pin package manager,
lockfile and compatible dependency versions. Do not reuse reference React16 or guess
'latest'. One package manager (pnpm proposal), one migration tool, one validation
boundary per responsibility, one selected i18n strategy (next-intl or documented
Next dictionaries), no runtime AI translation service. Record reasons/alternatives.
If downloads fail, report the blocker; do not substitute an unmaintained runtime.

## Scripts to implement and verify
pnpm dev; lint; typecheck; build; test:unit; test:integration; test:e2e; test:i18n;
db:migrate; db:seed. These names are target interfaces, NOT currently executable
full-stack commands in the handoff. An absent suite cannot return fake PASS.

## Docker/operations
App container(s) + PostgreSQL; DB health -> one-shot migrations -> API readiness -> web.
Liveness and readiness are distinct; report DB/migration failure. Demo seed opt-in and
repeat-safe, no production public demo passwords. Persist DB data; test fresh start,
restart and failure. Runtime images exclude reference/tests/private credentials unless
explicitly needed. Use free hosting or the PDF's documented tested Docker fallback.
No microservices/Redis/Kafka/queues just to decorate diagrams. Update architecture/ERD
from actual code/migrations, not only this planned structure.
