# Test plan and proof of completion

**Status: all new full-stack tests below are PLANNED / NOT_RUN.** Prototype-only rerun evidence is separate. PRD §12 calls for meaningful risky-behavior tests, not a decorative coverage score.

## Unit tests (no database)

Fare totals for Nusrat and Rafiq; seats 1/2/3; solo two-seat booking has no discount; distinct-booking discount; unsupported route; explicit state transition table; safe DTO allowlist; validated enum/quantity/currency handling; chart aggregation boundaries/zero denominator. Use exact integer assertions and named story fixtures.

## Integration tests (real PostgreSQL)

| ID | Scenario | Required outcome |
|---|---|---|
| I01 | Two simultaneous active-request creations for Nusrat | One active request, useful conflict/replay; no second quote consumption. |
| I02 | Quote belongs to Rafiq but Nusrat submits it | Rejected with no request, no private quote leakage. |
| I03 | Quote expired/used or client supplies altered price | Server rejects or uses only valid owned quote; client price never trusted. |
| I04 | Request seats 0/-1/4/1.5; same/unsupported route | Rejected before allocation. |
| I05 | Waiting request exists | Occupancy unchanged until driver accepts. |
| I06 | Jashim accepts Nusrat and Rafiq compatible routes | One pool, two memberships, correct estimates. |
| I07 | One booking consumes 2 seats | Remaining seats = 1; no lone-booking discount. |
| I08 | Last seat: Nusrat vs Shirin, Rafiq holds 2 | Exactly one assignment wins; allocated total = 3; loser stays waiting. |
| I09 | Two drivers try accepting the same request | One membership and one valid assigned driver; losing side has no empty orphan pool. |
| I10 | Same driver accepts different requests with no pool yet | Exactly one active pool; combined valid seat count. |
| I11 | Same acceptance command/key retried | One membership/event effect; replay response. |
| I12 | Same idempotency key with different payload | Conflict; no mutation. |
| I13 | Different key repeats already applied transition | Fresh-state precondition fails with 409; no double allocation/event or reactivation. |
| I14 | Failure injected after membership insert before commit | Request/pool/membership/events/key result all rollback. |
| I15 | Passenger cancels own matched request | Only own request canceled; remaining estimate recomputed; history retained. |
| I16 | Duplicate cancellation | Same-key replay succeeds; fresh-key terminal attempt conflicts; no double release/event. |
| I17 | Cancel final active member | Pool terminal; driver/vehicle eligible for new pool. |
| I18 | Passenger cancellation races acceptance | Either canceled unassigned or correctly canceled assigned; no deadlock loop/partial state. |
| I19 | Join races arrival | One serialized result; no membership changes after arrival; fares match final roster. |
| I20 | Cancellation races arrival | One valid ordering: cancel succeeds before boundary OR fails after it. |
| I21 | Arrival/start/complete out of order | Rejected; state and events unchanged. |
| I22 | Driver cancels after arrival but before start | Member policy charge zero; frozen prices inspectable; no cash-refund claim. |
| I23 | Driver tries cancel after start | Rejected. |
| I24 | Complete pool | All noncancelled members terminal; final fares unchanged; historical seats correct. |
| I25 | Explicit offline races acceptance | Coherent driver availability/active pool result under same driver lock. |
| I26 | Passenger modifies/reads someone else's ride | Rejected; no data leakage in body/errors/events. |
| I27 | Unassigned driver modifies pool | Rejected. |
| I28 | Passenger response and metrics serialization | No other passenger IDs/names/fares/statuses, even nested. |
| I29 | Invalid/missing CSRF, tampered/expired session, forged role | Rejected; valid login rotates session; logout invalidates it. |
| I30 | History/statistics across date boundaries/cancellation | Totals and labels agree; no double-counting per joined membership. |
| I31 | API restart and persistent database | Requests/history and sessions behave according to documented persistence. |
| I32 | Two API instances share one database | Last-seat invariant still holds; no reliance on in-memory mutex. |

Use a second named test driver/vehicle for I09/I27 only. I32 must use two API instances and distinct sessions for the SAME Jashim/Bullet/pool against ONE database; two independent drivers would not prove that shared-parent contention. Extra actors are fixtures, not new personas.

## How to make the race test meaningful

Use distinct database connections. Arrange Rafiq's two-seat accepted request, then release two acceptance operations toward the shared lock concurrently. A test-only injected hook can hold/release the first transaction while confirming the second is waiting; do not add a public test hook or production sleeps. A Promise.all invocation alone can accidentally execute sequentially; inspect the setup and transaction boundaries.

Check resulting rows and events, not only HTTP responses. Repeat with reversed ordering and clean isolated fixtures. Never assert which named passenger must win. Add rollback injection and bounded retry tests. Do not substitute SQLite or mock the PostgreSQL lock behavior for these cases.

## Browser/E2E tests

Register passenger; login as seeded users; quote/request; separate Jashim session accepts; passenger polling sees match; Rafiq joins; fare changes as expected; arrival freezes fare; start/complete; history survives reload. Test cancel/seat release; no-driver/empty history; lost connection/retry; expiry; conflict; logout/account cache separation; normal role cannot enable dev tools. Network-inspect passenger responses for private-data leakage.

Render key screens at 360/390/768/1024/1440 px. Verify chart data table matches API; no horizontal clipping; keyboard-operable controls/dialogs; visible focus; no unlabelled icon-only actions; reduced-motion behavior. Record screenshots from the actual modernized application, not the reference screenshots.

## Build/operational tests

