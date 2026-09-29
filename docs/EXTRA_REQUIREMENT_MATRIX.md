# Explicit user scope beyond the original PDF
These are now REQUIRED by the user; they are not represented as original PRD clauses.
All delivery/implementation states start UNVERIFIED in this handoff.

| ID | Latest user requirement | Acceptance evidence | Actual status | Evidence | Next acceptance |
|---|---|---|---|---|---|
| U01 | Next.js frontend | App Router project and real pages/API integration | MISSING | No apps/web at audit start | Next App Router production build |
| U02 | NestJS backend | Modules/controllers/services/guards/pipes/filters; no independent Express business app | MISSING | No apps/api; static serve.cjs only | Nest modules/guards/services/health/API |
| U03 | Tailwind CSS | Actual Tailwind build/utilities + mapped visual tokens; preserve chosen design | MISSING | reference styles.css plain CSS | Tailwind compiled semantic tokens |
| U04 | PostgreSQL | Real DB migrations/constraints/transactions/tests | MISSING | No applied migrations/DB tools | Real Postgres integration tests |
| U05 | Existing selected rickshaw UI, BOTH Dark and Light | Same usable screens/state; manual theme control, persistence, responsive visual review | PARTIAL | A05 theme/form retention; source screenshots | Target four-combination responsive/SSR tests |
| U06 | Full Bangla and English support | Complete product-text catalog, localized formatting/errors/charts/ARIA; language switch retains route/draft/identity | MISSING | app.jsx English; templates only | Complete catalogs and state-safe language switch |
| U07 | Real useful graphs | Owned completed-record aggregates; consistent labels/dates/card/table/chart; both locales/themes | PARTIAL | A07 local graph/table, not database | Owned SQL aggregates + localized accessible charts |
| U08 | First task: original-PDF/source/UI audit, then justified improvements | INITIAL_AUDIT with evidence, gap/mismatch classification, scoped corrections/regressions | PARTIAL | INITIAL_AUDIT A01-A10 recorded before app edits | Small tested target correction follows audit |
| U09 | Repeat audits after slices and independent final audit | Matrices, code/API/DB traces, actual tests, findings/fix/retest closure | MISSING | No feature/final implementation audit yet | Slice evidence then separate full review |
| U10 | Original PRD Git workflow including GitHub to supplied repo | Contemporary feature history, real integration/release, verified repo refs; no old Git HOLD | PARTIAL | URL supplied; A09 empty correct repo; write unknown | Actual feature commits/push/integration/release |
| U11 | Video only after completion | Visible DEFERRED_BY_USER until separately requested; not silently removed | DEFERRED_BY_USER | No new video action | Required row retained until later user request |

Four supported combinations, all required: English/Dark, English/Light, বাংলা/Dark,
বাংলা/Light. Keep both controls reachable on login, passenger and driver desktop/mobile.
Do not count 4 locale/theme combinations as 4 independent feature implementations.

## Additional explicit acceptance boundaries from current user request

| ID | Required boundary | Actual status | Acceptance |
|---|---|---|---|
| U12 | Real authenticated account UI and backend ownership; remove public demo identity switching | MISSING | Independent login sessions; no foreign resources/roles; logout safety |
| U13 | Theme/language retain identity, stable ride, valid draft/quote and pending command identity | PARTIAL (theme-only prototype) | Provider above locale boundary; same canonical intent/key; pending/reload/session tests |
