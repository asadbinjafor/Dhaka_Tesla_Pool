# Dhaka Tesla Pool — Final Master Prompt v3

Act as my implementation engineer. Build the real MVP from my original internship
PDF and the latest selected Dark/Light rickshaw UI. Your FIRST job is to audit the
actual UI/source against the PDF, identify missing requirements and justified
improvements, then implement those improvements and the full app in tested slices.
Do not start with a generic new dashboard, blind scaffolding or another endless plan.

## 1. Current scope, sources and superseded directions
Read applicable repository AGENTS.md, this handoff's AGENTS.md, actual Git status,
current code, approvals and task progress. Establish handoff root vs application root.
Use reference/PRD.pdf (all five pages, including tables) as original requirement source;
PRD.md is the readable secondary copy. Do not alter source or quietly invent gaps.
Current UI is reference/ui-dark-light/: index.html, readable src, assets, screenshots,
docs/tests. This is a demo, not a completed API/database. Inspect it, not just its image.

My selected stack is now:
- Frontend: Next.js App Router.
- Backend: NestJS on Node.js.
- Styling: Tailwind CSS, preserving the selected UI/design tokens.
- Database: PostgreSQL.
Use TypeScript and supported compatible maintained libraries with reasons/alternatives
as required by PDF §7. Do not build a separate standalone Express business API. Nest's
underlying HTTP adapter is acceptable but business architecture must be NestJS.

My REQUIRED extra features, separate from PDF clauses:
1. Useful real-data graphs.
2. Dark AND Light modes.
3. Complete Bangla AND English product UI.
These are no longer agent-optional enhancements. Keep them in acceptance/test scope.

The latest request replaces the older standalone Express/plain-styling/optional-graphs
and all-Git-later/HOLD proposals. Follow the actual PDF Git workflow during development;
I will supply the intended GitHub URL. Video alone remains deferred until after
implementation/audit. Do not reintroduce earlier conflicting instructions from
reference/history/Codex_Kit_v2_HISTORICAL.zip. Preserve useful historical code/evidence;
never overwrite existing approvals, migrations, task boards or Git history.

## 2. FIRST task: original-PDF and current-UI audit
Before application changes, inspect every PDF section, the current UI source and
screenshots, any existing application, test commands and environment. Run available
checks safely, distinguishing historical reports from fresh executed evidence.

Create/reconcile in the WORKING project:
- docs/INITIAL_AUDIT.md
- docs/PDF_REQUIREMENT_MATRIX.md
- docs/EXTRA_REQUIREMENT_MATRIX.md
- docs/UI_IMPROVEMENT_PLAN.md
- docs/DECISION_LOG.md

For each source clause and user extra, record source page/section or user authority,
required/recommended/example/optional classification, actual screen/file:line/API/DB,
verification, missing work, status and proposed correction/test. A mapping is not proof
of implementation. Audit actual navigation, forms, validation, ownership, loading/error/
empty/cancelled states, mobile and selected appearance. Preserve source terminology.

Record findings before fixes. Then make small in-scope requirement/usability/accessibility
corrections under the Git workflow, with regression evidence. I authorize justified
improvements—not a silent redesign or material new business scope. Resolve substantive
fare/matching/cancellation or existing architecture conflicts in one consolidated
question. My explicitly selected stack/extras/Git policy need no repeated approval.
Do not fully polish the legacy demo and then throw it away; port identified corrections
and useful visuals into the maintained target. Reference files stay immutable.

## 3. Architecture and implementation boundaries
Follow active docs/03-ARCHITECTURE.md. Use one modular Nest API with modules/controllers,
injected services, validated DTOs/pipes, session/role guards, resource ownership checks,
a global safe error filter, and explicit transaction repositories.

Browser -> Next.js/Tailwind/en-bn UI -> same-origin /api/v1 forwarding -> NestJS -> Postgres.
Next does not own a second set of ride/auth business writes. The actual gateway must
preserve session cookies, CSRF and safe private cache headers. No trusted client roles.
Use parameterized pg repositories as the proposed data-access baseline; alternate ORM
requires justification without weakening isolation/locks. Verify and pin actual supported
Next/Nest/Tailwind/Postgres/Node/session/migration/i18n/test dependencies; do not copy
reference React16 or invent versions. Record choices/alternatives in README.

Create/adapt apps/web, apps/api, packages/contracts, database/migrations/seeds,
tests/integration/e2e and docs. Preserve a good existing compatible architecture.
Start Tailwind theme tokens and i18n infrastructure in the foundation, not at the end.
Use real database migrations, repeat-safe named seeds, health/readiness and early Docker.

