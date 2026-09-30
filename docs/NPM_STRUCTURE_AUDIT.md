# npm and separate application structure audit — 2026-09-30

## Authority and audit before application changes

The user's latest request explicitly authorizes conversion to the familiar npm,
separate frontend/backend setup used in the actual read-only reference project
`E:/razon/Tech-Trolley-Mobile-Shop-Inventory-and-Internal-Sales-Management-System`.
This supersedes the earlier discussion-only restriction and the handoff's proposed
`apps/web`, `apps/api`, `packages/contracts` paths. Folder names and pnpm are engineering
choices, not original PDF mandates. Next/Nest/Tailwind/PostgreSQL and all three extras
remain required. No new fare, matching, authentication or cancellation policy is needed.

Read actual applicable AGENTS, START_CODEX, FINAL_MASTER, audit prompt, architecture,
database/concurrency/state/testing contracts, current source/config/scripts and test
imports. Re-read all five original PDF pages and their three extracted tables; reviewed
the five existing rendered page images. Inspected immutable reference app interactions
in readable source (modal focus, theme, booking, demo switching), dark/light screenshots
and actual authenticated Bangla mobile graph/driver-pool screenshots. Original selected
Bullet/sidebar/color design is retained; reference assets are not edited.

Verified exact supplied origin via fetch and ls-remote. Baseline master d3e339d,
pre-release/release 0a01567 have identical application trees and meaningful history.
Existing tracked work is clean; original untracked handoff files are preserved and
excluded from scoped commits. Feature branch: feature/npm-project-structure.

## Findings

| Area | Implemented / mismatch / correction |
|---|---|
| Product and server integrity | Existing real sessions, ownership, immutable quotes/fares, guarded lifecycle, parent-locked PostgreSQL capacity, history and recovery; previous 64-case full CI is historical proof for its old revision, not this conversion. Preserve source and rerun. |
| Original PDF | Requires maintainable code, documented architecture, local frontend/backend execution, Docker, migrations/seeds and tested concurrency. It does not mandate workspace tooling or these directory names. P24/P26/P28/P33/P34/P36 require fresh packaging verification. |
| User extras | Owned SQL graphs, complete en/bn, dark/light and stable identity/ride/draft/quote/command state exist. No extra is removed or made optional. New packaging browser checks are NOT_RUN at audit time. |
| Actual Tech-Trolley reference | Separate named frontend/backend folders, independent package.json/package-lock.json, frontend npm run dev and backend npm run start:dev. Reference dependency versions, JWT/TypeORM policies, ports and inventory-specific features are not applicable to Dhaka. |
| Install/run gap | Current pnpm filters/workspace:* and root-hoisted TypeScript make standalone npm install/run impossible. Backend watcher only watches compiled dist and does not compile source changes. Correct standalone dependencies/config and source watch. |
| Relative paths | Tests, migration lookup, Next bundler root, Docker/Compose/CI and operating docs point at old layout. Update consistently; migrations must resolve independent of working directory. |
| Contracts | Only frontend imports the nominal shared package; backend does not. Place the same canonical presentation/API definitions inside frontend src/lib/contracts.ts, without a separate workspace dependency or duplicate server logic. |
| Environment/data | Retain existing private root .env and outer PostgreSQL data. Backend can use its own private .env or existing root fallback, respecting explicit process variables. Provide examples only. Never auto-reset or seed existing accounts. |
| UI/accessibility | Existing full-mode journeys, keyboard/focus, mobile graphs and 300-view evidence are retained. No confirmed design defect justifies visual edits for a package conversion. Revalidate actual production UI; formal assistive-technology certification remains unclaimed. |
| Decisions | No unresolved material business or schema migration decision identified. Use familiar dhaka-tesla-pool-frontend/backend names; keep mandatory tests/docs/evidence as support folders. Git root stays in the existing handoff directory to preserve history and local paths. |
| Operational limits | Local PostgreSQL currently stopped; start the same verified existing cluster when executing DB gates. Local Docker unavailable; use actual repository CI for Docker/browser evidence. Previous additional preview approval rejection is respected. |
| Submission | P38/U11 remains required DEFERRED_BY_USER. Human live explain/debug assessment and public TLS hosting cannot be inferred from automated tests. |

## Next smallest correction and acceptance gates

1. Move existing application sources to two independently installable npm packages;
   move unchanged SQL into backend/migrations and frontend-only contracts into its src.
   Retain pinned direct versions and explicit dependency-build approvals in npm policy.
   Record before/after source hashes, dependency changes and any actual audit findings.
2. Each app: npm install and clean npm ci, build, typecheck; frontend dev/start and
   backend start:dev/start:prod work from that app directory, with backend source reload.
   Root npm package is optional test orchestration, not an app workspace dependency.
3. Run lint, all existing unit/native PostgreSQL suites and new cwd/environment/watch
   checks appropriate to changed behavior. SQL checksum, existing records and secret
   hashes must be unchanged. Never run mutation E2E against user application records.
