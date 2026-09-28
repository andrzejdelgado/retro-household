# 06 — Design system (playbook)

## Purpose

Give the build everything it needs to design screens in code without inventing anything twice: tokens, a component inventory mapped to a stock library, a customisation log with a high bar, and short design notes per screen for each target width. Screens themselves are designed while they are built, not as separate artefacts.

## Inputs

- PRD and screen specs, after any review fixes.
- The domain model, for the vocabulary and the states to render.
- Style references, used as a hint for palette and typographic mood only.
- The component library's current registry, checked at the time of writing, so the inventory names real parts.

## Steps

1. Write the principles first, including the customisation ladder: compose stock parts; use documented variants; pass token-mapped classes; only then change component source, and log it. Say plainly that the log is expected to stay empty.
2. Define tokens as the library's own variables (colour, radius, fonts) plus the smallest set of additive tokens the product needs (for example a warning colour, per-entity colours). Give every text pair a contrast check as a build task, not as a claim.
3. Choose fonts that are free and loadable through the framework, one display and one text face at most, with tabular figures wherever numbers are compared.
4. Build the component inventory: first the shared components from the specs, then one row per screen listing exactly which stock parts it uses. Name the one part to use where two could do. List the parts deliberately not used and why.
5. Revisit every customisation the specs expected and try to remove it with a stock part before accepting it. Record the avoided ones in the log with what replaced them.
6. Write per-screen design notes: mobile layout in a few lines, then only what changes on desktop. Do not repeat copy the spec fixes.
7. Add the states and feedback rules (pending, saved, focus, disabled, hit areas), the print stylesheet if the product prints, and the accessibility baseline.
8. Check: every screen in the specs has a note for each target width; every customisation entry has the "why the ladder failed" line; the inventory uses only registry names.
9. Commit and present. Design review then happens per screen during the build, against these notes.

## Outputs

- `docs/07-design-system.md`.
- `docs/log/06-design.md`.

## Exit check

- Every screen has design notes for each target width.
- The customisation log has no entry without a reason, and each expected customisation was either avoided or justified.
- Every component in the inventory exists in the library's registry.

## Lessons

- Checking the registry before writing the inventory turned two expected customisations into stock parts: a navigation element is not a tab component, and a two-thumb slider is a contiguous range by nature.
- "Borders, not shadows" and "one accent" decided in the tokens removed most later polish debates before they started.
- Design notes per screen are the contract for design-in-code. Without them, "build it and review" has nothing to review against.
- Ask for reference templates before writing the design system, not after. Mapping each template to a screen, and naming what is taken and what is left, is a cheap way to settle desktop layouts; the collisions it surfaces (a wizard, a login, a notifications page) are product decisions that belong in the log, not in the build.
