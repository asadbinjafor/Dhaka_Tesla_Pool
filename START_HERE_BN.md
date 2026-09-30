# Final Handoff v3 — কীভাবে Codex-এ দেবে

> বর্তমান অ্যাপ npm দিয়ে চালানোর নির্দেশনা: [RUN_NPM_BN.md](RUN_NPM_BN.md)।
> নিচের অংশ original handoff-এর ইতিহাস; frontend/backend-এর নতুন npm structure ও
> বর্তমান verification ফল README এবং docs/NPM_STRUCTURE_AUDIT.md-এ আছে।

## এবার যা চূড়ান্তভাবে যুক্ত হয়েছে
Frontend Next.js, backend NestJS, Tailwind CSS এবং PostgreSQL। Original PDF-এর পাশাপাশি
আপনার তিনটি extra বাধ্যতামূলক: graph, Dark/Light, Bangla/English। প্রথম কাজ source UI
ও PDF-এর audit; তারপর প্রয়োজনীয় scoped improvement ও implementation। আগের Git HOLD
বাতিল: PDF-এর feature branch/commit/merge/release workflow কাজের সময় থেকেই থাকবে।
আপনি যে GitHub repo দেবেন সেটি যাচাই করে সেখানে scoped push হবে। Video শুধু পরে।

এই package-এ নতুন Nest backend বা Bangla UI ইতিমধ্যে তৈরি হয়নি। এটি instructions,
source reference ও translation starter; source Dark/Light HTML অপরিবর্তিত।

## নতুন project হলে
1. ZIP extract করুন। যে folder-এ AGENTS.md, START_CODEX.md ও reference/ আছে সেটি Codex
   workspace হিসেবে খুলুন (VS Code/Codex local workflow)। HTML code chat-এ paste নয়।
2. START_CODEX.md-এর প্রথম লাইনে আপনার exact GitHub repo URL দিন; এখন না থাকলে
   NOT_PROVIDED রাখুন। PAT/password/token paste করবেন না। Initial audit URL ছাড়াও হবে।
3. START_CODEX.md paste করুন অথবা file পড়িয়ে execute করতে বলুন। AGENTS/FINAL_MASTER
   ফাইলগুলিও পড়তে বলা আছে। প্রথমে app না বদলে PDF/UI audit, তারপর findings অনুযায়ী কাজ।
4. Audit-এ কেবল unsettled business rules/migration/conflict থাকলে একসঙ্গে clarify করবে।
   Next/Nest/Tailwind/Postgres ও তিনটি extra নিয়ে পুনরায় অনুমতি চাইতে হবে না।
5. Core থেকে একটি করে tested feature; local branch/commit history তখনই; ঠিক remote ও
   access পেলে required scopes push। Final audit তারপর release; video পরে আপনার অনুরোধে।

## Existing project হলে
এই handoff আলাদা handoff/ subfolder-এ দিন; actual application root খুলুন। Existing
AGENTS.md/code/package/migrations/TASK_BOARD overwrite করবেন না। Codex-কে প্রথমে
prompts/RECONCILE_EXISTING.md পড়তে বলুন। পুরোনো Git HOLD/Express/optional charts guidance
কে current user decisions দিয়ে reconcile করবে; existing useful implementation বাঁচাবে।
Applied migrations পুরোনো history edit করে বদলাবে না; প্রয়োজন হলে forward migration।

## Source folder-এর কাজ
- reference/PRD.pdf ও PRD.md: মূল requirement; কখনো user extra-কে PDF requirement বলে নয়।
- reference/ui-dark-light/: selected current HTML, src, assets, screenshots, audit/tests।
- docs/: active architecture/domain/API/DB/concurrency/i18n/Git/audit specifications।
- prompts/: প্রথম audit থেকে ছোট phase-এর instructions।
- templates/messages/: en/bn sample catalog; full production translation পরে implement।
- reference/history/: আগের kit শুধু archival ZIP; active instructions হিসেবে extract নয়।

## Bangla/English মানে পুরো UI
Navigation নয় শুধু: auth/form/validation/errors/dialogs/status/fare/history/graph/tooltip/
accessibility/date-number rendering দুই ভাষায়। চার combination test: EN-Dark, EN-Light,
BN-Dark, BN-Light। Language/theme বদলালে login, ride ID, fare, form, pending request বদলাবে
না। API enums/IDs/numeric amounts English/canonical থাকবে; user নাম নিজের মতো থাকবে।

## Git ও privacy
PDF p3 §§10–11: feature/* -> master -> pre-release -> release/v1.0.0। একসঙ্গে finished
code initial commit নয়। Normal scoped push করতে destination ও authentication বাস্তবে
যাচাই লাগবে; কোনো repo URL বা successful push এই package-এ আছে বলে দাবি নয়।
Root .gitignore reference/ বাদ দেয়। Source PRD/history/private assets অনুমতি ছাড়া public
করবেন না। Application/runtime/CI ignored reference/ থেকে import করা যাবে না।

## Video ও completion
Video DEFERRED_BY_USER থাকবে; এখন নতুন script/record/edit/upload নয়। Implementation+
extras verified, Git/process verified, deployment/fallback, video—চার status আলাদা।
কোনো check চালানো না গেলে NOT_RUN/BLOCKED; কেবল “done” বা checklist পূর্ণ হলেই 100% নয়।

## package যাচাই
python tools/check_handoff.py  দিয়ে hashes, source copies, active instructions ও
translation-template parity পরীক্ষা করা যায়। এটি app test নয়। Current packaging
result evidence/package-check.json-এ; historical UI reports reference-এর ভেতরে।
