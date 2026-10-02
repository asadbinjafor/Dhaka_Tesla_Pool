# Working decision log template

## User-authorized npm structure conversion — 2026-09-30

Latest explicit request selects the actual Tech-Trolley-style per-folder npm setup.
Use dhaka-tesla-pool-frontend and dhaka-tesla-pool-backend as independent packages,
each with its own package-lock, dependencies and TS/lint config. Root package is only
optional shared regression tooling. Former frontend-only contracts move unchanged
inside frontend/src/lib/contracts.ts; unchanged numbered SQL lives in backend/migrations.
This supersedes proposed pnpm/apps/packages directory choices, not domain policies.
Keep the actual Git root/history, original handoff/reference files, .env, PostgreSQL
records, stack, visuals, current ports and every required extra. No new schema migration
or material business-rule choice. Details and fresh PASS/FAIL/BLOCKED/NOT_RUN gates are
in NPM_STRUCTURE_AUDIT.md. Original approval/decision history below remains preserved.
Reconcile existing approvals; don't replace history. User's current stack/extras/Git
choices are selected, but detailed unspecified business assumptions are not silently approved.

| Decision | Authority | Status |
|---|---|---|
| Next.js / NestJS / Tailwind / PostgreSQL | Latest explicit user request | USER_SELECTED |
| Graphs / Dark+Light / Bangla+English | Latest explicit user request | USER_REQUIRED |
| Audit source+PDF first; correct justified gaps; audit again | Latest explicit user request | USER_REQUIRED |
| Original PRD Git workflow during development; repo supplied later | Latest explicit user request | USER_SELECTED; remote missing |
| Video after implementation/audit | Latest explicit user request | DEFERRED_BY_USER |
| D01–D29 detailed domain policies | Earlier engineering proposals | RECONCILE_APPROVAL |
| Locale routing/default/numeral/tool selection | Implementation proposals | DOCUMENT_IN_FIRST_AUDIT |

Add decision date, rationale, affected files/tests and any actual user approval. Don't
invent approval dates or infer every policy was approved from visual design selection.

## Actual audit reconciliation - 2026-09-29

- USER_SELECTED/REQUIRED: Next App Router, Nest, Tailwind, PostgreSQL; real graphs; complete en/bn; Dark/Light; PDF feature->master->pre-release->release workflow. Earlier HOLD/Express/optional extras withdrawn by current user, not active.
- Supplied exact remote: https://github.com/asadbinjafor/Dhaka_Tesla_Pool.git. A09 confirms public empty repository/no refs; no unrelated history/default change required. Write access pending verification; missing-URL blocker is superseded.
- Working root is this handoff directory: no other application/Git root discovered. Existing reference bytes/approval/task templates retained; no migrations exist to replace.
- PENDING_USER: one consolidated question for D01-D17 and fare/matching/arrival/cancellation baseline. Do not write dependent business implementation before response. D18-D29 safety/presentation mechanisms remain documented engineering decisions, not exact PDF text.
- Engineering choice: use en default, dark default, explicit cookie preference; validated en/bn routes; canonical IDs and in-memory presentation provider above locale boundary. These affect presentation, not fares/eligibility; no further stack/extra approval requested.
- Video REQUIRED/DEFERRED_BY_USER; no script/record/upload work now.

## Foundation engineering decisions - 2026-09-29

- Audit documents were committed on feature/ui-requirements-audit before application
  work. Exact Git transport dry-run and actual pushes succeeded. Public rulesets API
  returned an empty list; no protection/approval was bypassed. Minimal master bootstrap
  69a2f55, audit c746707, tested non-fast-forward master integration 65b2fd4. Remote
  repository/default/visibility settings were not altered.
- Actual feature/project-foundation retains selected source visuals in modern runtime,
  fixes F05 skip access and the observed light-pane contrast inheritance. Current forms
  honestly show auth unavailable; replacing demo account switching remains incomplete
  until real auth and backend ownership, not accepted as merely hiding a selector.
- Supported pinned dependency choices/changes are in DEPENDENCIES.md. Registry/latest
  alone was insufficient: Next plugins need ESLint9 and TS-eslint requires TS<6.1.
  Identified native builds are explicitly allowlisted; OS security was not changed.
