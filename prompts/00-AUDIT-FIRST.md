# First audit: original PDF, current UI and actual repository
Read active AGENTS.md; preserve actual repo/progress. Use feature/ui-requirements-audit when appropriate,
following docs/09-GIT-RELEASE.md. No old Git HOLD. Respect platform approvals and actual
repository constraints. Paths below are relative to the active handoff docs.

## Read
AGENTS.md; FINAL_MASTER_PROMPT.md; docs/00-SOURCE-MAP.md; docs/PDF_REQUIREMENT_MATRIX.md; docs/EXTRA_REQUIREMENT_MATRIX.md; docs/10-AUDIT-PROTOCOL.md; reference/PRD.pdf; reference/ui-dark-light/README.md; relevant readable UI source/screenshots

## Work
Read all source pages/tables and actual repository first. Initial app inspection read-only;
audit-document writes are allowed after locating existing work. Inspect currently implemented
flows and the demo-to-real gap, selected visual identity, English strings/theme code, private
preview controls and legacy dependencies. Run relevant existing checks safely when their environment is available; otherwise
report exact NOT_RUN/BLOCKED reasons, not invented success.
Create/reconcile initial audit, both matrices, improvement plan and decisions. Separate PDF
requirements, user extras, fixed stack and unspecified business-policy choices. UI improvement
findings require source/screen/file evidence. Missing backend is missing backend, not solved
by a HTML screenshot. Then start a small in-scope improvement slice with contemporary Git
history if it is safe and decisions are settled. Don't redesign or translate the entire legacy
reference first. Ask once for material business/migration conflicts. A missing GitHub URL blocks
push only. Do not install/scaffold before the first audit exists.

## Evidence and gate
Initial source-linked report and exact missing/partial/unverified list exist; current
Next/Nest/Tailwind/Postgres + required extras/Git/video directions are reconciled; next correction
and regression are specific. App edits, if made after audit, are small tested feature work;
otherwise explain the material decision/blocker. Never claim every requirement is met yet.

Update actual task board/matrices/decisions; record changed files, exact commands/results,
branch/commits/remote status. Don't count historical prototype tests as current API proof.
If required tools/decisions are missing, state specific blocker. Continue only an authorized
coherent slice; don't collapse the entire phase into one giant untested change.
