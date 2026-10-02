# Executed test evidence — 2026-09-29

This supersedes the original planned-only status of 08-TEST-PLAN.md without deleting that plan. IDs below are acceptance scenarios, not a fabricated number of independent tests. Source test names and actual executed jobs are the proof. Native Windows uses real PostgreSQL18.6; CI uses Ubuntu24.04, Node24.17.0, pnpm12.6.0, PostgreSQL18.6, production Docker Next/Nest and real Chromium. No reference/prototype checks are counted as modern backend tests.

## Actual checkpoints

- [CI36538087317](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36538087317), `8ff59d89fed9fc94df59d455354e7855496711ae`: **PASS** build, typecheck, lint,9unit,24native SQL/HTTP,3SSR/gateway smoke,27browser cases. Browser cases include300 principal screen/width views. Production Compose clean/repeat startup, explicit seed, retained rows after down/up and repeated seed, unavailable DB readiness503 then recovered200 all PASS.
- [Master CI36539130836](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36539130836), `a6109ac293222f11200845fcf2c87a887ebfd25f`: **PASS** same complete gates after integration.
- Native complete sequential retest:24/24 **PASS**, `evidence/runs/2026-09-29-final/native-postgresql-http-retest.txt`. Earlier parallel cleanup failure21/22 is retained in `native-postgresql-http.txt`; repair separates administrative15s CREATE/DROP budget from unchanged business3s statement/2s lock deadlines.
- Native strengthened candidate hardening:9/9 **PASS**, `native-hardening-candidate.txt`, including injected private-read connection failure, safe503 envelope, no private directory/raw diagnostic, restored owned read. This replaces prior8-case hardening suite; the full candidate CI count is25native, PASS in both pre-release runs36540258465/36540724158.
- Pre-release `ce17ce50b11bd98c9447548c91205168b0b4b6a8`, [CI36540258465](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36540258465): **PASS**, all64cases and operational gates. Stronger existing browser cases switch language/theme before lost-response same-key recovery and test localized read503/manual recovery; these are not extra test-count inflation.
- Full documentation/license candidate `a470f72cb180e9cd3f87ae04b86cf141cae038ab`, [CI36540724158](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36540724158): **PASS**, same64cases and operational gates. Required release branch created and pushed from this verified pre-release.

## Original planned scenario trace

| IDs | Executed implementation tests | Status / precise limit |
|---|---|---|
| I01–I05 | requests.test.mjs: owned quote/request, concurrent creation/replay, expiry, strict DTO/routes/seats, no waiting occupancy | PASS |
| I06–I14 | allocation.test.mjs: named exact solo/pooled money/quantity, both last-seat winner orders and actual observed PostgreSQL waiting, competing drivers, one active pool, receipts/conflicts, rollback and real COMMIT uncertainty | PASS |
| I15–I18 | allocation/lifecycle/hardening: own release, duplicate keys, last-member closure, both unassigned/assigned cancel/accept orderings under actual waits | PASS |
| I19–I25 | lifecycle/hardening: arrival join/cancel boundary, invalid/start/cancel/complete transitions, immutable final roster, after-arrival driver cancellation zero, offline/accept both winner orders | PASS |
| I26–I29 | auth/requests/allocation/lifecycle: actual guard/session/CSRF/origin/role/owner denials, private DTOs and foreign resources | PASS |
| I30–I32 | statistics/lifecycle/allocation: Dhaka midnight/cancel/quantity, actual API restart, two separate API instances/sessions contending for the same Jashim/vehicle/pool | PASS |
| I33–I35 | requests/allocation/lifecycle/hardening: canonical target/body hash conflict, committed original-key replay after terminal state/quote consumption, real quote wall-clock expiry while lock held | PASS |
| I36–I38 | lifecycle/statistics + booking/lifecycle/state-boundary E2E: stable terminal refresh/current=null, late real older pool-version fare blocked, full-precision equal/submillisecond cursor pagination and filter/owner binding | PASS |
| I39–I44 | database/requests/allocation/lifecycle/hardening: constraints, rollback/COMMIT ambiguity, post-wait fresh count, catalog version immutability, prior-canceled membership unchanged, original ARRIVE receipt versus fresh key | PASS |
| I45 | hardening: aggregate offline/full/closed/incompatible hints; latest native9th case safe unknown read failure/recovery | PASS native and candidate browser localized503/manual recovery |
| I46 | state-boundary/auth/recovery E2E: real delayed prior-user callback cannot navigate/reveal after logout/new login; root private epoch/draft/intent boundary | PASS |
| I47 | database native + production Compose after E2E: explicit repeat seed preserves credentials/timestamps and created records/counts | PASS |
| I48 | auth/gateway native/unit/production E2E: actual HTTP cookies/CSRF/proxy stripping, HTTPS configuration Secure attributes | PASS HTTP/configuration; actual public HTTPS/TLS termination NOT_RUN. Tested HTTP Docker fallback is permitted PDF scope |
| I49–I50 | lifecycle/hardening + cancellation/recovery E2E: zero canceled charge/frozen evidence/NOT_TRACKED/excluded graphs; expired/foreign identity cannot retrieve receipt, verified same owner can recover | PASS |

