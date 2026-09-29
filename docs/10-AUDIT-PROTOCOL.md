# Mandatory initial, slice and final audits
## First task: source/PDF/UI audit
Read the original PDF in full, including p1 role table, p2 stack table and p4 evaluation/
submission sections. Use Markdown secondarily. Preserve required vs optional/suggested
wording and report actual ambiguities; do not invent missing policy and call it source.
Inspect latest UI source/screenshots and existing repo before package installs/scaffold.
Run existing tests in an isolated environment when available; identify historical
reports and environment limitations. Do not rerun destructive demos against real data.

Produce working docs/INITIAL_AUDIT.md, PDF_REQUIREMENT_MATRIX.md,
EXTRA_REQUIREMENT_MATRIX.md, UI_IMPROVEMENT_PLAN.md and DECISION_LOG.md. Protect existing
copies/progress; initial templates here are not actual audited statuses. Audit output
can be recorded before application changes. Every finding includes source page/section,
actual file:line/screen/state, observed issue or unverified risk, impact, correction,
regression test and whether it changes business scope. Include interaction and visual
comparison, not only file presence. UI source's demo auth is a known boundary, not a
new claim that a production system is vulnerable without inspecting that system.

## Improvement authority
The user requests improvements: after the findings are recorded, correct clear
in-scope usability/accessibility/requirement defects in small contemporary feature
commits with evidence. Preserve selected visual identity. Minor fixes need not trigger
another full approval loop; explain what changed. Material pricing/cancellation/matching
or existing architecture/migration conflicts need one consolidated decision. Current
stack, required extras and Git workflow are already selected and need no repeat vote.
Do not polish/translate the entire legacy demo and then discard it. Record the source
baseline, build the modern shell, apply fixes and i18n there. If there is existing modern
code, patch it rather than replacing it. Do not edit immutable reference for fake evidence.

## After each slice
Update both matrices with implementation/test/commit evidence; compare relevant PDF
clauses and user extras, run regression tests, inspect updated view in affected locales/
themes, review diff/security and log improvements vs proposals. Gate failures are blockers
for that scope, not excuses to lower tests. Use NOT_RUN/BLOCKED for unavailable tools.

## Independent final audit
Reread the original PDF fresh rather than trusting the task board or earlier assistant.
Trace UI -> Nest guards/DTO/service -> pg transaction/schema -> response/history; real
auth/ownership and all capacity/lifecycle paths. Review all four locale/theme combinations,
real chart data, unknown/failed states, graph date bounds, DB race, Docker persistence,
actual ERD, docs, dependency/license/secrets, Git ancestry/ref publication and access.
If subagents/tools are unavailable, use a separate review pass and describe it honestly;
do not claim independent reviewers were used without evidence.

Return findings severity (blocker/major/minor), reproduction/evidence, requirement ID,
minimum fix, regression. Fix confirmed within scope, rerun, record closure; don't delete
assertions or fabricate dates/results. Final checks must identify actual release/ref
and environment. A package checksum or prototype test never proves the real application.

## Completion categories
- Implementation & extras verified: actual required journeys/tests/diagrams/operation.
- Git/process verified: contemporary commits/branches and allowed target publication.
- Deployment: actual verified free URL OR source-permitted documented Docker fallback.
- Human video: DEFERRED_BY_USER until requested/completed; no new script/record/upload now.
- Full assessment submission: only after remaining required human/access artifacts.
Do not claim 100% merely because a checklist contains no blank cells.
