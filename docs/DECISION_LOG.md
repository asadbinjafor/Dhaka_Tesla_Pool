# Working decision log template
Reconcile existing approvals; don't replace history. User's current stack/extras/Git
choices are selected, but detailed unspecified business assumptions are not silently approved.

| Decision | Authority | Status |
|---|---|---|
| Next.js / NestJS / Tailwind / PostgreSQL | Latest explicit user request | USER_SELECTED |
| Graphs / Dark+Light / Bangla+English | Latest explicit user request | USER_REQUIRED |
| Audit source+PDF first; correct justified gaps; audit again | Latest explicit user request | USER_REQUIRED |
| Original PRD Git workflow during development; repo supplied later | Latest explicit user request | USER_SELECTED; remote missing |
| Video after implementation/audit | Latest explicit user request | DEFERRED_BY_USER |
| D01–D29 detailed domain policies | Earlier engineering proposals | RECONCILE_APPROVAL |
| Locale routing/default/numeral/tool selection | Implementation proposals | DOCUMENT_IN_FIRST_AUDIT |

Add decision date, rationale, affected files/tests and any actual user approval. Don't
invent approval dates or infer every policy was approved from visual design selection.

## Actual audit reconciliation - 2026-09-29

- USER_SELECTED/REQUIRED: Next App Router, Nest, Tailwind, PostgreSQL; real graphs; complete en/bn; Dark/Light; PDF feature->master->pre-release->release workflow. Earlier HOLD/Express/optional extras withdrawn by current user, not active.
- Supplied exact remote: https://github.com/asadbinjafor/Dhaka_Tesla_Pool.git. A09 confirms public empty repository/no refs; no unrelated history/default change required. Write access pending verification; missing-URL blocker is superseded.
- Working root is this handoff directory: no other application/Git root discovered. Existing reference bytes/approval/task templates retained; no migrations exist to replace.
- PENDING_USER: one consolidated question for D01-D17 and fare/matching/arrival/cancellation baseline. Do not write dependent business implementation before response. D18-D29 safety/presentation mechanisms remain documented engineering decisions, not exact PDF text.
- Engineering choice: use en default, dark default, explicit cookie preference; validated en/bn routes; canonical IDs and in-memory presentation provider above locale boundary. These affect presentation, not fares/eligibility; no further stack/extra approval requested.
- Video REQUIRED/DEFERRED_BY_USER; no script/record/upload work now.
