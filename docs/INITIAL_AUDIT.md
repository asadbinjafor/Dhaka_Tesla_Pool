# Initial source, PDF, UI and repository audit

Audit date: 2026-09-29, Asia/Dhaka. This report was recorded before application edits or dependency installation. Evidence concerns the supplied reference prototype unless explicitly stated otherwise. No implementation percentage or backend PASS is inferred.

## Roots, instructions and preserved work

- Workspace: `E:/Dhaka_Tesla_Pool`. No ancestor/workspace AGENTS.md or existing .git/application directory found during inventory.
- Working project/handoff root: `E:/Dhaka_Tesla_Pool/Dhaka_Tesla_Pool_Codex_Final_Handoff_v3`. Its AGENTS.md, FINAL_MASTER_PROMPT.md, START_CODEX.md, prompts/00-AUDIT-FIRST.md and RECONCILE_EXISTING.md were read first. Application files will be added here alongside the preserved handoff, avoiding a duplicate task/approval history.
- Existing implementation: only `reference/ui-dark-light/`, an offline React 16 browser-local prototype. No apps/web, Nest API, PostgreSQL migrations, lockfile, Compose or real authenticated application exists locally.
- Existing approvals: explicit stack/extras/workflow/video instructions are settled. docs/02-DECISIONS.md marks D01-D29 as proposals; no separate approval record discovered. Existing task board contains NOT_STARTED template rows, not completed work. Preserve these records; append actual progress.
- Exact user-supplied remote: `https://github.com/asadbinjafor/Dhaka_Tesla_Pool.git`. Public REST metadata identifies the intended repository, size 0, configured default `main`; branch listing and successful `git ls-remote` return no refs. There is no history to overwrite. Creating required master does not authorize changing the GitHub default setting. Connector login failed USER_NOT_LOGGED_IN; Git transport read succeeded; WRITE ACCESS UNVERIFIED until scoped dry-run/publication.
- Existing configured Git identity is available; no identity was invented and no global setting changed. Docker/PostgreSQL executables were not found on PATH or inspected standard installation paths. Actual DB/Compose tests are BLOCKED. Python Playwright is absent; its historical scripts were NOT_RUN and would overwrite immutable reference evidence if run directly.

## Original PDF read, including tables

All five pages, all nineteen sections and the passenger/driver/pool, stack and evaluation tables were reread and visually inspected. `reference/PRD.pdf` and the outer original PDF have the same SHA256: `f4f77d9837e4be914aafabe3f728bd3b7251fd428539510dd9ad29af5739936d`.

PDF source remains immutable. Next App Router is recommended in the PDF and explicitly selected by the user; Nest/Tailwind/PostgreSQL are current user selections. Charts, both themes and complete en/bn are required user additions, separate from original requirements. Exact lifecycle names/formula are examples; health checks recommended; public free deployment preferred with conditional tested Docker fallback. Scaling discussion optional. Video remains REQUIRED / DEFERRED_BY_USER. Section 18's concurrency cross-reference says section 14, while the actual case is in section 12. The story's roughly one second is not a defined load SLA.

## Implemented prototype versus missing real application

| Area | Actual source/interaction evidence | Assessment / next correction |
|---|---|---|
| Named cast/vehicle | src/domain.js seeds; app.jsx:40,43,52; selected artwork | Jashim/Bullet/Nusrat/Rafiq/Shirin and three passenger seats preserved in prototype; persistent named seed still missing. |
| Auth/account | store.js:17-25; app.jsx:17,35,57-61 | Browser session/local PBKDF2 and preview selector; real Nest sessions/ownership missing. Replace with server account UI; do not merely hide selector. |
| Booking/fare | app.jsx:21-23,41,63; components.jsx:61 | Quantity, validation, quote review and demo arithmetic implemented; real owner-bound quotes/requests and server validation missing. |
| Lifecycle/pool | app.jsx:26-27,43-49,65; domain tests | Demo accepts, roster, arrival/start/complete/cancel implemented. No DB locking/constraints/API authorization. |
| History/privacy | app.jsx:39,42,49-50; owned DTO tests | Stable hash detail routes and own demo DTOs exist; durable server history, coherent snapshots, keyset pagination and API privacy missing. |
| Themes/design | app.jsx:16; styles.css:1-2,8-11 | Two themes work in prototype; charcoal/deep-green/lime, clean light palette, rickshaw artwork, cards and responsive navigation retained. Tailwind/SSR implementation missing. |
| English/Bangla | app.jsx:3-6,30-70; components.jsx:3-5,50-65 | Hardcoded English and English Intl formatting; no language control/catalog integration. templates/messages are only a glossary. |
| Graphs | app.jsx:40,51; components.jsx:64; local stats tests | Charts and exact-data tables derive from local demo records, not PostgreSQL. Owned real SQL aggregates and localized states missing. |
| Operations/process | serve.cjs:1-4; package.json; root inventory | Static server is not business API; full-stack Docker, migrations, production dependency selection, contemporary Git history, operational README/release missing. |

Paths in this table refer to reference/ui-dark-light/ and are read-only. Full clause-level status and acceptance references are reconciled in the two matrices.

## Fresh evidence (not historical counts)

