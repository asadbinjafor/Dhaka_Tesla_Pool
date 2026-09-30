# Dhaka Tesla Pool frontend

Independent Next.js App Router/Tailwind npm application. From this folder:
`npm install`, then `npm run dev`. Node24.17.x/npm12.0.2; browser127.0.0.1:3000.
Backend remains127.0.0.1:3001. Use that exact browser host for the documented cookies/CSRF.

| Folder | Responsibility |
|---|---|
| src/app | Locale-prefixed pages, layouts and same-origin API forwarding |
| src/components | Passenger/driver screens and identity/view/ride providers |
| src/i18n | Complete English/Bangla catalogs and money/Dhaka-time formatting |
| src/lib | Canonical frontend contracts and bounded gateway helpers |
| public | Existing supplied Bullet artwork and licensed assets |

The private server gateway origin defaults to127.0.0.1:3001. An app .env.local may
configure API_INTERNAL_ORIGIN; Next loads it first, with existing parent .env gateway
fallback for the prepared checkout. No DB credentials or NEXT_PUBLIC secrets.
Browser state changes language/theme without changing identity, ride/draft/quote or
pending command UUID. Nest owns all authentication, fares and business mutations.

Commands: `npm run build`, `npm run typecheck`, `npm run lint`, `npm start` (after build).
The root test package is optional; no root npm install/workspace is needed to run this
app. Full isolated production browser regression runs in CI. [Bangla run guide](../RUN_NPM_BN.md),
[current source/PDF audit](../docs/NPM_STRUCTURE_AUDIT.md).