- Selected technical migration approach for next slice: versioned SQL + pg runner,
  transactional migration ledger/advisory lock, no destructive seed/reset, opt-in story
  fixture insertion. No migration has been written/applied while material policy is pending.
- Selected auth design for next slice: high-entropy opaque server sessions, token hashes
  and expiry in PostgreSQL, HttpOnly/SameSite cookies (Secure in HTTPS), session-bound
  CSRF + trusted Origin checks; password Argon2id. These are technical decisions, not
  claims of implementation. Verify package choices/parameters and tests in that slice.
- Foundation native builds/HTTP/browser checks are PASS; Docker/PostgreSQL-success
  checks BLOCKED_ENVIRONMENT. D01-D17 remain PENDING_USER from the single question;
  all required extras and final audit remain in scope. No release branch or video now.

## Completion continuation - 2026-09-29

User explicitly requested fulfillment of all remaining scope except video after seeing
the outstanding policy/runtime gaps. Adopt D01-D29 as the documented engineering baseline
under PRD §17 and this continuation: one active request/pool, reserve on acceptance,
Banani compatibility, fare-v1 integer poysha, arrival freezes/closes joins/passenger
cancel, driver cancellation before start, Cash only, passenger signup and seeded drivers.
These are adopted implementation assumptions, not exact PDF clauses or invented individual
user approval of each rate. The earlier single question is resolved by the continuation;
do not reopen the selected stack/extras. Actual schema is new, no existing applied
migrations to overwrite. Video remains DEFERRED_BY_USER with its required submission row.

Local DB environment: official PostgreSQL/EDB 18.6 portable binaries in the outer
.local-runtime directory, isolated loopback cluster/data; no OS service or global PATH
change. Docker/WSL absent; use free public-repository CI for actual Docker execution,
without changing host protections or paying for infrastructure. Verification remains
NOT_RUN until evidence exists. Source: https://www.postgresql.org/download/windows/
and https://www.enterprisedb.com/download-postgresql-binaries .

## Final engineering/operation reconciliation — 2026-09-29

- Real implemented architecture/ERD/API supersede proposed payload examples; the original proposed documents remain retained. README links implemented contracts. Full en/bn and both themes/owned SQL graphs are implemented required scope, never reclassified optional.
- Same verified account reauthentication preserves unresolved original command identity; actual identity change/explicit logout remounts private state. This is an engineering recovery correction, not rate/matching/cancel-policy change.
- Locale-remounted modal trigger focus, localized occupancy numbers/graph description and mobile graph coordinate/font readability are evidence-driven UI corrections preserving selected Bullet design and canonical domain values.
- Native fixture CREATE/DROP DDL gets a separate bounded15s administrative budget and always-close pool. Production business3s statement/2s lock limits and deterministic actual lock-contention tests remain unchanged. No application data/base DB is deleted by this helper.
- Operator APP_ORIGIN/Secure-cookie settings explicitly reach Compose API. Local HTTP Docker fallback is actually tested in free public-repository CI; public hosted TLS remains NOT_RUN. No paid infrastructure or host security/reboot change. Local extra frontend preview automatic rejection is respected, not bypassed.
- Exact repository remains public/default master after ordinary Git publication; no default/visibility setting was manually changed. Contemporary tested feature -> master -> pre-release -> release/v1.0.0 remains the delivery workflow, with no force/reconstruction/unrelated deletion.
- Video P38/U11 remains required DEFERRED_BY_USER; full human interview/debug ability and complete assistive-technology certification cannot be inferred from automated passes. No new video task/script/recording/upload.

## Tech-Trolley-style database request — 2026-10-02

User explicitly requested the reference project's database setup. Adopt TypeORM
entities, Nest repository/configuration integration and split PostgreSQL connection
fields, preserving DATABASE_URL compatibility and existing private data. This replaces
the pg-only access-layer choice. One QueryRunner connection and its manager replace
the explicit standalone pg-client contract while retaining lock order/isolation/SQL.
No fare/matching/authentication/seat/lifecycle/API/UI policy changes. Keep schema sync
disabled and the original numbered migration immutable. No destructive seed/reset.
Audit and execution evidence: TYPEORM_DATABASE_AUDIT.md. Video remains deferred.