4. Actual clean CI checkout: independent npm ci, production Docker up/repeat up,
   migrations, explicit named seed, all 27 existing browser cases, 300 responsive views,
   smoke, persistent restart/reseed and outage recovery. Preserve assertions and video off.
5. Independent final PDF/extras audit with PASS/FAIL/BLOCKED/NOT_RUN evidence and exact
   refs. Fix/retest confirmed gaps, then ordinary tested feature -> master -> pre-release
   -> release/v1.0.0 integrations. No claim of guaranteed future error-free operation.

At this initial checkpoint conversion execution is NOT_RUN; original audit/progress/
approval/history evidence remains preserved. Append results after each tested slice.

## First execution checkpoint

- npm install independently at backend/frontend/root: PASS, no peer bypass, each
  reports zero registry vulnerabilities. Existing compatible direct version pins
  retained; npm12 version-pinned allowScripts and strict policy retain native build
  approvals. ESLint9 deprecation remains disclosed, not suppressed or auto-upgraded.
- Both production builds and app-local typecheck/lint: PASS. Existing 9 unit tests:
  PASS, unchanged assertions. No UI redesign, catalog/style/asset edit.
- Initial combined native glob: FAIL (30 tests:27 PASS,3 FAIL). It accidentally
  included the existing production web-smoke suite before starting containers;
  three ECONNREFUSED127.0.0.1:3000 failures, no business assertion failure. Repair:
  explicit native suite list; preserve all three smoke assertions as a separate
  post-Compose gate. Full native rerun including genuine env/cwd/watch tests pending.
- First local PG start omitted the prepared cluster's explicit port and failed
  binding default5432. Same existing data then started successfully at127.0.0.1:15432;
  no init/reset/schema change. Operational guide includes that required port.
- Combined README/instruction batch edit: BLOCKED by automatic review, reason
  "blocked by policy". Kept handoff instruction files unchanged; narrower README
  corrections and a new separate RUN_NPM_BN guide succeeded. No protection bypass.
- Baseline source/dependency review saved in preservation-and-lock-review.json;
  fresh CI Docker/browser and final data/secret/reference verification remain NOT_RUN.

## Packaging/watch correction checkpoint

- Initial added watcher full rerun:28 cases,27 PASS,1 CANCELLED on120s timeout;
  old supervisor retained its IPC handle on graceful shutdown. Only that verified
  test-owned supervisor was stopped, allowing fixture cleanup; no user process killed.
- Focused watcher run then exposed inherited Node --env-file=.env flags in the test
  launcher at backend cwd (missing backend .env is valid when root fallback is used).
  Repair: test fork execArgv=[]; explicit environment is already inherited. Production
  runner closes its supervisor IPC channel during shutdown. All original assertions
  retained; focused real compile/restart/readiness/child-cleanup test now PASS1/1.
- Independent clean npm ci at root/frontend/backend: PASS (331/360/244 audited
  package entries respectively; no unreviewed install scripts and zero advisories).
- Source preservation:77 original files mapped;42 BYTE_IDENTICAL,32 IMPORT_PATH_ONLY,
 3 startup/env/migration path adapters. SQL/catalogs/styles/art/contracts are unchanged.
  No unexplained source change. Actual prior pnpm lock versus union of npm locks shows
 9 transitive resolution differences (browser metadata, resolver/ignore/source maps,
  pg URI/protocol/optional Cloudflare dependencies); direct versions unchanged. Full
  actual SQL/HTTP/build/browser regression verifies the new lock, not assumed equivalence.
- Post-clean-install full native/build/lint/type/unit run is in progress; CI still NOT_RUN.

## Post-clean-install native gate — PASS

Both independent production builds, typechecks, app/root lint,9unit and28 native
SQL/HTTP/setup cases PASS, exit0. native-final.txt records the actual complete run;
native-watch-initial.txt preserves the earlier timeout. All13 application tables are
byte-equivalent to their pre-conversion snapshot (data-preservation.json contains no
private records).84 reference hashes PASS. Install-script pending lists empty; runtime
npm audits for both apps report0 advisories. No private env/reference asset staged.

Code commit564118f ordinary-pushed to the verified feature branch. CI36745538316
has passed clean installs/build/type/lint/native and the actual per-folder npm dev
commands with three SSR/gateway checks. Production Docker/browser checks still in
progress, not yet claimed PASS. GitHub connector is disconnected; public GitHub REST
provides actual run/job status, without requiring the user to connect another service.

## Independent final original-PDF and extras review

After implementation and repairs, reviewed all19 PDF sections/three tables against
the44 original matrix IDs and13 separate required user-extra IDs, current source
diff, actual clean CI and current screenshot attachments. This is a separate review
pass by the same agent, supported by independent clean Linux CI execution; it does
not claim a second human reviewer. Source preservation review found no unexplained
domain, UI, catalog, asset or applied-SQL change. Reviewed env reads: auth Origin/
Secure-cookie decisions occur at request time after startup loading, so the new
native environment adapter does not freeze old defaults during module import.

