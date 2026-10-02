> Current application evidence is in [FINAL_AUDIT.md](FINAL_AUDIT.md) and the dated complete-product checkpoint below. Earlier starter/foundation tables are preserved history, not current missing-feature claims.

# Original-PDF requirement matrix — initial planning baseline

Source: reference/PRD.pdf. All five pages/19 sections are represented. This table
is a review aid, not proof of compliance; first audit must reread the source and split
clauses further when useful. Preserve the source’s suggested/recommended/optional distinctions.
Add actual file:line, test names, evidence paths, commit/ref, verification date and status
in the WORKING application copy; do not overwrite existing progress with this template.

Allowed states: UNVERIFIED, MISSING, PARTIAL, IMPLEMENTED_NOT_VERIFIED, VERIFIED,
BLOCKED, DEFERRED_BY_USER; NOT_APPLICABLE only with a source-supported reason.
Video starts DEFERRED_BY_USER; no other row is predeclared VERIFIED by this handoff.

| ID | Source | Classification | Requirement | Evidence to collect | Initial status | Actual observed evidence (2026-09-29) | Actual status | Next correction / acceptance |
|---|---|---|---|---|---|---|---|---|
| P01 | p1 §1 | Context | Jashim/Bullet/Nusrat/Rafiq/Shirin story; named consistent demo cast | Named seeds/tests/demo + README | UNVERIFIED | reference/ui-dark-light/src/domain.js (named seed); A02 | PARTIAL | Port persistent named seeds/test/demo |
| P02 | p1 §2 | Required | Passengers see their OWN fare and status; driver sees assigned passengers/stage | Owned serializers + API privacy tests | UNVERIFIED | reference/ui-dark-light/src/app.jsx:17,35,61; local owned DTO A02 only | MISSING | Real sessions + SQL ownership; I26-I29 |
| P03 | p1 §2 | Required | Enough history to explain what happened after a ride | Persistent terminal records/events + read tests | UNVERIFIED | reference/ui-dark-light/src/app.jsx:39,42; JSON-only history | MISSING | Persistent terminal rows/events; I31/I36 |
| P04 | p1 §3 | Required | Passenger signup and sign-in | Real auth UI/API/session/validation tests | UNVERIFIED | reference/ui-dark-light/src/store.js:17-25; app.jsx:57-59 | MISSING | Nest signup/login/session/CSRF; I29 |
| P05 | p1 §3 | Required | Request ride with pickup, destination and seat quantity | UI → API → DB request flow | UNVERIFIED | reference/ui-dark-light/src/app.jsx:41,63; A05 | PARTIAL | Quote/request API/DB; I01-I05 |
| P06 | p1 §3 | Required | See estimated fare | Quote arithmetic, own breakdown and tests | UNVERIFIED | reference/ui-dark-light/src/components.jsx:61; A02/A05 | PARTIAL | Owner-bound real quote; named arithmetic tests |
| P07 | p1 §3 | Required | Track waiting/matched/in-progress/completed/cancelled states | Lifecycle UI + stable ID APIs | UNVERIFIED | reference/ui-dark-light/src/app.jsx:42-49; A06 | PARTIAL | Real lifecycle detail/polling; I21/I36 |
| P08 | p1 §3 | Required | Passenger history and cancellation while valid | Rules documented; guards/history tests | UNVERIFIED | reference/ui-dark-light/src/app.jsx:49-50,64; A02 | PARTIAL | Policy decision then owned DB cancel/history; I15-I20 |
| P09 | p1 §3 | Required | Driver sign-in, online/offline and owned fixed-capacity Tesla | Driver auth/vehicle/availability APIs | UNVERIFIED | reference/ui-dark-light/src/app.jsx:27,43,52; A06 | PARTIAL | Server driver session/profile/vehicle; I25/I29 |
| P10 | p1 §3 | Required | Driver relevant requests and accept ride/pool | Eligibility + atomic acceptance | UNVERIFIED | reference/ui-dark-light/src/app.jsx:26,44; A06 | PARTIAL | Atomic relevance/accept; I06-I14 |
| P11 | p1 §3 | Required | Driver marks arrival, starts and completes trip | Authorized commands + guards/tests | UNVERIFIED | reference/ui-dark-light/src/app.jsx:65; A06 | PARTIAL | Server transitions; I19-I24 |
| P12 | p1 §3 | Required | Driver passenger/seat list and ride history | Owned roster/history + quantity tests | UNVERIFIED | reference/ui-dark-light/src/app.jsx:48-50; A06 | PARTIAL | Owned persistent roster/history; I27/I30 |
| P13 | p1 §3 | Required | Multiple requests share vehicle without exceeding occupied capacity | DB-backed allocation + concurrent tests | UNVERIFIED | reference/ui-dark-light/src/store.js:13; sequential test A02 | MISSING | Postgres parent locks; I08-I10/I32/I41 |
| P14 | p1 §3 | Required | Individual fare, clear lifecycle and obvious pool membership | Schema + UI + policy test | UNVERIFIED | reference/ui-dark-light/src/components.jsx:59,61; A05/A06 | PARTIAL | Owned fare + membership persistence; I06/I24 |
| P15 | p1–2 §3 | Suggested/example | REQUESTED → MATCHED/ACCEPTED → DRIVER_ARRIVED → STARTED → COMPLETED (+CANCELLED) | Use/explain documented consistent lifecycle | UNVERIFIED | reference/ui-dark-light/src/components.jsx:63; docs/12-STATE-CONTRACT.md proposal | PARTIAL | Approved documented state table + tests |
| P16 | p2 §4 | Required with options | Simple geography; invent/document matching and apply to different destinations consistently | Zones/compatibility config + tests; no real route engine needed | UNVERIFIED | reference/ui-dark-light/src/domain.js; docs/02-DECISIONS.md D04 | PARTIAL | Confirm configured group; server matching fixtures |
| P17 | p2 §5 | Required with example | Document simple testable hand-verifiable fare; explain money storage | Named numerical fixtures + exact poysha arithmetic | UNVERIFIED | reference/ui-dark-light/src/components.jsx:61; A02; D07-D08 fare proposal | PARTIAL | Confirm policy; immutable integer snapshots; I42 |
| P18 | p2 §5 | Permitted choice | Cash OR simulated TeslaPay; no real gateway needed | Record chosen scope; do not require both | UNVERIFIED | reference/ui-dark-light/src/components.jsx:61; D16 proposal | PARTIAL | Confirm Cash only; never paid/refunded claims |
| P19 | p2 §6 table | Required choice | Frontend React or Next.js; Node.js backend | Actual Next.js + NestJS implementations | UNVERIFIED | reference/ui-dark-light/package.json React16; serve.cjs static-only; Foundation: apps/web + apps/api production build/start; FOUNDATION_AUDIT | VERIFIED | Business flows remain separately tracked |
| P20 | p2 §6 table | Choice/recommendation | Database chosen/justified; relational recommended | PostgreSQL actual migrations + rationale | UNVERIFIED | docs/04-DATABASE.md is design, no migration | MISSING | PostgreSQL schema + rationale; I39 |
| P21 | p2 §6 | Required | API/resource design, auth, validation, business placement, errors, state/capacity/consistency, logs/security | Code architecture/DTOs/guards/filters + tests | UNVERIFIED | src/store.js local authority; no Nest source; Foundation safe-error/filter, ValidationPipe, bounded gateway; health/transport tests PASS | PARTIAL | Auth/ownership/business/DB consistency tests missing |
| P22 | p2 §6 | Required | Correct usable frontend flows, loading/error/empty states, organization and API integration | Modern real API UI; no prototype authority | UNVERIFIED | reference/ui-dark-light/src/app.jsx:70; A05-A08; Foundation bilingual auth entry, skip target, safe unavailable state; browser PASS | PARTIAL | Real auth/loading/booking/driver flows still missing |
| P23 | p2 §6 | Required | Own schema: users/vehicles/requests/pools/membership/history/fare; relationships/constraints/indexes/types | Migrations/schema tests and actual ERD; optional payment/rating not mandated | UNVERIFIED | docs/04-DATABASE.md proposed tables only | MISSING | Non-destructive constraints/indexes/migrations/ERD |
| P24 | p2 §6 | Required | docker compose up; application + DB containers, env example, migrations and story seeds | Clean/restart/failure evidence; health checks if possible | UNVERIFIED | No Compose/env/migrations; Docker absent; Dockerfile/compose.yaml/.env.example added; execution BLOCKED_ENVIRONMENT | PARTIAL | Real Docker + migrations + opt-in story seeds |
| P25 | p2 §6 | Conditional/preferred | Free only; public deployment preferred, reproducible Docker fallback allowed if backend hosting unavailable | Actual URL OR documented/tested allowed fallback; no paid infra | UNVERIFIED | No URL or verified Docker deployment | MISSING | Free URL or tested source-permitted fallback |
| P26 | p2 §7 | Required | Explain each non-mandated tool, alternatives, fit for pooling and change trigger | README decision table | UNVERIFIED | docs/02-DECISIONS.md proposals; docs/DEPENDENCIES.md verified choices/peers/alternatives/change triggers | PARTIAL | Complete later auth/migration/operation tools rationale |
| P27 | p2–3 §8 | Required | AI allowed but disclosed; author can explain/debug/change; accepted and rejected/changed suggestion | Factual AI_USAGE; human understanding not automatically proven | UNVERIFIED | docs/AI_USAGE_LOG.md + reference disclosure | PARTIAL | Factual actual-work log; human explain/debug NOT_RUN |
| P28 | p3 §9 | Required | Architecture first: Browser→React/Next→Node API→DB + ERD; match implementation | Maintained diagrams + code comparison | UNVERIFIED | docs/03-ARCHITECTURE.md and 04-DATABASE.md proposed; README actual Browser-Next-Nest-pg-readiness trace; proposed ERD labeled | PARTIAL | Actual domain ERD after implemented schema |
| P29 | p3 §9 | Constraint | No impressive-only extra infrastructure | Simple modular app; justify necessary complexity | UNVERIFIED | Simple modular architecture proposal | PARTIAL | Keep runtime free of unjustified infrastructure |
| P30 | p3 §10 | Required | Real feature/* branches with incremental commits into working master | Actual contemporary Git history, not reconstructed at end | UNVERIFIED | No local .git or remote refs at audit start; Actual audit feature commit c746707, master integration 65b2fd4; foundation feature active | PARTIAL | Continue contemporary tested feature integrations |
| P31 | p3 §10 | Required | Integrated MVP → pre-release fixes/docs/checks → release/v1.0.0 | Branch ancestry and release evidence | UNVERIFIED | No local/remote refs | MISSING | Cut pre-release/release only after integration gates |
| P32 | p3 §11 | Required | <type>(<scope>): <description>; logical commits; no meaningless count target | Commit messages and meaningful diffs | UNVERIFIED | No project commits; 69a2f55 bootstrap; c746707 audit; 65b2fd4 integration; meaningful conventional history | VERIFIED | Maintain logical convention for each tested slice |
| P33 | p3 §12 | Required | README summary/features/screenshots; architecture/ERD; stack/tree/prerequisites | Actual operating README/artifacts | UNVERIFIED | README.md handoff boundary; no real app screenshots; README operating scope/stack/tree/prerequisites; foundation browser screenshots | PARTIAL | Completed-product architecture/ERD/features/screenshots |
| P34 | p3 §12 | Required | README env/setup/Docker/migrate/seed/run/tests/demo credentials | Commands tested; examples not secrets | UNVERIFIED | README.md explicitly no root application scripts; README actual install/build/run/test/env commands; PASS native gates | PARTIAL | Real tested Docker/migrations/seeds/demo credentials absent |
| P35 | p3 §12 | Required/conditional | README API/decisions/limitations/improvements, actual deployment link if available, AI/video link | Truthful records; video currently deferred | UNVERIFIED | No real API/deployment; video deferred; README health API/decisions/limitations/AI/video deferred | PARTIAL | Business API/deployment/AI evidence at final audit |
| P36 | p3 §12 | Required | Tests: capacity, invalid transitions, named pooled fares, ownership, cancellations and concurrent last seat | Real DB and API tests, not mock-only assertions | UNVERIFIED | A02 PASS 58 local-only; real DB cases NOT_RUN | PARTIAL | Execute real capacity/privacy/transition/cancel races |
| P37 | p4 §12 bonus | Optional bonus | Reason about 1M passengers/100k drivers without overbuilding | Optional concise scale document; no fake benchmark | UNVERIFIED | Optional scale discussion not audited/attempted | UNVERIFIED | Optional after core; no benchmark claim |
| P38 | p4 §13 | Required, deferred by user | Maximum 6-minute video: 0–1 problem,1–3 engineering,3–6 tour/edge | DEFERRED_BY_USER; after implementation/audit, no fake link | DEFERRED_BY_USER | Current explicit user instruction | DEFERRED_BY_USER | Keep max-six-minute row; no video action now |
| P39 | p4 §14 | Required | Public/evaluator-accessible working repo and submission checklist | Verify access/code/branches/artifacts; video status separate | UNVERIFIED | Public supplied empty repository A09; Correct public repo now contains audit/master history; Git transport verified | PARTIAL | Push verified runtime scope; full MVP/release artifacts pending |
| P40 | p4 §15 | Evaluation framing | Product/process/backend/frontend/Docker/testing/ownership all matter | Separate evidence, not invented evaluation score | UNVERIFIED | INITIAL_AUDIT separates process/data/UI/ownership | PARTIAL | Separate evidence; no invented scoring |
| P41 | p4–5 §16 | Constraints | No paid infra/secrets/giant finished initial commit/direct feature-on-master/needless tech/animation-over-integrity/hidden AI/generic cast | Security/Git/scope/disclosure review | UNVERIFIED | A03 baseline integrity; no paid infra or publication | PARTIAL | Per-stage staged secret/reference/history review |
| P42 | p5 §17 | Required process | Reasonable unspecified assumptions: document/implement consistently/explain | DECISION_LOG separates proposal/approved/revised | UNVERIFIED | DECISION_LOG + one pending consolidated question | PARTIAL | Record real response; no inferred domain approvals |
| P43 | p5 §18 | Required framing | Consistent cast and real development journey; explain choices | Seed/tests/docs/video later; no fake history | UNVERIFIED | A02 named fixtures; no project history yet | PARTIAL | Named server seed/tests/docs + actual commits |
| P44 | p5 §19 | Evaluation framing | Understand→Design→Build→Commit→Test→Ship→Explain→Debug→Change | Observable project evidence; not a separate screen | UNVERIFIED | Evaluation framing; not a runnable feature | UNVERIFIED | Human understanding separate from automated evidence |

## Source ambiguities are not permission to invent requirements
- PRD §1 says the original or another consistent cast can be used; §§6/14/16 emphasize
  the named story cast. Use Jashim/Bullet/Nusrat/Rafiq/Shirin throughout for this project.
- §18 references the concurrency problem as Section 14, but its text is in §12. Preserve
  the PDF unchanged; annotate this editorial mismatch when mapping it.
- A “roughly one second” story is not a defined measured load SLA. Define/measure any
  performance target separately, never claim an untested production latency.
- Exact rates, matching group, cancellation cutoff, session strategy and schema are
  implementation choices where unspecified, not hidden PDF requirements.

## Executed first audit

Initial status column is preserved handoff history, not current completion. Actual status/evidence columns are authoritative for this run. See INITIAL_AUDIT.md A01-A10 and evidence/runs/2026-09-29-initial-audit/. No modern backend requirement is VERIFIED.

## Database continuation evidence - 2026-09-29

DATABASE_AUDIT.md and evidence/runs/2026-09-29-database/ supersede the earlier no-DB blocker. Actual PostgreSQL 18.6 migration/seed/constraint/rollback tests PASS. P20/P23/P28 schema tooling and U04 now PARTIAL with real DB evidence; business transaction tests remain required. D01-D29 baseline adopted as engineering assumptions under current completion request; no migration/old approval overwritten. Docker P24/P25 remains PENDING_CI, not PASS. Video P38/U11 DEFERRED_BY_USER. Next real auth/ownership slice.

## Auth/request/allocation checkpoint — 2026-09-29

AUTH_AUDIT, REQUESTS_AUDIT and ALLOCATION_AUDIT supersede earlier absence claims. Real sessions/roles/owned quotes and request details, quantity reservation, matching and exact fares are implemented. Real PostgreSQL simultaneous last-seat cases for both winner orders, independent same-Jashim API instances, rollback/unknown-COMMIT recovery, private serialization and cancellations PASS. Docker/auth browser run 36528241459 PASS; booking run 36529197693 FAIL solely at an ambiguous test locator, repaired at 257dc32 with rerun pending. Lifecycle/history/full UI/graphs and final/release audit remain incomplete. Required video row remains deferred.

## Current complete-product audit — 2026-09-29 (supersedes historical statuses above)

Authority: all five actual PDF pages and role/stack/evaluation tables reread independently of prior completion summaries. Original/extras remain separate. Current evidence: complete UI CI36534145195/baf7434; hardening CI36534932216/37ef042; local final PostgreSQL/HTTP run; operating docs, actual architecture/ERD/API and screenshot provenance. Strengthened four-mode journeys/SSR and final64-case pre-release gates PASS36540258465/36540724158; release/v1.0.0 created/pushed from verifieda470f72. Earlier initial/foundation observations and approvals are preserved history.

| ID | Current artifact status | Actual implementation/evidence |
|---|---|---|
| P01 | VERIFIED | Named non-destructive DB seed and named four-actor pooling E2E; README/story |
| P02 | VERIFIED | RideRepository allowlisted own fare/status; PoolRepository owned roster; auth/request/allocation privacy tests |
| P03 | VERIFIED | Retained terminal requests/pools/memberships/events, stable IDs; lifecycle restart and history tests |
| P04 | VERIFIED | Real Nest Argon2/session signup/login/logout + four-mode gateway auth E2E |
| P05 | VERIFIED | Booking UI -> owned quote -> typed request -> PostgreSQL; real booking E2E/requests tests |
| P06 | VERIFIED | Exact integer-poysha solo/pooled quotes and own breakdown; named arithmetic assertions |
| P07 | VERIFIED | Real lifecycle/polling/stable terminal detail; named full journeys, terminal reload |
| P08 | VERIFIED | Own cancellation cutoff, atomic release, immutable canceled history; lifecycle/hardening tests |
| P09 | VERIFIED | Real driver session, own immutable Bullet/capacity and online/offline guards/races |
| P10 | VERIFIED | Relevant oldest dispatch and parent-locked acceptance; allocation E2E/actual SQL tests |
| P11 | VERIFIED | Authorized ARRIVE/START/COMPLETE exact-state guards and actual named UI journeys |
| P12 | VERIFIED | Owned current/historical roster with quantity and terminal keyset history |
| P13 | VERIFIED | Actual shared-driver two-API-instance contention, both last-seat winner orders, rollback, <=3 seats |
| P14 | VERIFIED | Durable one-lifetime membership, aggregate own pool detail, immutable per-booking fare facts |
| P15 | VERIFIED | Documented request/pool transition distinction; arrival closes joins/cancel; real guard tests |
| P16 | VERIFIED | Banani -> Mohakhali/Gulshan1/2 demo zones/distances; BANANI_V1 same pickup/group/version; named different-destination tests |
| P17 | VERIFIED | README hand-checkable fare-v1 formula, integer poysha, immutable quote/final snapshots; native exact arithmetic |
| P18 | VERIFIED | Cash-only choice; NOT_TRACKED collection, no invented paid/refund behavior |
| P19 | VERIFIED | Production Next App Router/Nest build and actual browser -> API flows |
| P20 | VERIFIED | Actual PostgreSQL18 schema/migrations/transactions; explicit rationale/alternatives |
| P21 | VERIFIED | Thin controllers/strict DTOs/guards/services/pg repositories/safe logs/errors; ownership, state, validation, concurrency tests |
| P22 | VERIFIED | Real API UI, pending/empty/error/recovery states, selected responsive design; current browser evidence |
| P23 | VERIFIED | Applied001 schema with types/FKs/partial unique/indexes/immutability; actual ERD and schema tests |
| P24 | VERIFIED | Actual CI Docker fresh/repeat up, migration + named explicit seed, persistent down/up, repeat seed, outage503/recovery200 |
| P25 | VERIFIED | Source-permitted tested free Docker fallback; OPERATIONS states no configured public backend/URL, no paid hosting |
| P26 | VERIFIED | README choices/realistic alternatives/fit/change triggers plus DEPENDENCIES/THIRD_PARTY_ASSETS |
| P27 | PARTIAL | Required AI disclosure/accepted+changed suggestion and debugging material VERIFIED; author's live explain/debug ability NOT_RUN, cannot be automated |
| P28 | VERIFIED | Early design retained; README Browser -> Next -> Nest -> DB, IMPLEMENTED_ARCHITECTURE and actual ERD match code |
| P29 | VERIFIED | One modular API, one UI and PostgreSQL; no gratuitous queue/cache/orchestrator infrastructure |
| P30 | VERIFIED | Contemporary scoped feature commits and tested non-fast-forward master integrations; exact public remote |
| P31 | VERIFIED | Integrated mastera6109ac -> tested pre-releasea470f72 PASS36540724158 -> actually created/pushed release/v1.0.0 at sameverifiedSHA; doc-only closure recorded separately |
| P32 | VERIFIED | Meaningful conventional commits preserved; no fabricated count/history or backdating |
| P33 | VERIFIED | Complete operating README/features/tree/requirements and17 original current-product PNGs with CI provenance |
| P34 | VERIFIED | Complete env/native/Docker/migrate/explicit seed/run/test instructions; named emails and operator-chosen private demo password |
| P35 | VERIFIED | Actual API/decisions/limitations/improvements/CI fallback/AI links; required video link explicitly deferred P38 |
| P36 | VERIFIED | Real PostgreSQL capacity/transition/ownership/cancel/fare/contention/rollback/replay and actual browser journeys |
| P37 | VERIFIED | SCALING reasoning only; no 1M-user benchmark or deployed scaling infrastructure claimed |
| P38 | DEFERRED_BY_USER | Required max-six-minute video submission retained; no script/record/upload/link |
| P39 | VERIFIED | Exact public repo/default master accessible; current runtime/docs/tests/artifacts and verified required release branch ordinary-pushed; see GITHUB_REPOSITORY/RELEASE_CHECKLIST |
| P40 | VERIFIED | Product/process/backend/UI/Docker/tests/privacy evidence separated; no invented assessment score |
| P41 | VERIFIED | No paid infra/private secrets/PDF publication/giant finished bootstrap/direct feature-on-master/history rewrite; actual staged review |
| P42 | VERIFIED | D01-D29 adopted documented engineering assumptions under §17/continuation; no invented individual rate approval |
| P43 | VERIFIED | Named seeds/tests/README and real development journey/choices; human video deferred separately |
| P44 | PARTIAL | Understand/design/build/commit/test/ship/debug/change artifacts observable; live human assessment NOT_RUN |

VERIFIED refers to actual artifact/tests in the stated environment, never a future production guarantee or evaluation score. P27/P44 human live ability is an assessment responsibility, not silently converted to PASS. Complete submission still includes the user-deferred required video. See FINAL_AUDIT for gate details and actual candidate result.

## npm structure re-audit — 2026-09-30

All five original pages/three tables and44original IDs independently reviewed after
the user-authorized conversion. Directory names/pnpm were not PDF requirements.
P24/P26/P28/P33/P34/P36 reverified: current npm docs/paths, independent app installs,
actual dev commands, production Docker, migrations and complete67distinct-case CI
36745538316/564118f SUCCESS (70executions including repeated dev smoke). Existing
product/DB/security tests and300view/four-mode UI checks PASS; SQL/assets/catalogs/
styles unchanged,13local tables/84references preserved. P30/P31/P39 follow actual
normal tested integration, with latest published SHA checks in Actions. P27/P44 human
assessment remains NOT_RUN; P38 required video DEFERRED_BY_USER. Detailed source
mapping and actual PASS/FAIL/BLOCKED/NOT_RUN limitations: NPM_STRUCTURE_AUDIT.md.

## TypeORM conversion review — 2026-10-02

User-requested database setup replaces pg-only access with TypeORM entities,
repositories, QueryRunner and split connection settings. Original product/privacy/
capacity/fare/lifecycle and all required UI extras remain in scope. P19–P26/P28/
P33–P36 and U01/U08–U10/U12–U13 require new access-layer regression evidence;
historical PASS does not certify this conversion. Current results and remaining
checks are tracked in TYPEORM_DATABASE_AUDIT.md. P38/U11 video remains deferred.

### TypeORM gate closure

Fresh complete CI37025204031/813008e SUCCESS verifies all previously pending Docker/
browser/access-layer checks above, including all four modes/300views and owned graphs/
recovery.72distinct tests/75executions. Native13table and84reference hash preservation
PASS; original SQL unchanged. Exact evidence/limitations: TYPEORM_DATABASE_AUDIT.md.
Human/video/TLS/formal certification statuses remain as previously classified.