| ID | Command / method | Result | Limits |
|---|---|---|---|
| A01 | Bundled Python pypdf text extraction plus five rendered-page visual reads | PASS | Source reading only, not application behavior. |
| A02 | `node --test tests/domain.test.cjs tests/store.test.cjs` from reference UI | PASS, 58/58, Node 24.17.0 | Browser-local domain/store; last-seat test is sequential, not PostgreSQL simultaneous allocation. |
| A03 | `python tools/check_handoff.py` BEFORE document writes | PASS, 130 manifest files / 155 glossary keys | Initial package integrity only. Later intentional working-doc edits legitimately differ from immutable handoff manifest; do not rewrite original manifest to fake PASS. |
| A04 | Read-only execution of contrast_audit.py with evidence write omitted | PASS, 14 selected token pairs | No full accessibility certification; does not overwrite reference files. |
| A05 | CUA browser at actual `http://127.0.0.1:4173`, default viewport | PASS for inspected interactions | Booking one->two seats, dark->light retained two seats and 8000-poysha maximum; review dialog retained same values. |
| A06 | CUA account dialog -> Jashim -> accept Rafiq -> stable pool detail | PASS for demo interaction | One reserved seat, assigned roster, next valid action shown; preview switching is deliberately nonproduction. |
| A07 | Driver activity -> exact chart data | PASS for demo presentation | 6 completed pools, 12 served / 18 capacity = 67%; table and graph observed; backend/data isolation NOT_RUN. |
| A08 | Sign-out -> sign-in DOM, 390x844 viewport | FAIL: skip target absent; PASS: no horizontal overflow at this viewport | Actual html lang=en; no locale switch. Full widths/four combinations NOT_RUN. |
| A09 | Git public metadata / branches / ls-remote | PASS read, no refs | Write permissions/rulesets NOT_VERIFIED; connected GitHub API unavailable. |
| A10 | Full-stack lint/typecheck/build/API/DB/Compose/E2E | NOT_RUN / BLOCKED | No modern app yet; no Docker/DB executables found. Historical browser counts are not rerun evidence. |

The first browser attempt preceded static-server startup and returned connection refused. A fresh tab after startup loaded the real local origin successfully; no browser policy was bypassed. All UI actions changed only this test browser's local demo dataset, never reference files or real server data. Existing screenshots were inspected for desktop driver light, mobile booking dark, desktop authentication dark and side-by-side themes.

## Confirmed findings and improvement proposals

| Finding | Severity / requirement | Evidence and impact | Minimum correction / acceptance |
|---|---|---|---|
| F01 Real auth/ownership absent | Blocker P02/P04/P09/P21, user account instruction | store.js:17 defaults to Nusrat; app.jsx:35,61 swaps identity without server | Nest session/CSRF/guards/owned serializers + real account/signout UI; independent sessions, tampered role/foreign resource rejection, delayed logout response tests. |
| F02 Persistent integrity absent | Blocker P03/P13/P23/P36 | DemoStore browser serialization cannot enforce cross-instance seats | PostgreSQL migrations + common parent locks + exact simultaneous last-seat and no-pool tests. |
| F03 Complete bilingual product absent | Major U06 | Hardcoded forms/dialogs/status/error/chart/ARIA throughout | Typed parity-checked catalogs expanded with each target screen; test full translated flows and switches retaining drafts/quote/intent. |
| F04 Graphs are not real DB-backed | Major U07 | Local records drive stats; no statistics endpoint | Owned completed-record SQL; cancellation/date/quantity/zero tests; card/table/chart equality in all four combinations. |
| F05 Auth skip link has no target | Minor P22/U08/X09 | app.jsx:59,70; DOM mainExists=false on sign-in | Target auth main landmark with id and tabIndex; keyboard skip focuses it on sign-in and sign-up in en/bn. Port into modern target only. |
| F06 Compact type/controls | Improvement U05/U06, not a claimed WCAG failure | styles.css:8-10 and mobile screenshot contain 8-11px captions/compact icon controls | Preserve hierarchy; use readable Bangla line height, >=44px main actions, visible focus, no clipping at required widths. Actual contrast/focus checks before closure. |
| F07 SSR and presentation/command boundaries unverified | Major U05/U06 | Legacy class state retains theme form; no locale/SSR/gateway | Root provider above locale boundary, validated preference cookies, deterministic SSR theme/lang; canonical intent excludes theme/locale; pending switch/retry and no hydration-error tests. |
| F08 Modern operation/release missing | Blocker P19/P24/P30-P35/P39 | Empty local/remote repository; only static preview | Minimal Git bootstrap, tested feature slices, true Nest/Next gateway, Docker/README, verified integrations; no premature release branches. |

No silent visual redesign, Tesla sedan, live GPS, wallet, fake revenue/ETA/carbon/battery metric, admin role or numbered physical seat claims will be introduced.

## Material decision requested once

No applied migrations or existing architecture conflict exists. D01-D29 remain proposals. One consolidated question asks whether to accept the documented fare/matching/cancellation/booking/payment baseline or specify changes. Until response, domain-policy-dependent schema/booking/allocation/cancellation writes are BLOCKED_DECISION, not implicitly approved. Independent theme/i18n/accessibility foundation may proceed. Technical safety contracts, selected stack/extras/Git workflow are already authorized and are not being reopened.

## Next smallest correction and tests

After this audit: feature/project-foundation, a modern Next/Nest/Tailwind workspace with a localized auth entry shell using preserved tokens/artwork, valid skip target, visible locale/theme controls, preference-cookie initialization, provider above locale route boundary, safe /api/v1 health forwarding. No mock login success, selectable demo identities or fake charts. True auth remains a separately tracked slice.

Acceptance: Next and Nest production build/start; actual health forwarding/error response; English/Dark, English/Light, Bangla/Dark, Bangla/Light; valid html lang/theme and refresh persistence; no console/hydration errors; complete catalog parity/placeholder checks; keyboard skip target; mobile/desktop overflow; presentation state/intent preservation unit tests; unsafe locale/path rejection; reference hash unchanged. Add early Compose configuration but report execution BLOCKED unless a real Docker environment becomes available. Do not infer product/auth completion from the foundation.

Implementation-ready: NO (audit done, policy and operation gaps outstanding). Full-submission-ready: NO. Video: DEFERRED_BY_USER; no script/recording/upload action taken.
