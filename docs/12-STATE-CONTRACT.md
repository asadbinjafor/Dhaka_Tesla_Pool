# Closed command, state and price contract — current adapted contract proposal

> Current context: use NestJS services/transaction-scoped repositories, Next.js +
> Tailwind and required en/bn + two themes + graphs. Core domain rules below remain
> proposals subject to actual decision approval. API locale-independent; only UI
> paths are locale-prefixed. Original detailed v2 archive is historical, not active.


The PRD offers suggested lifecycle names, not these exact transition guards. This table closes the kit's proposed D01–D30 policy so schema/API/UI/tests agree. All other fresh transitions are rejected. Source remains PRD §3/§17; this table is a documented proposal, not an exact mandate.

## Fresh command transitions (new Idempotency-Key)

| Command | Actor / target | Allowed pre-state | Result | Atomic side effects |
|---|---|---|---|---|
| CREATE_REQUEST | Passenger / own unused valid quote | No own active request | REQUESTED | Consume quote once; no membership; request event. |
| ACCEPT | Online driver / unassigned request | Request REQUESTED; pool absent or ACCEPTED | Request MATCHED; pool ACCEPTED | Driver-owned pool; unique membership; quantity reserve; versions/events. |
| ARRIVE | Assigned driver / pool | Pool ACCEPTED, >=1 current MATCHED member | Pool+current members DRIVER_ARRIVED | Close joins/passenger cancel; freeze each owned fare from current membership. |
| START | Assigned driver / pool | Pool+current members DRIVER_ARRIVED | STARTED | Preserve finalized prices; versions/events. |
| COMPLETE | Assigned driver / pool | Pool+current members STARTED | COMPLETED | Current members complete; ended_at; history links remain; active occupancy becomes zero. |
| PASSENGER_CANCEL | Passenger / owned request | REQUESTED unassigned, or MATCHED in ACCEPTED pool | Request CANCELLED | Own seat release only; keep membership; last current member closes pool. |
| DRIVER_CANCEL | Assigned driver / pool | ACCEPTED or DRIVER_ARRIVED | Pool+current members CANCELLED | Preserve prior canceled members and all final price evidence; policy charge zero; terminal times. |
| SET_AVAILABILITY | Driver / own profile | Offline→online; online→offline only with no active pool | Requested boolean | Same-value request is a no-op; no duplicate change event. |

Canceled members remain canceled under ARRIVE/START/COMPLETE/DRIVER_CANCEL and are excluded from active fare-discount membership counts. No command edits seats after booking, reopens a pool, rematches an assigned request or changes ownership/capacity. Pool-wide completion is the documented-prototype simplification proposed for the final MVP; it is not real individual-stop tracking.

## Repetition is not an alternative transition

| Situation | Required response |
|---|---|
| Same actor/action/key, same target and canonical body, stored committed receipt | Authenticate/CSRF and verify durable ownership; replay receipt without any mutation. Current lifecycle or consumed/expired quote does not invalidate historical success. |
| Same actor/action/key but changed target or body | 409 IDEMPOTENCY_KEY_REUSED; nothing changed. |
| Another actor presents same key | Separate key namespace; no foreign receipt returned; normal authorization applies. |
| Fresh key repeats ACCEPT/ARRIVE/START/COMPLETE/CANCEL after allowed pre-state has passed | 409 REQUEST_UNAVAILABLE or INVALID_TRANSITION (CANCELLATION_CLOSED for arrived/started passenger cancel); no early success. |
| Same-key original command is still in progress | Wait within bounded limit; do not return unfinished success. Retry same key if outcome unresolved. |
| COMMIT acknowledgement missing | Outcome unknown; reconcile same key, never invent success or rollback. |

For PASSENGER_CANCEL in COMPLETED/CANCELLED, fresh key gives INVALID_TRANSITION; in DRIVER_ARRIVED/STARTED it gives CANCELLATION_CLOSED. For a terminal/nonowned private resource, ownership/error rules still precede exposing state.

## Price display/charge contract

| Request state | Primary UI price | chargePoysha | Preserved final snapshot |
|---|---|---|---|
| REQUESTED | Solo maximum + potential pooled estimate | null (not finalized) | None |
| MATCHED | Current membership-dependent estimate, never above own quoted maximum | null | None |
| DRIVER_ARRIVED/STARTED | Finalized fare | Final total | Required |
| COMPLETED | Final trip fare; cash collection not tracked | Final total | Required, unchanged |
| CANCELLED before arrival | No charge | 0 | None |
| CANCELLED by driver after arrival | No charge | 0 | Required, labeled previous finalized price for history |

`collectionStatus=NOT_TRACKED` always. chargePoysha expresses the fare/cancellation policy, not outstanding cash debt or proof of payment. No PAID, refunded, settled, earnings or balance labels without additional implemented semantics.

## Model-to-UI identity

/[locale]/passenger/ride discovers own active ID. The actual journey page is /[locale]/passenger/rides/[id], reading the same ID through all states. /[locale]/driver/pool similarly resolves to /[locale]/driver/pools/[id]. Empty current is a separate no-active state, not an inferred completed state. History links resolve to the same authorized detail routes.

One coherent owned response has request and pool version fields. Membership-dependent prices/counts cannot be guarded using only request.version. A no-longer-current but owned trip remains readable; a foreign ID does not.