Lint + typecheck + unit + integration + E2E + build. Clean Compose up with migrations; second run non-destructive; readiness fails on unavailable DB/migration failure. Test same-origin cookie forwarding through the actual web gateway. Dependency audit issues are reviewed, not auto-dismissed; secrets scan excludes only intentional nonsecret examples, never blanket-ignores source.

## Evidence standard

Every run records command, commit/ref, environment, date, exit code and failures/skips. Treat inaccessible DB/browser/Docker as BLOCKED, not PASS. Update requirement IDs with test names. A feature is done only after real execution and review, not because Codex wrote tests.

## V2 regression cases — PLANNED / NOT_RUN

These are acceptance scenarios, not a demand for 18 separate test files. Parameterize related cases. No new backend tests have been executed by this kit review.

| ID | Scenario | Required outcome |
|---|---|---|
| I33 | Same actor/action/key reused on another target | 409 key conflict; original receipt retained; no second target affected. |
| I34 | Create succeeds but response lost; retry after quote expiry/consumption/ride completion | Replay same receipt before fresh quote/state guards; one request/event. |
| I35 | Quote expires while create waits for its lock | After-lock wall-clock check rejects; no request/quote consumption; equality is expired. |
| I36 | Driver completes/cancels while passenger tracks, then refresh | /current=null but stable ID details show correct terminal state/history; no fake no-ride screen. |
| I37 | Membership changes fare while other request.version stays same; old response arrives late | Pool version participates in freshness check; no stale fare/seat regression. |
| I38 | History mixes completed/canceled rows with equal and sub-millisecond timestamps | ended_at+ID full-precision keyset returns each filtered owned row once; reset cursor on filter change. |
| I39 | Insert inconsistent driver/vehicle pair, quote/passenger pair or unlinked event | Composite FKs or appropriate row constraint reject; valid pairing works. |
| I40 | COMMIT succeeded but acknowledgement lost, and alternate case fully rolled back | Same-key recovery finds one receipt/effect or safely applies once; never converts uncertainty into duplicate intent. |
| I41 | Acceptance waits on parent lock while prior acceptance inserts last seat | Post-lock later statement sees committed membership; no single-statement lock/count shortcut. |
| I42 | Pricing/route catalog version changes after quote | Booked estimate/final use immutable quote basis and group version; quoted maximum honored. |
| I43 | Passenger cancels then driver later cancels or completes remaining pool | Earlier canceled request/time/event unchanged; served seats and discount set exclude it. |
| I44 | Replay ARRIVE after pool started/completed, then repeat with new key | Original key returns original receipt; fresh key conflicts; final prices/events unchanged. |
| I45 | No online driver, full/closed/incompatible online driver, unknown read failure | Correct aggregate waiting hint; no directory/private data/ETA invention. |
| I46 | Slow private response/mutation callback finishes after logout or account change | Abort/generation/cache boundary blocks prior-user content or writes to new-user UI. |
| I47 | Repeat demo seed against database with user-created records | No password/role/timestamp/ride reset, duplicates or unintended production seeding. |
| I48 | Real HTTP/HTTPS gateway, CSRF bootstrap and untrusted forwarding headers | Session/CSRF behavior correct; controlled proxy only; unauthorized headers cannot establish trusted identity. |
| I49 | Canceled-after-arrival detail across API/card/history/chart | Primary charge zero, final evidence preserved, NOT_TRACKED collection; canceled excluded from completed totals. |
| I50 | Successful receipt requested with expired session or different actor | No receipt leak; reauthentication and durable ownership required even for replay. |


## New user-scope scenarios — all PLANNED/NOT_RUN
| ID | Scenario | Required result |
|---|---|---|
| X01 | Four theme/locale combinations on core screens | Complete readable UI, no layout regressions; modes share identical domain data |
| X02 | en/bn catalog parity | Same required keys/parameters; no empty/missing translation |
| X03 | Switch language during unfinished booking | Preserve zones/seats/draft/valid quote; no new mutation |
| X04 | Switch locale/theme while command response is lost | Same key/target/payload; one committed effect; translated receipt UI |
| X05 | Terminal ride reload in both locales | Same stable owned ID and history even when current=null |
| X06 | Real validation/auth/ownership/server failures | Localized safe errors for all product paths; no raw Nest/SQL leaks |
| X07 | Numbers/dates/money and Bengali input | Same canonical values; BDT/Dhaka rendering; valid numeral handling, no password mutation |
| X08 | Locale routing and preference persistence | No /api/_next redirect interference; valid html lang, SSR/client consistency |
| X09 | Bangla typography/mobile/focus | No clipped conjuncts/text/actions; keyboard/ARIA labels localized |
| X10 | Charts in en/bn and Dark/Light | SQL fixtures match cards/tables/bars/tooltips; proper theme contrast |
| X11 | Charts cancel/date/quantity edge cases | No canceled contribution or duplicated pool denominator; midnight bounds correct |
| X12 | Nest production gateway boundary | Real modules/guards/pipes/filter/session/CSRF; no parallel business API |
| X13 | Tailwind production build | Required styles survive production output; selected design retained |
| X14 | Logout/login while locale queries finish | No previous account data/cache; language preference doesn't grant identity |
| X15 | First audit regression closure | Each confirmed source/PDF mismatch corrected or explicitly blocked with retest |
| X16 | Current Git policy end-to-end | Actual per-feature commits/integration + correct verified remote refs; no fake history |

## Evidence in this handoff
Only instruction/package/translation-template consistency is checked while assembling
this handoff. No new Next/Nest/Postgres app exists here, so I01–I50 and X01–X16 are not
passed tests. Historical current-UI reports reside under reference/ui-dark-light/evidence;
never count them as current real-backend evidence. templates/messages are not full
application localization. Always identify the tested artifact/ref and actual environment.
