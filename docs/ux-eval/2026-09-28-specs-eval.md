# UX Eval — Retro Household: first run to first printed routine, plus TV setup

**Verdict:** mostly clear — a first-time parent finishes the specified flow, but two silences in the specs sit on the demo's own path and would become real defects if the build inherits them.

**Scope:** whole product as specified; primary flow S01 → S03 → S05 → S06 → S14, with the channel and TV flows (S09 to S11, T01 to T05) as the second pass.
**Inputs used:** intent docs only. `PLAN.md` (D01 to D26), `docs/01-goals.md`, `docs/02-personas.md`, `docs/03-insights.md`, `docs/04-journeys.md`, `docs/05-domain-model.md`, `docs/06-screen-specs.md`, `docs/log/*`. No source, no running app.
**Date:** 2026-09-28
**Stance:** first-time parent, on a phone, in a hurry, per D07. TV app judged on a desktop keyboard per D03 and D26.

## Summary

The set is unusually complete for a pre-code project: every screen names one primary action, every warning has a fix, constraints from the insights are written as must-not lines, and the criteria trace to screens. The specs are strong on what the parent sees and thin on what happens when they change something: editing a block's time, adding a channel to a child with no budget, and copying a day are described by their happy result but not by their rules, and each sits on the demo path.

**Top 3**

1. High · SPEC-GAP — a channel window has no defined default for a child with no screen slot or a zero cap (the Selena scenario).
2. High · SPEC-GAP — changing a routine block's time has no ripple or overlap rule, yet journey J3 relies on one.
3. Medium · SPEC-GAP — "copy a day" duplicates blocks, so the print picker cannot know two days are the same.

## Intent sheet (condensed)

Global rules: R1 one primary action per screen (§0). R2 warnings inline, never modal or toast (§0). R3 empty states carry the action (§0). R4 budget bar on S05, S06, S08, S09, S10, S11 (§0, §1). R5 every default carries a why (§0). R6 mobile first, 375px, no horizontal scroll (§0). R7 native time entry (§0). R8 TV wordless where the child reads, no text under 32px (§4).
Must-nots: M1 no gamification (I3, §0). M2 no TV progress, countdown, next episode (I15). M3 nothing from UI on paper (S14). M4 S11 never auto-applies. M5 library holds only parent content (S12). M6 Settings must not grow (S15).
Tensions: T1 J3 "drags" vs S06 no drag. T2 J5 edits a window on S08 vs S08 read-only. T3 S09 W05 "on add" vs W05 attached to an existing channel. T4 J4 prints Monday once with four names vs clone-by-copy.

## Findings

| ID  | Severity | Check          | Title                                                                                | Where                                         |
| --- | -------- | -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| U1  | High     | SPEC-GAP       | Channel window default undefined for a kid with no screen slot or zero cap           | `06-screen-specs.md` §S10                     |
| U2  | High     | SPEC-GAP       | No ripple or overlap rule when a routine block's time changes                        | §1 Timeline, §S06; J3 step 3                  |
| U3  | Medium   | SPEC-GAP       | "Copy a day" duplicates blocks, so identical days cannot be recognised for print     | `05-domain-model.md` DayType; J4 step 4; §S14 |
| U4  | Medium   | STRUCTURE-LEAK | Two time models: day types for routines, weekday sets for channels                   | `05-domain-model.md` Channel; §S06 vs §S10    |
| U5  | Medium   | FIELD-TAX      | A TV PIN is required to create any kid, before the TV has been mentioned             | §S03                                          |
| U6  | Medium   | CTA-AMBIGUITY  | S11's primary "apply the proposed fix on the first warning" does not say which fix   | §S11                                          |
| U7  | Medium   | RECALL-TAX     | A "together" slot in S11 and co-watching in T05 are unrelated                        | OverlapAck; §S11; §T05                        |
| U8  | Medium   | REACH-FAIL     | Pinned budget bar plus tab bar plus on-screen keyboard on S08 and S10 is unspecified | §1; §S08, §S10                                |
| U9  | Medium   | SILENT-DEFAULT | Landing on S05 does not say everything shown is a recommended default                | §S05; J1 step 4                               |
| U10 | Medium   | RECALL-TAX     | No path to a second kid from S03 or S05                                              | §S03, §S05; J2                                |
| U11 | Low      | INCONSISTENT   | Journeys and specs disagree in four places (T1 to T4)                                | J3, J5; §S08, §S09                            |
| U12 | Low      | FIELD-TAX      | S01 asks for a household name before showing any value                               | §S01                                          |
| U13 | Low      | INTENT-DRIFT   | T03 missing-file state shows the show title to the child                             | §T03                                          |
| U14 | Low      | SPEC-GAP       | T04 animation has no reduced-motion behaviour                                        | §T04                                          |
| U15 | Low      | SPEC-GAP       | Returning-user entry, back on first run, unsaved-form reload, PIN recall unspecified | §S01, §S03, §S05, C1.3                        |
| U16 | Info     | —              | An acknowledged W05 leaves the budget bar permanently in the over state              | §1 Budget bar; D14                            |

## Detailed findings

### U1 · High · SPEC-GAP · Channel window default undefined for a kid with no screen slot or zero cap