## 4. Product and domain requirements
Preserve Jashim/Bullet and Nusrat/Rafiq/Shirin. Bullet is the local battery-powered
rickshaw, with THREE passenger seats plus the driver, not a Tesla car.
Implement every passenger, driver and pooling requirement in the original PDF: actual
signup/login, pickup/destination/quantity, own fare/status, valid cancellation, history,
driver online/offline/relevant requests/accept/arrive/start/complete, owned roster and
history, clear memberships and never-overbooked capacity.

Read docs/02-DECISIONS.md and reconcile prior real approvals. Where the PDF is not
specific, keep policies explicitly proposed/documented rather than claiming exact
source mandates. Proposed baseline: one active request/passenger; one active pool/
driver/vehicle; seat reservation on acceptance only; configured same-pickup/group match;
join/passenger-cancel cutoff at arrival; fare freezes at arrival; driver whole-pool
cancel before start; zero cancellation charge; pool-wide completion; no rematching;
Cash only; collection NOT_TRACKED; waiting bookings don't expire with their quote.

Use the named hand-verifiable demo fare examples and integer poysha from the decision
document. Distinguish quote maximum/potential discount/current estimate/final price.
Preserve finalized price evidence on later permitted cancellation, with primary charge
zero. Do not label cash as paid/refunded or chart driver earnings without actual scope.
A multi-seat booking counts quantities and does not alone qualify as another rider.

## 5. Integrity and privacy are not UI features
Read docs/04-DATABASE.md, 05-API-CONTRACT.md, 06-CONCURRENCY.md and
12-STATE-CONTRACT.md before these writes. Retain v2's corrected semantics:
- Real DB uniqueness/relationships, including active resources, quote consumption,
  lifetime membership and valid paired vehicle/driver + quote/passenger ownership.
- One checked-out pg client for the whole transaction; pass it into repository calls.
- Consistent parent-first locks for all conflicting write paths: idempotency claim,
  persistent driver, vehicle, pool, affected requests sorted. Protect no-pool creation.
- Finish parent-lock statement before occupancy reads in later READ COMMITTED statements;
  no lock+SUM CTE shortcut or process-local mutex as proof of capacity safety.
- Re-read authoritative seat SUM and rules before assignment; losing request remains
  waiting with no partial membership/events/receipt. Cancellation never releases twice.
- A waiting cancellation discovering assignment rolls back the entire attempt and retries
  driver-first, never reverses lock order.
- Idempotency UNIQUE(actor_id,action_scope,key), binding canonical target/body hash.
  Authorized same-key committed receipt replays BEFORE fresh expiry/consumption/state
  guards. Fresh key can't bypass consumed transition. No unfinished success receipt.
- After quote lock capture actual DB wall-clock for fresh expiry validation. Successful
  booking/replay doesn't expire with the quote.
- Unknown COMMIT acknowledgement isn't proven rollback. Discard broken connection and
  reconcile the SAME intent/key with bounded retries, not a duplicate request.
- Preserve prior cancelled members, price snapshots and terminal event/history evidence.

Keep own data only in passenger APIs, including nested events/errors/stats/caches.
Driver access is relevant requests/owned pools, not arbitrary accounts. Remove public
Preview as/Explore another perspective/demo scenario/reset tools from deployed UI.
Real signed-in account menu replaces them; hiding a selector alone isn't authorization.
No global passenger dataset/browser-local role-based security. Theme/locale preferences
can persist locally, not real credentials/shared private domain data.

Use stable /[locale]/passenger/rides/[id] and /[locale]/driver/pools/[id]. /current is
active-ID discovery only; a terminal detail still works after reload when current=null.
Owned representations depend on BOTH request and pool versions. Read coherent snapshots,
cancel stale requests and protect against delayed previous-session callbacks on logout.
Use terminal ended_at+ID pagination with full DB timestamp precision and actor/filter scope.

## 6. Complete Bangla/English + independent Dark/Light
Implement docs/07-UI-I18N.md, not just two toggle buttons.
- Use catalog-based en/bn translations for all product copy: auth, navigation, forms,
  validation/API errors, status, fare, dialogs, cancellation reasons, history, filters,
  toasts, graphs/tooltips, empty/error/loading, accessible labels and error pages.
- Use stable API error/reason/event codes + safe parameters. Never show raw English
  Nest/SQL failures in the Bangla UI. User-written names/reasons remain as entered.
- UI routes are locale-prefixed; API stays /api/v1; exclude API/static paths from locale
  routing. Same underlying IDs/data/permissions across languages.
- Keep visible বাংলা/English switch and Dark/Light control on authentication and both
  roles, desktop/mobile. Correct html lang and LTR layout, persisted preferences,
  consistent SSR/client initial rendering with no hidden hydration errors.
- Format canonical amounts/date/counts using selected locale, BDT and Asia/Dhaka; data
  stays numeric poysha/UTC. Test Bangla typography, wrapping and input numerals safely.
- Switching either control preserves account, route/ride ID, valid form draft/quote,
  filters and pending idempotency key. No resubmission or fare/capacity change.
  Locale/theme are not canonical business-command hash fields.
