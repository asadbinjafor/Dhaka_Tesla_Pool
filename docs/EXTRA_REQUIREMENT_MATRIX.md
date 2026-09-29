# Explicit user scope beyond the original PDF
These are now REQUIRED by the user; they are not represented as original PRD clauses.
All delivery/implementation states start UNVERIFIED in this handoff.

| ID | Latest user requirement | Acceptance evidence | Actual status | Evidence | Next acceptance |
|---|---|---|---|---|---|
| U01 | Next.js frontend | App Router project and real pages/API integration | PARTIAL | Actual Next App Router production build/start, SSR/smoke PASS | Real passenger/driver flows pending |
| U02 | NestJS backend | Modules/controllers/services/guards/pipes/filters; no independent Express business app | PARTIAL | Actual Nest modules/pg service/pipes/filter; 2 HTTP tests PASS | Real auth/guards/business repositories pending |
| U03 | Tailwind CSS | Actual Tailwind build/utilities + mapped visual tokens; preserve chosen design | VERIFIED | Tailwind4 production build, semantic tokens + selected artwork, four-combination browser evidence | Maintain tokens across future screens |
| U04 | PostgreSQL | Real DB migrations/constraints/transactions/tests | MISSING | No applied migrations/DB tools | Real Postgres integration tests |
| U05 | Existing selected rickshaw UI, BOTH Dark and Light | Same usable screens/state; manual theme control, persistence, responsive visual review | PARTIAL | Modern auth screens both themes, cookie refresh, 390/1440px review PASS | Complete passenger/driver screens and all state checks |
| U06 | Full Bangla and English support | Complete product-text catalog, localized formatting/errors/charts/ARIA; language switch retains route/draft/identity | PARTIAL | Implemented auth/not-found/ARIA catalogs en/bn parity PASS | Translate all future ride/driver/errors/dialogs/graphs |
| U07 | Real useful graphs | Owned completed-record aggregates; consistent labels/dates/card/table/chart; both locales/themes | MISSING | Prototype local chart only; runtime has no graph/owned completed DB records | Required owned DB aggregates + accessible localized charts |
| U08 | First task: original-PDF/source/UI audit, then justified improvements | INITIAL_AUDIT with evidence, gap/mismatch classification, scoped corrections/regressions | VERIFIED | INITIAL_AUDIT precedes app edits; justified first slice + FOUNDATION_AUDIT | Retain source provenance and scope decisions |
| U09 | Repeat audits after slices and independent final audit | Matrices, code/API/DB traces, actual tests, findings/fix/retest closure | PARTIAL | FOUNDATION_AUDIT with repairs/retest/evidence | Independent full original-PDF/extras audit after completion |
| U10 | Original PRD Git workflow including GitHub to supplied repo | Contemporary feature history, real integration/release, verified repo refs; no old Git HOLD | PARTIAL | Actual audit feature/master pushed; foundation feature active; Git transport works | Continue tested integration, then pre-release/release after MVP |
| U11 | Video only after completion | Visible DEFERRED_BY_USER until separately requested; not silently removed | DEFERRED_BY_USER | No new video action | Required row retained until later user request |

Four supported combinations, all required: English/Dark, English/Light, বাংলা/Dark,
বাংলা/Light. Keep both controls reachable on login, passenger and driver desktop/mobile.
Do not count 4 locale/theme combinations as 4 independent feature implementations.

## Additional explicit acceptance boundaries from current user request

| ID | Required boundary | Actual status | Acceptance |
|---|---|---|---|
| U12 | Real authenticated account UI and backend ownership; remove public demo identity switching | MISSING | Independent login sessions; no foreign resources/roles; logout safety |
| U13 | Theme/language retain identity, stable ride, valid draft/quote and pending command identity | PARTIAL (auth draft browser + canonical state unit tests) | Actual ride/identity/pending server command retention NOT_RUN until endpoints exist |

## Database continuation evidence - 2026-09-29

DATABASE_AUDIT.md and evidence/runs/2026-09-29-database/ supersede the earlier no-DB blocker. Actual PostgreSQL 18.6 migration/seed/constraint/rollback tests PASS. P20/P23/P28 schema tooling and U04 now PARTIAL with real DB evidence; business transaction tests remain required. D01-D29 baseline adopted as engineering assumptions under current completion request; no migration/old approval overwritten. Docker P24/P25 remains PENDING_CI, not PASS. Video P38/U11 DEFERRED_BY_USER. Next real auth/ownership slice.

## Auth/request/allocation checkpoint — 2026-09-29

U04 real PostgreSQL schema/auth/request/allocated capacity tests PASS. U12 now PARTIAL: actual authenticated account/sign-out/server ownership and role denial PASS, full future resource matrix still pending. U13 auth browser switch/pending login PASS; booking root draft/quote/exact command preservation implemented with gateway E2E pending repaired rerun. U05/U06 remain PARTIAL across expanded passenger/driver screens; U07 graphs MISSING until owned completed lifecycle records/statistics/UI. U09 feature audits recorded, independent final audit pending. U10 tested database and auth features integrated into master (9de6647/f2f2c99); no release claim. U11 DEFERRED_BY_USER retained.
