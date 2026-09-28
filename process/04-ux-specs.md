# 04 — Journeys, domain model and screen specs (playbook)

## Purpose
Turn personas and insights into three documents the design and build phases can execute without guessing: what the user does (journeys), what the system knows (domain model), and what each screen shows, does and refuses (screen specs).

## Inputs
- Personas and insights.
- Goals and criteria.
- The decision log.
- The source material, for the content model.

## Steps
1. Write the domain model first. Journeys and specs both depend on its vocabulary. Include: stored entities with fields, the static content model derived from source material, derived values with their rules (never stored), a warning catalogue with codes, triggers and one-action fixes, and invariants.
2. Derive the warning catalogue from the rules in the source material that a person cannot hold in their head. Every warning needs a subject, a trigger written against derived values, and at least one fix that applies in one action. Write messages as consequences for the end beneficiary, not as rule violations.
3. Write journeys as tables: step, screen, what the user does, what the system does. Use the demo persona and the demo data so each journey is also a demo script. Name the criteria each journey serves. Number screens as you go (S01, T01) and keep a coverage table.
4. Write screen specs. Start with rules that apply to every screen, then shared components, then navigation, then one spec per screen with: purpose, entry, content, one primary action, states including empty and edge, warnings shown with their fixes, must-not lines, criteria served. Name the obvious library component where one exists so the design phase starts from it.
5. Put constraints from the insights ("no gamification", "no autoplay") into must-not lines on the screens they apply to and in the global rules. Constraints not written into a spec are lost.
6. Run the checks: every warning code appears on at least one screen; every screen in a journey has a spec; every criterion maps to a screen; every default value on a screen has a why.
7. Commit and present for review, listing the design choices that were made in the specs so the user can reverse them before design starts.

## Outputs
- `docs/04-journeys.md`, `docs/05-domain-model.md`, `docs/06-screen-specs.md`.
- `docs/log/04-ux-specs.md`.

## Exit check
- Every journey step points at a screen spec.
- Every screen spec lists its warnings and their proposed fixes, or states none.
- Every warning in the catalogue appears on at least one screen.
- Every screen has exactly one primary action, or states why none.

## Lessons
- Writing the domain model before the journeys exposed model gaps (for example that a schedule needs per-weekday days, not only day types, when frequency rules exist) that journeys alone would have hidden.
- The warning catalogue is the product's conscience. Deriving it from the source rules and giving each warning a fix produced most of the "forgiving" behaviour without a separate effort.
- A single primary action per screen forces real prioritisation. Where it felt impossible, the screen was two screens.
