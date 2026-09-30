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
