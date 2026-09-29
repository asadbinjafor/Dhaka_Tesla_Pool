# Implemented foundation slice audit - 2026-09-29

This follows the recorded original-PDF/source/UI audit, not a replacement for it or
the independent final audit of the complete product. Branch: feature/project-foundation.
Source: all five original PDF pages/tables and separately required user extras.

## Changes and scope

Actual Next 16 App Router, Nest 12 API and Tailwind 4 build; pinned compatible packages
and one lockfile; pg connection readiness; safe fixed-origin transport; preserved
rickshaw artwork and theme tokens. Root presentation provider is above locale routes.
Both auth entry screens and not-found copy have typed en/bn catalogs, labeled 44px
controls, 48px fields, visible focus and a valid main-content skip target. Cookie
preferences are allowlisted and server-rendered. No credential/local private ride
storage, prototype UMD runtime, selectable demo identities, fake auth or fake graphs.

API filters/validation and gateway are technical boundaries, **not** implemented login,
CSRF verification, ownership, fare/matching or booking transactions. In-memory state
helpers preserve canonical intent fields in tests; there is no real current ride or
pending business command yet. Auth forms truthfully disable unavailable submission.

## Executed evidence

Environment: Windows PowerShell, Node 24.17.0, pnpm 12.6.0, no Docker/PostgreSQL executable.
Evidence: evidence/runs/2026-09-29-foundation/results.json, http-smoke.json and browser PNGs.

| Check | Actual result | Meaning/limit |
|---|---|---|
| pnpm install; pnpm peers check | PASS after corrections | Named resolver native build allowed, ESLint compatible maintenance pin; no ignored peers |
| pnpm typecheck | PASS | Actual API/Web TypeScript |
| pnpm lint | PASS | Actual source/tests; no disabled rules to hide defects |
| API tsc build and Next production build/start | PASS | Native production processes start; not container proof |
| pnpm test:unit | PASS 8/8 | Catalog keys/placeholders, bounded gateway transport, theme/locale/clear-private state invariants |
| pnpm test:api | PASS 2/2 | Real Nest HTTP liveness, safe absent/unreachable DB failure, not successful PostgreSQL |
| pnpm test:smoke | PASS 3/3 | Running production SSR four combinations/cookie validation, localized 404, real Next→Nest health |
| pnpm check:reference | PASS 84/84 | Immutable supplied source/reference hashes unchanged |
| Browser sign-in/sign-up en/bn dark/light | PASS for this entry slice | Labels/placeholders/ARIA/notices reviewed; entire future product still incomplete |
| Browser theme/language draft retention | PASS visual observation | Test-only email/password retained through switches; DOM exports redact inputs, so no fabricated value-comparison PASS |
| Keyboard skip on both screens | PASS | Actual focus reaches main-content, fixing F05 |
| Mobile 390×844 / desktop 1440×900 | PASS sampled layouts | No horizontal overflow; measured main controls >=44px, fields >=48px; not all devices |
| Console/hydration review | PASS observed navigation | No warning/error captured during tested switches/refresh |
| SSR refresh preference persistence | PASS | Route language and theme retained; passwords are intentionally cleared by full reload |
| Compose/DB-success/migrations/seeds | BLOCKED / NOT_RUN | No Docker/PostgreSQL runtime; schema/seeds not implemented |
| Real login/ownership/concurrent last seat/fares/lifecycle/graphs | NOT_RUN | Product endpoints are still missing, not silently accepted |
| Full independent final product audit | NOT_RUN | Requires completed implementation |
| Video | DEFERRED_BY_USER | P38 kept; no video action |

## Findings, repairs and retest

- Initial TypeScript gateway body type failed because Uint8Array<ArrayBufferLike> was
  not Fetch BodyInit. Bounded reader now returns an owned ArrayBuffer; typecheck/build
  and gateway tests pass. The 64KiB limit is enforced while reading, not after unlimited buffering.
- ESLint 10 failed current Next plugin peers. Exact maintenance 9.39.5 passes peers;
  registry deprecation remains a tracked upgrade issue, not hidden as current latest.
- Initial pnpm Windows launcher and unapproved native resolver build failed. Correct
  bundled pinned launcher and explicit identified package allowlist resolved installation.
  No OS security settings or supply-chain policy was disabled.
- Browser found light-mode story eyebrow inherited the light muted token against the
  persistent dark visual pane (#516861 on #0c1814). Explicit pane foreground #b2d3aa
  fixes contrast in both themes; production rebuild/reload/computed style confirmed.
  The brand caption was raised from 10px to 12px without changing the visual layout.
- First smoke run had a test URL parser error on a valid relative redirect. Test now
  resolves Location against its base; redirect requirement unchanged; all 3 pass.
- Full-page browser capture of long mobile signup showed repeated stitched bottom
  content while DOM contained one main. Final mobile evidence uses viewport capture;
  that historical before-fix capture is not authoritative layout proof.

## Requirement reconciliation and next smallest slice

P19 now has real verified Next/Nest source/build; P21/P22/P24/P26/P28/P33-P35 remain
partial and retain missing auth/business/DB/container/docs evidence. P02/P04/P13/P20/P23
remain missing. U03 tooling verified; U01/U02/U05/U06/U13 partial; U07/U12 not implemented;
U08 initial audit/correction verified; U09 repeat slice audit partial until independent
final audit. P38/U11 remain deferred. Git feature/master progress is real; pre-release
and release branches are not claimed complete.

Material policy remains PENDING_USER from the single consolidated question. Do not
apply proposed D01-D17 as approval. No unrelated app, migration, approval or remote
history conflict was discovered. Tooling/runtime limitations are distinct from policy.

Next smallest dependent correction: versioned non-destructive PostgreSQL schema and
named opt-in seeds after actual policy response, in a real isolated DB environment.
Acceptance: clean migration/re-run/restart; safe failure rollback; constraints/FKs/
indexes; exact three-passenger capacity and distinct driver seat; unique live requests/
pools; no raw DSN; no destructive reset; named cast fixtures; pg tests run against a
real DB. Then account/session/ownership slice must prove independent actors and denied
foreign reads/writes, CSRF/origin checks, logout and stale-response boundaries before
ride flows are exposed. Full graph and bilingual product requirements stay required.

Implementation-ready for full MVP: NO. Full-submission-ready: NO. No live deployment.