Where: §S10 "defaulting from the kid's screen slot and the daily cap". Ref: Nielsen #5; D17; C5.4; J6 steps 5 to 6.
Impact: Selena's 1-to-2 rhythm has no screen block and her cap is zero, so the default is nothing or a zero-length window. The demo premise lands on an empty or invalid form.
Fix: when screenSlot is null or the cap is zero, the weekday set starts empty, start and end are empty with the hint "Set when this channel is on air", Save stays disabled until set, W05 sits under the window from the first keystroke. Effort S.

### U2 · High · SPEC-GAP · No ripple or overlap rule when a routine block's time changes

Where: §1 Timeline; §S06; J3 step 3. Ref: Nielsen #5; Tesler; C3.1.
Impact: changing school to end at 17:00 either ripples as J3 promises or creates overlapping blocks and a broken print. Unspecified.
Fix: changing an end time moves the next block's start to match; changing a start moves the previous block's end; blocks never overlap; the sleep block anchors the day's end and a change that would push past it is refused inline with the reason. Effort S to specify, M to build.

### U3 · Medium · SPEC-GAP · "Copy a day" duplicates blocks

Where: DayType "Cloning means copying blocks"; J4 step 4; §S14 "distinct day type". Ref: Nielsen #6; C3.4.
Impact: four separate DayTypes with equal content; the print picker offers four pages; editing Monday does not touch Tuesday.
Fix: redefine "Copy to…" as re-pointing the chosen weekdays at the source DayType and deleting orphans. Distinct day type is then a distinct object; S14 prints one page per object with all its weekday names. Effort S.

### U4 · Medium · STRUCTURE-LEAK · Two time models

Where: Channel model; §S06 vs §S10. Ref: Tesler; working memory; Nielsen #4.
Fix: default a channel to one programme for all its days, edited once; "Vary by day" as an opt-in that reveals the per-weekday switcher. Effort S.

### U5 · Medium · FIELD-TAX · TV PIN required to create any kid

Where: §S03. Ref: forms §3; value before ask; C1.1.
Fix: PIN optional on S03 with "For the TV app. You can set it later."; asked on S09 when the first channel is added. Effort S.

### U6 · Medium · CTA-AMBIGUITY · S11's primary applies an unnamed fix

Where: §S11. Ref: Nielsen #8; M4.
Fix: remove the screen-level primary; each warning card carries its fixes with the first styled as that card's primary; "Open library" as a secondary link. Effort S.

### U7 · Medium · RECALL-TAX · Together slots and co-watching do not know about each other

Where: OverlapAck; §S11; §T05. Ref: Nielsen #6; D16; D17.
Fix: when T03 plays inside an acknowledged overlap, open T05 once at the start with the other acknowledged kids pre-switched on; say so under the "together" fix in S11. Effort M.

### U8 · Medium · REACH-FAIL · Pinned bar, tab bar and keyboard

Where: §1 Budget bar; §S08, §S10. Ref: mobile §5; Fitts.
Fix: while a field has focus the budget bar collapses to a single-line chip in the page header and the tab bar hides, restoring on blur. Effort S.

### U9 · Medium · SILENT-DEFAULT · Landing moment silent about defaults

Where: §S05; J1 step 4. Ref: Nielsen #1; G2.
Fix: one dismissable line on first visit: "Set up from recommended practice for age 4. Change anything." Effort S.

### U10 · Medium · RECALL-TAX · No path to the second kid

Where: §S03, §S05; J2. Ref: Nielsen #6; C1.1.
Fix: secondary "Save and add another" on S03. Effort S.

### U11 · Low · INCONSISTENT · Journeys and specs disagree (T1 to T4)

Fix: J3 "sets" not "drags"; J5 step 2 moves to S10; §S09 states W05 appears on the empty state as a note and inline in S10; J4 step 4 follows U3. Effort S.

### U12 · Low · FIELD-TAX · S01 asks for a name before value

Fix: consider dropping S01; first run opens S03 with the purpose line on top; household name defaults and is editable in S15. Effort S.

### U13 · Low · INTENT-DRIFT · Missing-file state shows the show title to the child

Fix: icon only; the title goes to the viewing log. Effort S.

### U14 · Low · SPEC-GAP · T04 has no reduced-motion behaviour

Fix: under prefers-reduced-motion the shape is static at low contrast. Effort S.

### U15 · Low · SPEC-GAP · Entry, back, reload and PIN recall

Fix: returning visits open S04; on first run S03 hides the tab bar and has no back; PIN boxes show current digits on edit; unsaved fields are not preserved and C1.3 applies to saved data; the PIN appears in the S05 header for the parent. Effort S.

### U16 · Info · Acknowledged W05 leaves the bar permanently over

Question: add a third bar state, "over by choice", numbers unchanged and colour neutral, once the W05 for that subject is dismissed?

## Prioritised next steps

Fix first: U1, U2, U3, U6. Then: U4, U5, U9, U10, U7, U8. Eventually: U11, U12, U13, U14, U15, U16.

## Coverage

Intent documents only; nothing built. R6 and latency, focus, keyboard-overlap behaviour unverifiable until a code-mode pass.
