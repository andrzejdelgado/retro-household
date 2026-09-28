# 03 — UX research (desk)
Date: 2026-09-28

## Inputs
- `best-parctices/parent-tech-concerns.md` and the other four practice files.
- `PLAN.md` decisions D07 to D17, D20.
- `docs/01-goals.md`.

## Steps taken (in order)
1. Chose three households by product regime: one child under 3 (no screen budget), two children 3 and 6 (the demo case), three children 2, 4 and 7 with a split week (the complexity case).
2. Wrote each persona from named concerns in the concerns file, with jobs to be done, pains and what must be true for them.
3. Added secondary readers (second parent, carers) and the child as TV user with age-appropriate abilities.
4. Wrote 15 insights, each with evidence in a practice file, an implication, and the features, decisions and criteria it serves.
5. Built the feature coverage table for F1 to F4 from D11. All four features are covered.
6. Surfaced one proposed addition from I12: a read-only "what opens next" view per child. Left it for a decision.
7. Wrote `process/03-ux-research.md` (playbook) and this record. Committed and pushed.
8. User changed persona names to English, then replaced P2 with a household of kids aged 1 and 4 (daycare 9:30 to 13:30; school 9:00 to 16:00 with a class until 17:00 Monday to Thursday). Finished the consistency edits P2 needed (remaining references to the old kids, the console job replaced by a split-week job since a 4-year-old has no games), updated C1.1 and the demo path in `docs/01-goals.md`, and extended I7 with the sibling-exposure rule the new pains point at.

## Decisions made
None new. One proposed: "what opens next" view (pending).

## Outputs
- `docs/02-personas.md`
- `docs/03-insights.md`
- `process/03-ux-research.md`
- `docs/log/03-ux-research.md`

## Exit check result
Every feature in D11 traces to at least one insight. Every insight names a practice file section. Proposed addition listed separately. Passed, pending user review.

## What was learned
- The under-3 persona exposed that the product's core feature (TV) is absent for a whole segment, which the goals had flagged as a risk. The insight (I12) produced a concrete, small proposal rather than a redesign.
- I3 (no gamification) and I15 (no autoplay, no countdown) are constraints rather than features. They need to appear in the screen specs as explicit "must not" lines or they will be lost.
