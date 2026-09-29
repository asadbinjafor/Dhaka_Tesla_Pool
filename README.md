# Dhaka Tesla Pool — Final Codex Handoff v3
**Handoff revision 3, not an application release.**

Start with START_HERE_BN.md, AGENTS.md and START_CODEX.md.

Latest user choices: Next.js frontend, NestJS backend, Tailwind CSS, PostgreSQL;
required graphs, Dark/Light themes and Bangla/English product UI. First task is an
original-PDF/source/UI audit, followed by justified scoped improvements. Use the
actual PRD Git workflow during development; push tested scopes to the explicitly
provided repository after verifying the destination/access. Video stays deferred
until after implementation and the final audit.

There is no new Next/Nest app or bilingual UI implementation in this handoff. The
existing Dark/Light HTML is an unchanged reference. New documents, prompts and sample
translation catalogs specify the work to do. Historical test reports remain historical.
See DELIVERY_STATUS.md and evidence/package-check.json for what was actually checked.

Do not run npm install at this root expecting a working full stack: no application
scaffold is delivered. Run Codex's source audit first. Do not publish reference/ without
permission; runtime code must not import from it. Existing repos must reconcile guidance
rather than overwrite their code, approvals, task boards or applied migrations.