- Four required combinations: EN/Dark, EN/Light, BN/Dark, BN/Light. Test all core views
  and both roles at mobile/tablet/desktop widths, including meaningful interaction paths.
- Check catalog key/placeholder parity and missing translations. templates/messages
  is a starting glossary, not a claim that application translation is already complete.

## 7. Required graphs
Build authenticated completed-history statistics and usable charts/data tables. Passenger
sees own completed ride count/fare total/discount; driver sees owned completed trip count,
seats served/utilization. Explicit date range and timezone. Correct canceled/multi-seat/
empty/zero/error handling; avoid joining members in a way that multiplies capacity.
Translate axes, legends, tooltips/ARIA; readable in both themes. No fake impact/ETA/revenue/
battery/match figures from concept images. Charts cannot be silently deferred as optional.

## 8. Real Git and GitHub workflow
The old Git HOLD is withdrawn. Follow original PDF §§10–11 DURING actual work:
feature/* + logical incremental conventional commits -> working integration into master
-> pre-release integration/docs/checks -> release/v1.0.0 from verified pre-release.

Read GITHUB_REPOSITORY.md. No URL is prefilled; I will provide the exact repository.
Audit/work may proceed locally without it. Do not invent or guess a remote. Verify actual
root, existing history/dirty work, intended owner/repo, permissions and protection rules.
After initial audit, scoped local branches/staging/commits/integration are authorized for
this requested project; do not ask again for the withdrawn HOLD. For a new repo use a
minimal bootstrap, then actual feature branches, not a finished system initial commit.

Once my destination/access is supplied and verified, push normal tested feature/integration
scopes as the work progresses. Report exact branch/commit range/remote and results. Preserve
prerequisite ancestor history. No arbitrary push-count target; keep real meaningful history.
Respect required runtime approval controls and remote reviews. Pause on nontrivial conflicts,
wrong remote, secrets/private asset risk, blocked tests or insufficient access. No force-push,
backdating, history rewrite, blanket --all/--mirror, unrelated branch delete or public visibility
change. Never commit private PRD/reference assets by default. GitHub Actions/PR are choices,
not invented PDF mandates. Do not replace required release branch with only a tag.

## 9. Tests, audit gates and completion
Add tests with each slice, including actual PostgreSQL independent-connection and
same-pool two-instance races. Rafiq reserves two seats; Nusrat and Shirin concurrently
claim the last via SAME Jashim/Bullet/database, exactly one succeeds. Assert stored seats,
rows/status/fare/events, not only HTTP codes. Include no-pool creation, one-request/two-driver,
replay/unknown commit, quote wait expiry, cancellation/arrival/join races, privacy,
terminal reload, four theme/locales and actual chart aggregates. See I01–I50 + X01–X16.

After every slice cross-check source and extras, update matrices and tests. Then at
completion reread the original PDF in a separate audit pass; do not trust previous
checklists or your own 'done' summary. Trace actual UI -> Nest -> DB -> response/history,
check docs/ERD/Git/Docker. Classify confirmed defect vs unverified risk. Fix authorized
confirmed gaps and rerun regression/full relevant checks on the actual release candidate.

Run actual lint, typecheck, build, unit, integration, E2E, i18n and Docker fresh/restart/
failure checks. Record commands/environment/ref/result. Missing environment is
BLOCKED/NOT_RUN, never PASS. Don't weaken tests or claim prototype/package checks prove
real backend security. Maintain requirement-linked evidence, not fabricated percentages.

## 10. Delivery and video boundary
Provide real operating README, exact setup/env/migration/seed/test instructions, named demo
access policy, current architecture+ERD, API overview, reasons/alternatives, limitations,
factual AI disclosure and screenshots. Free hosting only; PDF-permitted documented tested
Docker fallback when appropriate. Never invent a public URL or remote push result.

Do NOT work on new video scripts/recording/editing/upload now. Mark PDF §13 video
DEFERRED_BY_USER until after implementation and final audit. It stays a required
submission row; do not falsely mark the full assessment complete without the later video.

Report after each task in Bangla: requirement IDs, findings/changes/file paths, actual tests,
Git refs/publication results, unresolved decisions/blockers and next smallest slice. Keep
existing task-board/approval history. No generic full restart on every session. Read
prompts/RECONCILE_EXISTING.md or RESUME.md where appropriate. No destructive data resets,
unrelated rewrites, paid services or publishing private material.

## Start now
Execute prompts/00-AUDIT-FIRST.md. Audit the PDF and latest source/UI first, record
findings, resolve material unsettled policies, then implement justified small improvements
on the correct feature branch. Continue scoped tested work through the phase plan rather
than trying to finish everything in one unreviewable change. Follow real Git development
history from the first change; don't wait until the app is finished. The repo URL may be
provided separately; do not block the initial source audit on its absence.
