# Sources and their different roles
## Authoritative project source
reference/PRD.pdf, original five-page internship brief; reference/PRD.md secondary.
Source terms/requirements remain unmodified. Page/section references in matrices.

## Current user additions
Latest request selects Next.js, NestJS, Tailwind, PostgreSQL; graphs, Dark/Light,
Bangla/English; original-PDF initial/slice/final audits; Git per PRD, repo later; video
later. These additions are NOT claimed to appear in the PDF.

## Official technical references consulted 2026-09-29
Technical implementation guidance, not substitutes for private project requirements.
Recheck supported compatible versions at coding time; this list does not pin packages.
- Codex project instructions: https://developers.openai.com/codex/guides/agents-md/
  (official page redirected to https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- Nest introduction/modules/TypeScript: https://docs.nestjs.com/
- Nest authorization: https://docs.nestjs.com/security/authorization
- Nest validation: https://docs.nestjs.com/techniques/validation
- Nest database integration: https://docs.nestjs.com/techniques/database
- Next locale routing/dictionaries: https://nextjs.org/docs/app/guides/internationalization
- Tailwind theme selector: https://tailwindcss.com/docs/dark-mode
- Git push/ref behavior: https://git-scm.com/docs/git-push
- pg same-client transaction requirement: https://node-postgres.com/features/transactions
- PostgreSQL READ COMMITTED snapshots (legacy T3): https://www.postgresql.org/docs/current/transaction-iso.html

## Further primary references for retained design proposals
These are retained from historical guidance; read/verify when implementing, not a claim
that a new backend fault test ran in this handoff:
- PostgreSQL locks: https://www.postgresql.org/docs/current/explicit-locking.html
- Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Clock semantics (legacy T13): https://www.postgresql.org/docs/current/functions-datetime.html
- Connection status (legacy T14): https://www.postgresql.org/docs/current/libpq-status.html
- pg connection lifecycle (legacy T16): https://node-postgres.com/apis/client
- Timestamp representation: https://node-postgres.com/features/types

All roadmap contracts (fare rate/cutoff/lock namespace/locale default etc.) are explicit
engineering proposals unless selected/approved; sources support mechanisms, not a
claim that these exact product policies are prescribed or already working.
