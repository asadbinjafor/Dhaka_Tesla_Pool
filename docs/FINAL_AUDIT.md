# Independent original-PDF and user-extras audit — 2026-09-29

This is a separate review pass by the same agent, not an invented independent reviewer. All five **actual** reference/PRD.pdf pages and passenger/driver/pool, stack and evaluation tables were reread with pdfplumber; original source/visual inspection and immutable SHA256 are recorded in INITIAL_AUDIT. No private PDF/reference publication or source changes. Original P01–P44 and user U01–U13 stay separate. Original required/recommended/permitted/optional distinctions remain: exact fare/matching/cutoff choices are documented assumptions; live GPS/payment gateway/public hosting/scale benchmark are not invented requirements. Source §18's concurrency cross-reference is editorial; the actual case is §12.

## Required behavior traced to actual code

| Scope | Implementation trace | Actual proof |
|---|---|---|
| Real identity/roles/privacy | SessionProvider -> fixed Next gateway -> AccessGuard/AuthService -> sessions/users; owned repos before read/replay | Real Argon2/session/CSRF/origin/forged role/foreign-ID/expiry/logout HTTP tests; four-mode auth E2E |
| Request/quantity/quote/fare | BookingScreen -> strict DTO -> RideService/Repository -> immutable quote/booking facts | Numeric seat errors, no client fare authority, one active request, actual quote expiry after lock wait, exact named poysha assertions |
| Shared Bullet capacity | DriverRequests -> PoolService -> one-client driver/vehicle/pool/request locks -> memberships/events/receipt | Both last-seat winner orders, two distinct sessions/API instances for same Jashim, distinct drivers competing, post-wait fresh occupancy, rollback/COMMIT uncertainty |
| State/cutoffs/cancellation | Pool/Ride screens -> authorized lifecycle service -> locked sorted members, immutable final/terminal rows | Invalid transitions; join/cancel/arrival/offline contention orderings; final prices/canceled snapshots; prior canceled member unchanged after complete/cancel; restart persistence |
| Terminal explanation/history | Stable owned IDs, retained membership/events, HistoryService with full-precision ended_at/UUID cursor | Current=null/stable reload, submillisecond/equal timestamps, actor/filter cursor binding, owned literal/Bangla search |
| Required real graphs | StatisticsService owned completed SQL -> same cards/table/SVG dataset | Actual canceled/midnight/zero/quantity fixtures, per-pool capacity denominator; all-mode API/table/bar parity |
| Required en/bn + dark/light | Root View/Session/PrivateUI, full catalogs, Intl BDT/Dhaka, semantic Tailwind/font assets | Key/placeholder parity, draft/quote/key/route/identity retention, real delayed login/command, same-account recovery, old-account callback, old pool-version response |
| Selected usable UI | Sidebar/Bullet hero/auth design, native modal, skip/focus, responsive layouts | Current screenshots;300actual principal-screen/width views in four modes; zero outer overflow; configured axe0violations; keyboard/glyph/page-error checks |
| Operation/process | Versioned SQL/explicit nondestructive seed, Compose dependencies/volume/env, actual feature history/remote | Actual CI clean/repeated startup, down/up data retention, repeat seed, DB outage503/recovery200; scoped conventional commits/merges |

Pure fixture/unit checks never substitute for DB security/capacity proof. Native/CI PostgreSQL is18.6; Node24.17.0/pnpm12.6.0; CI Ubuntu24.04 with real production Docker/Chromium. Native Windows has no Docker. Private local application records were never reset by tests: every integration fixture gets its own generated loopback dtp_test_<UUID> database and guarded cleanup.

## Findings and regression closure

| Finding | Severity / requirement | Minimum repair | Observed status |
|---|---|---|---|
| Prototype demo identity/local authority | Major P02/P04/P13/U12 | Real opaque DB sessions, API owner/role checks and SQL transactions; no public selector/reset | PASS real auth/privacy/allocation/role/browser tests |
| Missing modern product/history/graphs/full locales | Major P03/P19/P22/U01–U07 | Scoped selected-stack services/UI and real owned SQL aggregates/catalogs | PASS slice native/CI tests; current UI300-view evidence |
| Source skip target/contrast/caption issue | Minor P22/U05/U06 | Focusable main, semantic light foregrounds, readable captions; preserve immutable source | PASS production foundation + current skip/overflow/glyph checks |
| Pending intent lost at same-account reauthentication | Major U13 | Preserve verified same-user epoch, exact key/body, central receipt navigation; clear on actual identity change/logout | PASS actual lost committed response/expired cookie/reauth one-effect E2E |
| Compose ignored APP_ORIGIN/Secure setting | Major P21/P24 | Explicitly pass operator env to API | PASS HTTP cookie/origin attrs and real persistent/outage Compose run36534932216 |
| Escape after locale switch loses trigger focus | Minor P22/U05/U06/U13 | Canonical target attributes and focus restoration to current locale trigger | Confirmed FAIL36535954719; repaired b87fdfb; strict four-mode journey regression PASS36537302983 and36538087317 |
| Mobile SVG graph labels shrink below readable size | Minor U05/U06/U07 | Resize observed graph width and preserve readable SVG text | Confirmed original360px screenshot; repaired8ff59d8; PASS36538087317, actual minimum14px and zero overflow in300views |
| Raw numeric occupancy/roster and graph description in Bangla | Minor U06 | Intl locale numbers, localized graph dates/Dhaka copy; domain values remain canonical | Repaired b87fdfb; build/lint/typecheck PASS; real browser localized occupancy regression PASS36537302983/36538087317 |
| Parallel Windows fixture DROP hit3s business budget | Test harness P36/U09 | Separate bounded15s administrative CREATE/DROP pool, always close; business3s/lock2s unchanged; sequential file execution documented | Initial FAIL21/22 retained; full repaired native retest PASS24/24; actual race overlaps retained |
| Premature DOM/ambiguous locator/availability assertion | Test harness U09 | Await real data/control and assert all intended disabled controls | Earlier CI FAIL recorded; repaired runs36529950932/36530650512/36532896472 PASS |
| Foundation-only README/matrix/AI/operating statuses stale | Major P26/P28/P33–P35/U09 | Current actual API/architecture/ERD/choices/operations/screenshots; dated superseding statuses preserve old history | Documentation completed in working candidate; publication/release gate pending |

