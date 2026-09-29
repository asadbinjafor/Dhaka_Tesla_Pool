> Current application evidence is in [FINAL_AUDIT.md](FINAL_AUDIT.md) and the dated complete-product checkpoint below. Earlier starter/foundation tables are preserved history, not current missing-feature claims.

# Task board template — NOT an application completion report
Do not overwrite an existing project's progress with this starter. Keep HANDOFF evidence
separate from actual application evidence. Only packaging/template checks have run here.

| Phase | Initial status | Actual ref/evidence | Next action |
|---|---|---|---|
| 00 | NOT_STARTED | None for user repo | Source/PDF/UI audit |
| 01–10 | NOT_STARTED | None | Follow actual dependencies |
| GitHub destination | BLOCKED_REPO_URL | Not supplied | User provides exact repo |
| Video | DEFERRED_BY_USER | No recording/link | After implementation; await user request |

Per slice record requirement IDs, changed files, decisions, branch/commits, commands/
results/environment, remote result, findings and next task. No fixed fabricated counts.

## Actual working progress - 2026-09-29

Original table above is preserved packaging history. Current state:

| Slice | Status | Evidence | Next |
|---|---|---|---|
| 00 PDF/source/UI/repo audit | RECORDED | INITIAL_AUDIT A01-A10; source/extras matrices; 58 prototype tests PASS | Review audit docs, create scoped Git audit feature |
| Material business policy | PENDING_USER | Consolidated question sent; DECISION_LOG | Apply actual answer once |
| 01 modern foundation | NOT_STARTED | Audit exists before scaffold/install | Theme/i18n/accessibility + Nest health; no fake auth |
| GitHub | READ_VERIFIED / WRITE_UNVERIFIED | Exact supplied repo, public, empty/no refs | Verify scoped dry-run; push only tested scope |
| PostgreSQL/Docker runtime | BLOCKED_ENVIRONMENT | Executables not found | Locate/enable safe isolated test environment |
| Video | DEFERRED_BY_USER | Explicit instruction; P38 retained | After implementation/final audit only |

## Latest foundation evidence - 2026-09-29

| Scope | Actual status | Evidence / next |
|---|---|---|
| 00 initial audit | RECORDED + INTEGRATED | feature/ui-requirements-audit c746707 -> master 65b2fd4, both remote |
| 01 independent entry/health slice | VERIFIED; broader product incomplete | feature/project-foundation; FOUNDATION_AUDIT; builds/typecheck/lint/8 unit/2 Nest HTTP/3 production smoke PASS |
| Reference preservation | PASS 84/84 | Fresh check:reference, no source edits |
| Current auth UI | ENTRY ONLY, LOGIN MISSING | No fake login or demo selector; real account/session/ownership next |
| Schema/migrations/seeds/booking policy | BLOCKED_DECISION | Single consolidated policy question still PENDING_USER |
| Actual PostgreSQL/Docker checks | BLOCKED_ENVIRONMENT | No runtime; no DB-success or Compose PASS claimed |
| Real graphs/full translated ride/driver UI | MISSING | Remain required; build after authorized policy/data layer |
| Repeat audits | FOUNDATION_AUDIT RECORDED | Separate full independent final audit NOT_RUN until product complete |
| Video | DEFERRED_BY_USER | Required P38/U11 row retained; no new scripting/recording/upload |

Changed scope: root workspace/dependency/container config; apps/api health/pg/error
boundary; apps/web selected auth design/locales/themes/skip/transport; shared view
contracts; actual tests; operating README; matrices/decisions/audits and evidence.
No migrations, original reference or approvals overwritten. Foundations do not close
domain/auth/DB/graph requirements. Final release branches/deployment are not created.

### Foundation publication checkpoint

Runtime/evidence commit **35fed0c** (`feat(foundation): add tested bilingual theme shell
and Nest gateway`) was pushed successfully to the supplied repository's
feature/project-foundation. Fresh frozen install/peer/typecheck/lint/build and 13
automated tests passed; 84 immutable reference files passed integrity. Existing master
at this checkpoint is 65b2fd4; integration uses non-fast-forward merge after these gates.
Final exact integration refs are observable in Git history, not reconstructed later.

## Database continuation evidence - 2026-09-29