## Required extras scenario trace

| IDs | Actual tests and artifacts | Status |
|---|---|---|
| X01–X02 | auth/lifecycle/statistics/zz-ui four-mode browser cases; catalog.test.ts key/placeholder parity | PASS |
| X03–X05 | booking/auth/recovery/lifecycle browser: valid draft/quote, delayed mutation key/body, stable terminal route/refresh; canonical presentation-state units | PASS; strengthened lost-response switch/reauth one-effect regression PASS36540258465/36540724158 |
| X06–X08 | real safe error/strict DTO/auth/owned read; catalog/format/SSR/gateway; Bangla search/digits, ISO canonical dates, preference/locale routing | PASS; native browser date-input chrome follows browser locale, user-entered names are preserved |
| X09–X11 | zz-ui/lifecycle/statistics: fonts/keyboard/dialog focus/no page errors/reduced motion,300 views; SQL/card/table/SVG parity, canceled/midnight/quantity denominator | PASS; actual min chart-label height14px in CI artifact; no exhaustive assistive-technology certification |
| X12–X13 | actual Nest guards/filter/repos and Next fixed gateway; production Docker build/SSR/browser/Tailwind assets | PASS |
| X14–X15 | real old-account callback, unknown command/same-owner recovery, stale pool-version read; initial F01–F08 findings/fix/retest and separate final review | PASS; evidence limits explicit in FINAL_AUDIT |
| X16 | actual contemporary Git branch graph, tested non-destructive integration/push to supplied remote | PASS actual feature/master/pre-release/release history, exact remote; see RELEASE_CHECKLIST/GITHUB_REPOSITORY |

## Evidence rules and limits

The actual27browser cases live in9spec files;8role/locale/theme view cases cover300views at360/390/768/1024/1440px. Test-only injected hooks coordinate real database waits or real connection/response faults; they do not add public endpoints or pretend mock locks prove races. Production throttling stays enabled; read-only screenshots reuse real authenticated fixture cookies only in worker memory. SQL fixtures are isolated fictional records, never a reset of the user's local application database.

CI retries0, video/trace off. Configured axe A/AA checks have0violations and some incomplete contrast nodes, supplemented by screenshots/CSS review. Original private PDF/source hashes remain84/84. Local additional preview was automatically rejected (**BLOCKED**, reason “blocked by policy”) and was not bypassed. Public hosted TLS, complete assistive-technology certification and human live explain/debug assessment remain **NOT_RUN**. Video P38/U11 remains **DEFERRED_BY_USER**. Earlier failed CI/assertion/native logs remain factual history; only observed success closes a gate.

## npm conversion execution — 2026-09-30

[CI36745538316](https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/36745538316),
code564118fb8188469233b63856bf01bca7716e3b0f: SUCCESS. Original64cases preserved;
new3cases verify cwd-independent real migrations, local/root/explicit env precedence
and real source compilation/restart/readiness/child cleanup. Native28/28, unit9/9,
production smoke3/3, browser27/27 =67distinct. Existing smoke3 also runs against actual
per-folder npm dev commands, making70executions.300views remain inside8browser cases.
No skips/retries/flaky results;14px minimum labels, zero outer overflow/axe violations;
color-contrast incomplete retained. Docker fresh/repeat start, explicit seed, persistent
restart/reseed/outage recovery PASS. New evidence directory:
`evidence/runs/2026-09-30-npm-structure/`: original16new PNG attachments/provenance,
browser view matrix, native-final/initial failure logs, data preservation, source/lock
review and exact candidate CI summary. Older evidence remains unchanged. Latest npm
commands are README/RUN_NPM_BN; no old pnpm workspace dependency.

## TypeORM production verification — 2026-10-02

Complete CI37025204031 for exact feature candidate813008e7c6cfb864cc5ff823e79369d61031212b
SUCCESS: clean npm installs, both production builds/typechecks/all lint,9unit,
33native PostgreSQL/Nest/config/watch/ORM cases,3development smoke,3production
smoke,27production browser cases.72distinct tests/75executions, no skipped native
cases or failed browser cases. The300principal-view/four-theme-locale checks PASS.
Actual clean/repeat Compose startup, explicit seed, persistent down/up, repeat seed,
database outage503 and subsequent recovery200 all PASS. Runtime/source/test trees
remain exactly this verified candidate during final documentation/integration.

Existing13local-table hashes and84reference hashes PASS unchanged. Applied001 SQL,
private root environment, selected UI/assets/catalogs/styles and original handoff
files are preserved. Backend private local .env uses existing split connection fields
and is ignored by Git. Published scope contains no private environment values/files.
Video remains required DEFERRED_BY_USER; no hosted TLS or human certification claim.

Actual run: https://github.com/asadbinjafor/Dhaka_Tesla_Pool/actions/runs/37025204031 .
Evidence: TYPEORM_DATABASE_AUDIT.md and evidence/runs/2026-10-02-typeorm/ci.json.
Normal verified feature -> master -> pre-release -> release/v1.0.0 integration follows
under the established workflow; exact current refs are inspectable in the repository.
