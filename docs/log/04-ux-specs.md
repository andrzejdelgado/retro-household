# 04 — Journeys, domain model and screen specs
Date: 2026-09-28

## Inputs
- `docs/02-personas.md`, `docs/03-insights.md`, `docs/01-goals.md`, `PLAN.md` decisions D05 to D26, the five practice files.

## Steps taken (in order)
1. Wrote the domain model: 11 stored entities, a static content model (bracket, cap, tech stage, practice, rhythm template, major rule, source), 10 derived values, a warning catalogue of 12 codes each with fixes, and 7 invariants.
2. Found while modelling that the frequency rules for 3 to 5 (max 4 days a week, never two days in a row) cannot be expressed with weekday/weekend day types alone. Channel windows therefore carry their own weekday set and programmes are per weekday, while routines keep day types. Default window days for 3 to 5 are mon, wed, fri, sun.
3. Decided that a channel window defaults to the daily cap length (30 min for 4 to 5) starting at the kid's screen slot, so the programme ends with the budget rather than the TV cutting off mid-show.
4. Modelled "together slot" as an acknowledged overlap rather than a new schedule object.
5. Wrote 12 journeys using the demo household (Selena 1, Simona 4) and the three-kid seed household for the overlap case, with a journey-to-screen coverage table.
6. Wrote screen specs: global rules, five shared components (budget bar and sheet, warning card, bracket range picker, day switcher, timelines), navigation, 15 parent screens, 5 TV screens, and a coverage table.
7. Checked: all 12 warning codes appear in the specs; every screen in the journeys has a spec; constraints from I3 and I15 are must-not lines.
8. Wrote `process/04-ux-specs.md` (playbook) and this record. Committed and pushed.

## Decisions made
None new in the log. Design choices made inside the specs and listed for the user's review: bottom tab bar with four items (Home, TV, Rules, Settings); kids reached from Home; budget bar pinned above the tab bar with a sheet for detail; warnings inline under the causing field, never modal or toast; channel window defaults to cap length; channel days default per bracket rules; PIN screen shows no kid names; off-air animation in the kid's colour; co-watch overlay is the only TV surface with words.

## Outputs
- `docs/04-journeys.md`
- `docs/05-domain-model.md`
- `docs/06-screen-specs.md`
- `process/04-ux-specs.md`
- `docs/log/04-ux-specs.md`

## Exit check result
Every journey step points at a screen. Every screen lists warnings or states none. All 12 warning codes appear. Every screen names one primary action or says none. Passed, pending user review.

## What was learned
- The 3 to 5 frequency rules forced the schedule model to be per weekday. This is the kind of gap that only shows when the model is written against the real rules, not against the feature list.
- Deciding the default window length equals the daily cap removed a whole class of "TV cut off mid-episode" cases from the TV app.
