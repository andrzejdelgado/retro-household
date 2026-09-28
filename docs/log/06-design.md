# 06 — Design system

Date: 2026-09-28

## Inputs

- `PRD.md`, `docs/06-screen-specs.md` after D27 to D37, `docs/05-domain-model.md`, the inspiration image as a style hint (D21).
- The shadcn/ui registry, listed through the Shadcn MCP tool at the time of writing (46 components).

## Steps taken (in order)

1. User instruction at the start of the phase: shadcn components with orthodoxy, customising only when the UX cannot be achieved otherwise. Wrote this as principle 2 with a four-step ladder.
2. Listed the registry so the inventory names only real components.
3. Defined tokens: shadcn variables in oklch for the parent app (warm paper, warm ink, one teal accent), a dark set for the TV app, one additive warning token, six additive kid colour tokens. Fraunces for display, Inter for text, tabular figures on compared numbers. Tailwind type scale, no custom scale.
4. Built the inventory: 13 shared components and one row per screen, S03 to S16 and T01 to T05, plus a list of parts deliberately not used (no toasts, no tooltips, no charts).
5. Tested the two expected customisations against stock parts. Both avoided: the bottom tab bar is a nav of ghost Buttons; the bracket range picker is a two-thumb Slider. The customisation log is empty.
6. Wrote states and feedback rules, per-screen design notes at 375px and desktop for all 19 screens, the print stylesheet, and the accessibility baseline.
7. Updated the PRD line that still expected the two customisations. Wrote `process/06-design.md` (playbook) and this record. Committed and pushed.
8. User supplied ten reference templates from shadcnuikit.com in `templates/` (five as screenshots, the rest viewed in the browser) and asked for Geist instead of Inter. Mapped each template to a screen, surfaced the collisions (charts on Home, a wizard against D35, login against D04 and D05, notifications with no feature) and asked. Decisions: references only, both desktop grids, a household channels view, D35 kept with tile selection, a local parent passcode with reset as the only recovery, a warnings list behind the bell, library category and age filters.
9. Applied: S17 to S20 added to the specs, navigation and S07, S09, S12, S13, S15 amended; Show and Household fields added to the model; J1 and J13 in the journeys; D38 to D44 logged, D09 marked superseded in part; the design system gained Geist, four screen notes, three shared components and a reference templates section; PRD stories 66 to 71 and the demo path updated.

## Decisions made

None new in the log. Design choices recorded in the document: borders not shadows; one accent; Drawer on mobile and Sheet on desktop for every sheet-like surface; Popover not Tooltip for the why affordance; no chart library for the TV timeline.

## Outputs

- `docs/07-design-system.md`
- `process/06-design.md`
- `docs/log/06-design.md`

## Exit check result

All 23 screens have notes for mobile and desktop. The customisation log has no entries; both expected customisations are recorded as avoided with their replacements. Every inventory component is in the registry listing. Passed, pending user review of the tokens and fonts.

## What was learned

- Reading the registry first changed the design: two customisations disappeared before anyone built them.
- Design notes came out short because the specs already fixed copy, states and warnings. The phases divide cleanly when each one refuses to repeat the previous.
