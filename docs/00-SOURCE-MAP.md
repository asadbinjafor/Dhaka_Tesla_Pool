# Source map, supersession and boundaries

| Material | Role |
|---|---|
| reference/PRD.pdf | Original requirements, five pages/19 sections; read text AND tables |
| reference/PRD.md | Secondary readable copy; don't dump embedded base64 |
| reference/ui-dark-light/index.html | Current executable DEMO UI reference |
| reference/ui-dark-light/src/ | Readable existing components/styles/local domain/store |
| reference/ui-dark-light/assets/, screenshots/ | Current selected rickshaw visual baseline |
| reference/ui-dark-light/docs/, tests/, evidence/ | Historical demo documentation/tests, not backend proof |
| AGENTS.md, FINAL_MASTER_PROMPT.md, active docs/prompts | Current final implementation instructions |
| reference/history/Codex_Kit_v2_HISTORICAL.zip | Frozen earlier guidance; not active authority |

The original PDF is not edited. Explicit current user additions are tracked separately.
The user's newly chosen NestJS/Tailwind/graphs/bilingual/Git directions supersede those
specific earlier proposals. Unchanged D01–D29 remain proposals unless actually approved.
If the actual repository already has approvals/code, reconcile rather than reset.

Selection of an image does not validate invented metrics, fees, live navigation,
ratings, revenue, wallet or seat-specific reservation policies pictured in a mockup.
Source UI is already a more constrained demo; inspect it rather than assuming every
mockup feature exists. No private Tesla car; driver separate from three passenger seats.

Current source audit anchors (static observations, NOT fresh runtime verification):
- ui-dark-light/package.json describes offline demo and React16 runtime.
- src/app.jsx uses DemoStore and contains English render text and preview account UI.
- src/store.js implements browser-local persistence/identity; not server authorization.
- src/styles.css is the visual baseline; target styling is Tailwind with preserved tokens.
- No new NestJS/PostgreSQL implementation is supplied in this handoff.
- Bangla translation files under templates/ are a starting catalog, not implemented
  bilingual support. Source English UI and old reports remain unchanged.

Root .gitignore excludes reference/ from new repositories. Keep exact private assets
local unless authorized. Runtime/CI must not depend on ignored reference files. Copy
only permitted required artwork into application-owned assets with licenses/provenance.

## Actual audit output vs template
The initial matrices in this handoff have UNVERIFIED statuses. Codex must collect
evidence in the actual application workspace. Do not rename these templates to an
initial audit and call the user repository checked. Archived prototype tests retain
their original environment/ref limitations. Source improvement is not a completed
backend, and a translation JSON is not an implemented language switch.