DATABASE_AUDIT.md and evidence/runs/2026-09-29-database/ supersede the earlier no-DB blocker. Actual PostgreSQL 18.6 migration/seed/constraint/rollback tests PASS. P20/P23/P28 schema tooling and U04 now PARTIAL with real DB evidence; business transaction tests remain required. D01-D29 baseline adopted as engineering assumptions under current completion request; no migration/old approval overwritten. Docker P24/P25 remains PENDING_CI, not PASS. Video P38/U11 DEFERRED_BY_USER. Next real auth/ownership slice.
# 2026-09-29 authentication checkpoint

Authentication backend/account UI implemented; real PostgreSQL/HTTP tests and build/lint/typecheck/unit/reference checks PASS. Full product remains IN_PROGRESS. Auth browser suite pending isolated CI; local additional frontend preview was rejected by automatic approval review (blocked by policy). Database Docker CI run 36526747393 PASS. Next: owned quotes/requests, then shared-driver allocation/lifecycle, history/graphs/full UI. See AUTH_AUDIT.md; historical board entries below remain intact.

## Current complete-product checkpoint — 2026-09-29

This dated table supersedes historical starter/foundation blockers above; those records and approvals remain unchanged. All actual application work followed scoped feature commits and tested master integrations. Exact Git refs and executed CI are authoritative; final required branches are actually published as recorded below.

| Slice | Actual status | Exact evidence |
|---|---|---|
| 00 source/PDF/UI/repository audit | PASS / RECORDED_BEFORE_APP | c746707 -> master65b2fd4; INITIAL_AUDIT, original5pages/tables/source interactions; reference84/84 |
| 01 selected modern foundation | PASS / INTEGRATED |35fed0c/2e16dfc -> master7ce8017; native build/HTTP/SSR/unit/browser |
| 02 PostgreSQL/schema/seed | PASS / INTEGRATED |bebaea3 -> master9de6647; actual PostgreSQL migration/checksum/repeat seed/constraints; CI36526747393 |
| 03 real auth/ownership/account | PASS / INTEGRATED |7ce2c49 -> masterf2f2c99; real Argon2/cookie/CSRF/roles; CI36528241459 |
| 04 quotes/owned requests/retry | PASS / INTEGRATED |69d5671/257dc32 -> mastere5062a8; real SQL + CI36529950932 |
| 05 shared capacity/allocation | PASS / INTEGRATED |8563052/7ed148d -> masterd90c54b; both last-seat winners/two APIs/rollback/unknown-COMMIT; CI36530650512 |
| 06 lifecycle/immutable final/terminal | PASS / INTEGRATED |195d473 -> master3a15d6a; real lifecycle/cutoff tests; CI36531122860 |
| 07–08 owned history/graphs/full product | PASS / INTEGRATED |d0d9d45/d10a63b + baf7434 -> master76dd592; CI36532896472/36534145195;22browser cases/300actual views |
| 09 independent review/hardening | PASS / INTEGRATED |37ef042PASS36534932216; d677e12FAIL focus, b87fdfb+c985c29 repairPASS36537302983;8ff59d8 PASS36538087317(27E2E/300views/min chart label14px); mastera6109ac PASS36539130836 |
| 10 documentation/release publication | PASS / PUBLISHED | Pre-releasece17ce5 PASS36540258465; complete doc/license candidatea470f72 PASS36540724158 (64cases/all operational gates); release/v1.0.0 created/pushed from verifieda470f72, with final doc-only closure/CI tracked separately |
| Domain assumptions | ADOPTED_ENGINEERING_BASELINE | D01–D29 adopted under current completion request/PRD§17, no fabricated individual rate approval |
| Deployment | PASS_TESTED_DOCKER_FALLBACK | Free public-repo CI production containers fresh/repeat/persistence/reseed/outage503/recovery200; no paid/public-hosted endpoint claimed |
| Video P38/U11 | DEFERRED_BY_USER | Required row/link placeholder retained; no script/record/upload |
| Human live explanation/debug assessment | NOT_RUN | Factual AI disclosure and engineering/debug notes provided; no automatic human-ability certification |

A parallel-file native run had21PASS/1FAIL from owned test DB cleanup's3s timeout. The failed log is retained; separate administrative15s budget/always-close guard plus sequential full retest PASS24/24. Business3s statement/2s lock deadlines and real overlapping race tests stay unchanged. UI assertion failures were repaired or exposed/fixed actual defects, never weakened. Local additional preview remains BLOCKED by automatic approval review (blocked by policy); real browser/Docker proof uses CI. Original user processes/private app DB data remain preserved.