CI [36745538316](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36745538316),
exact code564118fb8188469233b63856bf01bca7716e3b0f: completed **SUCCESS**.

| Verification | Actual result |
|---|---|
| Independent npm install and clean npm ci, exact pinned direct packages | PASS native and clean CI; root test tooling optional, Docker builds apps without a root package/workspace |
| Both builds/typechecks; frontend/backend/root lint | PASS native and CI |
| Unit catalog/format/gateway/state tests | PASS9/9 |
| PostgreSQL/Nest HTTP + cwd/env/source-watch cases | PASS28/28, no skips; original25 retained plus3 meaningful setup cases |
| Actual frontend npm run dev + backend npm run start:dev | PASS CI, same3 SSR/gateway checks under development |
| Production Compose clean/repeat up, migration and named explicit seed | PASS |
| Production SSR/gateway | PASS3/3 |
| Production browser journeys/auth/ownership/recovery/four-mode graphs/UI | PASS27/27, retries0, skipped0, unexpected0, flaky0 |
| View audit | PASS300/300 at360/390/768/1024/1440; zero outer overflow, zero configured axe violations, minimum graph label14px |
| Persistent down/up and repeat seed preserve records; DB outage503 then recovery200 | PASS actual Docker commands/assertions |
| Existing local application data/schema ledger | PASS all13 tables unchanged; no private rows in evidence |
| Immutable handoff/reference files | PASS84 hashes |
| Dependency audit/build approval/secrets | PASS zero reported advisories, no unreviewed lifecycle scripts; exact private env values absent from scoped staged files |
| Current screenshots | Original16 PNG attachments copied unchanged; sampled dark/light overview, Bangla mobile booking/graphs and driver views visually reviewed |

There are **67 distinct test cases**, **70 test executions** because the three smoke
cases run under both dev and production. The300 view measurements are checks inside
eight browser cases, not300 extra test cases. browser-evidence.json includes actual
rows, source/run IDs and screenshot hashes. Native failed attempts are retained;
no assertion was weakened, production timeout relaxed or user data reset.

| Source scope | Final assessment |
|---|---|
| P01–P18 product/story/privacy/driver/pooling/geography/fare/payment | PASS existing actual domain suites and real browser journeys; adopted rules unchanged |
| P19–P26 stack/security/model/Docker/fallback/choice justification | PASS new standalone builds, full gates, current paths/operating docs and reviewed locks; no public hosted URL fabricated |
| P27 AI disclosure/ownership | Artifact disclosure PASS; human live explain/debug assessment NOT_RUN |
| P28–P29 architecture and appropriate organization | PASS current diagram/ERD/README match two independent apps and one modular API; no new infrastructure |
| P30–P32 Git workflow/conventional history | Feature audit and tested conversion commits PASS; working master/pre-release/release publication follows under the authorized normal workflow, exact published checks in Actions |
| P33–P36 README/env/run/tests/demo/API/screenshots | PASS current npm guide, two app READMEs, diagrams, original credentials policy and full actual gates |
| P37 scale bonus | Reasoning retained; no benchmark or extra infrastructure claimed |
| P38 required video | DEFERRED_BY_USER; row retained, no scripting/recording/upload |
| P39–P43 public repo/process/safety/assumptions/cast | Artifacts/source PASS; normal final integration verified separately; original history/approvals/reference/migration/data retained |
| P44 human engineering assessment | Implementation/debug/change artifacts PASS; live human ability NOT_RUN |
| U01–U07 selected stack/themes/full languages/owned real graphs | PASS all required scope retained and re-executed |
| U08–U10 audit-first/slice+final audit/Git | PASS recorded audits and tested source; final published refs checked separately |
| U11 video | DEFERRED_BY_USER |
| U12 real account/server ownership | PASS actual independent authenticated sessions/denial tests, no demo selector |
| U13 identity/ride/draft/quote/pending command across presentation switches | PASS exact recovery/state browser assertions retained and executed |

No unresolved confirmed required code or packaging defect remains after repairs.
Material business or applied-schema decisions: none needed for this conversion.
Known boundaries remain: formal assistive-technology/WCAG certification NOT_RUN
(axe incomplete color-contrast nodes retained), public TLS hosting NOT_RUN (tested
source-permitted Docker fallback), local Docker/additional frontend preview BLOCKED
by host/tool availability/policy. Those are not mislabeled local PASS. Full reload
loses unfinished in-memory draft/intent as previously documented; presentation
switches and same verified-account reauthentication preserve it. ESLint9's compatible
Next-plugin deprecation trade-off remains disclosed. No future error-free guarantee.

Original Tech-Trolley project was inspected read-only and never modified. Empty
obsolete apps/database/packages directories were removed only when actually empty;
old ignored node_modules/.next/dist were moved to the named outer local-runtime backup,
not deleted. Git/application root remains the existing handoff directory. Application
folders and npm run experience now match the user's reference; internal domain
organization remains appropriate to Dhaka. Handoff instruction files are unchanged;
DECISION_LOG and current guides record the latest user-authorized path mapping.
