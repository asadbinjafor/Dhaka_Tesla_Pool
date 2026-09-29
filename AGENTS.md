# Dhaka Tesla Pool — active project instructions, handoff v3
Read START_CODEX.md and FINAL_MASTER_PROMPT.md. Paths here are relative to this handoff;
first establish the ACTUAL application/Git root. This is source/guidance, not a finished app.

## Latest scope and authority
- Original requirements: reference/PRD.pdf, all 5 pages/19 sections; readable PRD.md is
  secondary. Classify required/recommended/example/optional accurately.
- User-selected stack: Next.js App Router frontend, NestJS Node backend, Tailwind CSS,
  PostgreSQL. No standalone Express application. Nest's underlying HTTP adapter is not
  a second business API. Preserve good existing code while planning any migration.
- User-REQUIRED extras: database-backed graphs; both Dark and Light; complete Bangla
  and English interface. Extras are not original-PDF requirements, but they are now
  in acceptance scope. No silent graph/language deferral.
- Current visual/source target: reference/ui-dark-light/. Bullet is a battery-powered
  local rickshaw, three passenger seats; driver separate. Do not use a Tesla sedan.
- Latest workflow replaces earlier Git HOLD/all-Git-later, optional-graphs and
  standalone-Express directions. Video alone remains DEFERRED_BY_USER until after
  implementation/audit. Unspecified business rules remain documented proposals.
- Respect platform/tool approvals and applicable existing repo instructions. Surface
  conflicts; do not erase existing instructions to force permission. Reconcile current
  user changes in docs/DECISION_LOG.md, without reopening settled decisions needlessly.

## FIRST task: evidence-based audit, then targeted improvement
Read the PDF including its tables; inspect current source, screenshots, actual repo
and existing tests before edits/scaffolding. Record docs/INITIAL_AUDIT.md and reconcile
PDF_REQUIREMENT_MATRIX.md plus EXTRA_REQUIREMENT_MATRIX.md. Distinguish observed
prototype behavior, actual app implementation, assumptions and NOT_RUN evidence.
Initial inspection is read-only for app code. Audit-document writes are allowed.
After recording the audit, implement clear in-scope bug/accessibility/flow improvements
as a small tested feature slice, not a silent redesign or destructive migration.
Ask once for material unresolved policy choices; do not ask to reapprove this explicit
stack or three extras. Do not spend multiple passes polishing legacy React just to
throw it away: port known fixes into the modern target. Preserve reference bytes.

## Implementation contract
Read docs/03-ARCHITECTURE.md, 04-DATABASE.md, 05-API-CONTRACT.md, 06-CONCURRENCY.md,
07-UI-I18N.md, 08-TEST-PLAN.md and 12-STATE-CONTRACT.md for the current slice.
Nest controllers stay thin; guards/pipes/filter + services + transaction repositories
own server rules. Same pg client and consistent parent locks across mutations. Keep
one-request/one-pool/capacity invariants; preserve stable terminal details and fares.
No client-authoritative role/fare/status/seat count. No public demo account switching,
reset tools, shared passenger dataset, static-server-as-business-API or legacy vendor
runtime in the deployed app. Theme/locale preferences may be persisted client-side;
that does not authorize storing credentials or global private ride data there.

Use en/bn UI catalogs and locale-prefixed stable UI routes; API remains /api/v1.
Translate forms, errors, statuses, dialogs, charts and accessible labels—not only nav.
Keep IDs/enums/numeric money canonical. Language/theme changes preserve identity,
ride ID, drafts, quote and pending-command key; never create duplicate business actions.
Test all four locale/theme combinations. Graphs must use owned completed records.

## Git and remote scope
Follow PRD §§10–11 contemporaneously: feature/* + meaningful incremental conventional
commits -> working integration into master -> pre-release -> release/v1.0.0.
After initial audit, ordinary scoped local Git operations for this authorized project
are permitted; the old blanket HOLD does not apply. For a new repo, use only a minimal
bootstrap on master before actual feature work. Inspect existing roots/history/dirty
work first; don't overwrite another repo or alter global Git identity.
Read GITHUB_REPOSITORY.md. No URL is supplied in this handoff. Missing remote does not
block local audit/work, but push is BLOCKED_REPO_URL until the user supplies the exact
repository and access exists. Once supplied/verified, normal tested branch pushes and
non-destructive integrations under this workflow are authorized; don't manufacture an
extra approval for every ordinary operation. Report exact refs/commits/results.
No force-push, history rewriting/backdating, branch deletion, credential exposure,
blanket --all/--mirror, or publication to another repo. Pause on conflicts, unrelated
remote history, missing permission, failing gates or required host approvals.
Check secrets/reference inclusion; do not bypass protection rules. Never dump all
finished code into a first commit. Requirements specify history, not a number of pushes.

## Audit and evidence
Add tests alongside each slice; update matrices, DECISION_LOG and actual TASK_BOARD.
PASS requires actual executed evidence. Treat inaccessible DB/browser/Docker as
BLOCKED/NOT_RUN. Do not alter assertions to hide a defect. Historical UI or package
checks are not real DB/security/E2E proof. Run an independent final original-PDF and
extras audit, repair confirmed issues, rerun affected checks on the release candidate.
Record implementation-ready separately from full-submission-ready; video remains a
visible deferred requirement, no invented link or new video task now.

## Existing repositories and safety
Use prompts/RECONCILE_EXISTING.md. Do not overwrite code, approval logs/task boards,
applied migrations or Git history with templates. Avoid arbitrary bulk refactors,
destructive seed/reset operations, paid services or publishing private PRD assets.
Reference documents are immutable; history archive is not active instructions.
Respond to the user in Bangla; code identifiers/technical docs remain consistent English.
