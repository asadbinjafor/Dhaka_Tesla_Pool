# UI improvements from the first audit

Source: INITIAL_AUDIT F01-F08, 2026-09-29. Reference bytes and chosen design are preserved. Current UI is a prototype; improvements go into apps/web with real Nest boundaries.

| Order | Scope | Acceptance / evidence |
|---|---|---|
| 1 | Port semantic dark/light tokens, authentic rickshaw auth composition, en/bn providers; repair auth skip target | Four combinations, auth main focus, keyboard focus, mobile overflow, real production CSS and no hydration errors. |
| 2 | Real authenticated account menu, signup/login/logout, private query boundaries | Server session owns identity; no preview/reset controls; role/foreign resource tests; logout cancels previous-session reads. |
| 3 | Booking draft + valid quote + retry intent retained across presentation changes | Same canonical zones/seats/quote/key; no submit on switch; localized input/error/dialog; pending command uses same intent. |
| 4 | Driver requests, roster and valid lifecycle; stable passenger/driver detail/history | Actual API records, correct next actions, owned fields, terminal reload, arrival/join/cancel tests. |
| 5 | Real history charts/cards/exact tables | Owned SQL completed records; timezone/range/quantity/cancellation correctness; localized chart names and non-color-only data. |
| 6 | Review entire four-combination product at 360/390/768/1024/1440 | Bangla conjuncts/wrapping, controls, dialogs, errors, reduced motion; source comparison and independent final audit. |

Preserve deep charcoal #090f10, green surfaces, lime dark actions, clean pale-green light background and dark-green light actions. Preserve card radii, spacious desktop layout, responsive mobile controls, Bullet hero image and quantity seats with driver separate. Increase readable target-screen text/action sizing where source captions are cramped; do not substitute a generic dashboard.

Confirmed F05 reproduces on sign-in: skip link points to #main-content but no target exists. Closure requires a real focusable main on both auth screens; simply removing the skip link is not the fix. Reference dialog already provides focus trapping; preserve it in target rather than falsely claiming it is missing. Full assistive-technology review remains NOT_RUN.

## Implemented entry slice closure

Order 1 is verified for current auth entry screens: Next/Tailwind build, four locale/theme
combinations, server preference rendering/refresh, theme/language form retention,
main focus on both screens, sampled 390/1440px overflow/control-size checks and no
observed console/hydration errors. F05 closed in target source, unchanged in immutable
prototype. Light-pane story eyebrow contrast inheritance was found/repaired/retested;
brand caption raised to 12px. FOUNDATION_AUDIT records limits. Orders 2-6 remain open;
the full product/assistive-technology/actual ride-intent audits are not declared passed.
