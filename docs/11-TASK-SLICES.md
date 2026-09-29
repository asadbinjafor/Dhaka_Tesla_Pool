# Execution order — small reviewed, tested changes
Stack and required extras are selected. Existing user progress supersedes this initial
planning table. Don't restart completed verified work or make empty phases for ceremony.

| Phase | Feature slices | Exit evidence |
|---|---|---|
| 00 Audit | Read PDF/source/repo -> map gaps -> inspect UI -> classify improvements/policies | Initial matrices/findings with real status before application edits |
| 01 Foundation | Next+Nest workspace; actual dependencies; Tailwind theme tokens; en/bn infrastructure; gateway; early Docker | Modern shell in four combinations; dependency/docs decisions; no fake endpoints |
| 02 DB | Migrations/constraints; pg transaction provider; sessions; named seeds; ERD | Fresh/second-run tests, no destructive startup |
| 03 Auth | Passenger signup; both role logins; session/CSRF; guards; account UI | Independent authenticated users; localized errors; no demo switch |
| 04 Booking | Catalog/quotes; owner/expiry/idempotency; requests/current/details; UI | Canonical server prices; bilingual form/receipt/retry; stable IDs |
| 05 Allocation | Availability/relevance; first pool; joins/capacity; real races | Exact last-seat winner + same-request/two-driver/no-pool/retry tests |
| 06 Lifecycle | Arrive/freeze; start/complete; passenger/driver cancel; events/history | Guards/cutoff races/final evidence/prior cancellations preserved |
| 07 Full UI | Port all required screens/controls; polling/cache/error; locale transitions | Actual multi-session trips in both languages/themes; terminal reload |
| 08 Graphs/history | Owned stats SQL; filters; charts/tables; localized history | Required graphs with same totals/periods across four combinations |
| 09 Hardening | Independent PDF+extras audit; regression fixes; Docker/security/Git review | No unverified required-flow blocker, actual test/build/operation evidence |
| 10 Release | Integrated master -> pre-release -> verified release/v1.0.0; exact remote refs | Factual docs and deployment/fallback; video remains deferred |

Within phase 05: A availability/relevance; B first acceptance; C compatible joins;
D independent-connection/two-instance failures/races. Add tests with each slice.
Locale infrastructure starts in 01 and catalogs expand WITH each screen; not an
untranslated app followed by a last-minute button. Charts are required but do not
precede core integrity. Do not start unrelated features concurrently against evolving
schema/lifecycle/idempotency contracts.

After each natural slice: test -> self-review -> requirement evidence -> coherent
commit -> safe feature push (verified remote) -> gated integration. Follow Git document.
Do not wait for all code to exist before first commit; no need to ask for authorization
already present. Pause on real blockers/conflicts/material decisions or tool policy.