## Actual execution checkpoints

| Environment/ref | Result | Checks |
|---|---|---|
| CI36526747393/bebaea3 | PASS | Initial real schema and fresh/repeat Docker |
| CI36528241459/7ce2c49 | PASS | Real auth/gateway five browser cases |
| CI36529950932/257dc32 | PASS | Owned booking + pending presentation retention, six browser cases |
| CI36530650512/7ed148d | PASS | Real allocation/cancellation, seven browser cases |
| CI36531122860/195d473 | PASS | Lifecycle native six cases and nine actual browser cases |
| CI36532896472/d10a63b | PASS | Actual history/statistics and thirteen browser cases |
| CI36534145195/baf7434 | PASS | Full product22browser cases and300principal views, all prior native/build gates |
| CI36534932216/37ef042 | PASS | Hardening native six extra cases,24browser cases, actual Compose persistent restart/reseed/outage/recovery |
| CI36535954719/d677e12 | FAIL | Stronger Escape/focus assertion found actual issue; later tests cascaded after incomplete first journey; not integrated as verified |
| Native repaired working hardening candidate | PASS | Build/lint/typecheck and24 real PostgreSQL/HTTP tests; exact failed/retest logs retained |
| CI36537302983/c985c29 | PASS | Strict four-mode journeys/modal focus/format, canceled-after-arrival real UI,27E2E, current SSR smoke, all native and operational gates |
| CI36538087317/8ff59d8 and master CI36539130836/a6109ac | PASS | Adaptive mobile chart labels actual minimum14px;27E2E/300views,24native,9unit,3SSR smoke and all production Docker gates |
| Pre-release ce17ce5 / CI36540258465 | PENDING | Native strengthened hardening9/9 PASS; exact lost-response locale/theme retry and safe-read browser regressions await actual CI |
| Final release publication | NOT_RUN | Exact refs/ancestry/gate recorded only after observed publication |

CI links use https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/<id>. Results/evidence/screenshots identify their actual tested artifact; previous PASS cannot retroactively cover changed code. No failing test is removed, asserted weaker or retried automatically. Read-only view checks reuse real fixture sessions in worker memory to respect the unchanged production throttle, while auth-form/throttle cases remain real.

## Explicit limits and submission distinction

- Local additional frontend preview: **BLOCKED** by automatic approval review, exact stated reason "blocked by policy"; no equivalent start bypassed it. Actual production browser/Docker evidence comes from authorized free GitHub CI. Local original user processes remain untouched.
- Public hosted backend/TLS endpoint: **NOT_RUN**. PDF-permitted documented/tested local Docker fallback is delivered; no paid hosting or fabricated public URL. Secure-cookie attributes/origin forwarding are real HTTP configuration tests, not a claim of actual TLS termination.
- Complete assistive-technology/WCAG conformance: **NOT_RUN**. Configured automated A/AA checks show no violations; incomplete color-contrast nodes (e.g. image-backed hero) are disclosed and supplemented by actual screenshot/CSS review. No formal accessibility certification claimed.
- Human live explain/debug/change assessment (P27/P44): **NOT_RUN**. Required AI disclosure, accepted/changed suggestion, implemented diagrams and debugging/change explanations are provided; automation cannot certify human understanding.
- Optional scale bonus: reasoning delivered in SCALING.md; no throughput/latency/1M-user benchmark claimed.
- Required maximum-six-minute video **P38/U11 DEFERRED_BY_USER** remains visible in README/matrices/submission. No script, recording, trace, upload or fake video link. Full human assessment submission remains separate from implementation readiness.

Final acceptance requires no unresolved confirmed required code/UI/operation defect and actual release ancestry/ref/push/gate evidence. The final publication checkpoint will replace pending candidate statuses only after observed completion.

Planned I01–I50/X01–X16 are mapped to actual executed suites and their precise limits in [TEST_EVIDENCE.md](TEST_EVIDENCE.md). Current screenshots/provenance come unchanged from verified8ff59d8 CI, not the old prototype or an untested candidate.
