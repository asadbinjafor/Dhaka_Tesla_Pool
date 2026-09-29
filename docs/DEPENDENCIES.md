# Foundation dependency decisions - 2026-09-29

Registry metadata was fetched from registry.npmjs.org, including engines/peer requirements, before installation. Official sources: [Next installation](https://nextjs.org/docs/app/getting-started/installation), [Nest migration guide](https://docs.nestjs.com/migration-guide), [Tailwind Next setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [PostgreSQL supported versions](https://www.postgresql.org/support/versioning/). Docker Hub confirmed the named official tags and immutable manifest digests recorded in Dockerfile/compose.yaml.

| Choice | Pinned version | Fit, alternative and change trigger |
|---|---|---|
| Node | 24.17.0 LTS line | Existing supported runtime; Node 22 alternative. Change when support/security/engine needs require it; production and local must agree. |
| Next / React | 16.3.6 / 19.3.0 | User-selected Next, maintained stable React replacing immutable React16 reference. Plain React is PDF-permitted but not current user selection. |
| Nest | 12.1.1 | User-selected modular API; ESM/NodeNext source, decorators compiled by tsc. Explicit service injection. Independent Express business application excluded; Nest's adapter is used. |
| Tailwind / PostCSS | 4.3.3 / 8.5.28 | User-selected Tailwind; semantic CSS variables preserve both selected themes. Plain CSS alternative does not meet selected styling alone. |
| PostgreSQL | 18.6 | User-selected DB, maintained stable major/minor; 19 beta not chosen. Constraints and locking are suitable for capacity. MySQL/SQLite are PDF alternatives, not this selected scope. |
| pg | 8.23.0 | Explicit parameterized transactions/parent locks are explainable. ORM alternative only if identical transaction semantics retained. Foundation only opens pooled readiness queries; business repository not implemented. |
| TypeScript | 6.0.3 | Supported by typescript-eslint peer <6.1; registry latest 7.0.2 was deliberately not used because lint compatibility matters. Revisit after ecosystem support. |
| ESLint | 9.39.5 | Registry maintenance tag matches current Next lint plugins' <=9 peers. Initial 10.11.0 choice failed peer checks; corrected without ignoring peers. Registry marks 9 deprecated, so track compatible plugin upgrades before production release. No peer conflicts remain. |
| pnpm | 12.6.0 | One pinned workspace manager/lockfile; npm workspaces alternative. Native Windows launcher requires a functioning install; first npm-exec shim failed, bundled pnpm.mjs/native launcher used. |
| Localization | Typed local JSON dictionaries + Next routes | Two fixed languages, no runtime service; next-intl is an alternative if richer message/route needs outgrow simple catalogs. Provider above locale route preserves drafts. |
| Tests | Node test runner + actual HTTP; browser via CUA for this slice | Meaningful invariants/transport tests without another unit framework. Playwright required product E2E planned separately; historical Python suite not counted. |
| Fonts/artwork | System Nirmala UI/Vrinda fallback; supplied Bullet webp | No external font download. User selected artwork copied into runtime-owned public asset; no legacy UMD or ignored-reference import. Actual Bangla rendering must be reviewed across target devices. |

Session/Argon2/CSRF/migration tooling are not implemented by this foundation. Select and verify them in their own tested slices rather than claim this table closes auth/DB requirements. Foundation container images retain build dependencies; slim production packaging is an operational improvement, not evidence of a tested deployment. Compose execution is BLOCKED without Docker; migration and opt-in seed stages must be added with phase 02.

Install initially stopped at pnpm's unapproved native `unrs-resolver` build. After identifying the registry resolver used by ESLint, that exact package was explicitly allowed alongside the named native framework builds. Installation and peer validation then passed. Supply-chain checks remain enabled. The lockfile's exact recent Nest/typescript-eslint version exceptions are visible in pnpm-workspace.yaml; these are verified registry choices, not wildcard exemptions.
