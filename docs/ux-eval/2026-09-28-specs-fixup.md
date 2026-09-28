# UX Fixup — Retro Household: specs (docs-only)

Source report: docs/ux-eval/2026-09-28-specs-eval.md
Date: 2026-09-28
Result: 16 fixed · 0 skipped · 0 needs owner · 0 already resolved · 0 reverted

The project has no code yet, so every fix is an edit to `docs/04-journeys.md`, `docs/05-domain-model.md` or `docs/06-screen-specs.md`, with decisions D27 to D37 appended to `PLAN.md`. U12 and U16 were owner decisions; the owner chose option (a) for both.

## Status

| ID | Severity | Check | Status | Note |
| --- | --- | --- | --- | --- |
| U1 | High | SPEC-GAP | fixed | S10 state added; D27 |
| U2 | High | SPEC-GAP | fixed | §1 Timeline ripple rule; J3 wording; D28 |
| U3 | Medium | SPEC-GAP | fixed | DayType copy re-points; day switcher, S14, J4; D29 |
| U4 | Medium | STRUCTURE-LEAK | fixed | one programme per channel, vary by day opt-in; Channel model, S10, J6; D30 |
| U5 | Medium | FIELD-TAX | fixed | PIN optional on S03, asked on S09; Kid model, J1, J6; D31 |
| U6 | Medium | CTA-AMBIGUITY | fixed | S11 primary removed; D32 |
| U7 | Medium | RECALL-TAX | fixed | OverlapAck pre-fills T05; S11 line; D33 |
| U8 | Medium | REACH-FAIL | fixed | budget bar collapses and tab bar hides on focus; §1, §2 |
| U9 | Medium | SILENT-DEFAULT | fixed | S05 first-visit line; J1 |
| U10 | Medium | RECALL-TAX | fixed | S03 "Save and add another"; J2; D34 |
| U11 | Low | INCONSISTENT | fixed | T1 via U2, T2 J5 moved to S10, T3 S09 warning placement, T4 via U3 |
| U12 | Low | FIELD-TAX | fixed | S01 removed, first run opens S03; household name defaults; D35 |
| U13 | Low | INTENT-DRIFT | fixed | T03 missing-file state wordless |
| U14 | Low | SPEC-GAP | fixed | T04 reduced-motion line |
| U15 | Low | SPEC-GAP | fixed | S04 returning entry, S03 first-run and reload lines, S05 shows PIN; D36 |
| U16 | Info | — | fixed | budget bar "over by choice" state; D37 |

## Before and after

| ID | Before | After |
| --- | --- | --- |
| U1 | S10: window "defaulting from the kid's screen slot and the daily cap", nothing for a null slot or zero cap | S10 state: days and times start empty with "Set when this channel is on air", Save disabled until set, W05 at once |
| U2 | §1 Timeline: "Reordering is by changing times, not by drag"; J3 "Drags the school block's end" | §1: end change moves next start, start change moves previous end, no overlaps, sleep anchors the day, refusal inline with reason; J3 "Sets… Free play's start ripples to 17:00" |
| U3 | DayType: "Cloning means copying blocks"; S14 "one per kid per distinct day type"; J4 "printed once with the four day names" | DayType: copy points weekdays at the source; S14 "one per kid per day type object"; J4 one tab "Mon · Tue · Wed · Thu", one page |
| U4 | Channel `programmes: Record<Weekday, ShowId[]>`; S10 day switcher and "Copy to…" always; J6 "Copies Monday to wed, fri, sun" | Channel `programme: ShowId[]` plus `programmesByDay` when varied; S10 one list, "Vary by day" switch; J6 "Leaves Vary by day off" |
| U5 | S03 "fewer than four digits keeps Save disabled" | S03 PIN optional with "For the TV app. You can set it later."; S09 asks on first channel; Kid.pin nullable |
| U6 | S11 "Apply the proposed fix on the first warning" | S11 "None (D32). Each warning card carries its fixes…" |
| U7 | OverlapAck "Budgets are unaffected"; T05 entry Cmd+K only | OverlapAck opens T05 once with acknowledged kids on; S11 together fix says so |
| U8 | Bar "pinned above the tab bar", nothing about the keyboard | Bar collapses to a chip and tab bar hides while a field has focus; §2 states it |
| U9 | S05 header: name, age, bracket, edit link | S05 first visit: "Set up from recommended practice for age 4. Change anything." |
| U10 | S03 Save goes to S05; J2 starts on S04 | S03 secondary "Save and add another"; J2 starts there |
| U11 | J5 on S08; S09 "W05 on add" | J5 steps 2 to 4 on S10; S09 W05 as empty-state note and inline in S10 |
| U12 | S01 Welcome with a household name field | S01 removed; S03 first-run opens with purpose sentence and "Add your first child"; name defaults to "Home" |
| U13 | T03 missing file "with the show title" | "and nothing else for the child; the show title goes into the viewing log entry" |
| U14 | T04 animation, no reduced-motion line | "Under prefers-reduced-motion the shape is static at low contrast." |
| U15 | S01 "First run, or after a full reset"; nothing on returning entry, back, reload, PIN recall | S04 "Returning visits open here"; S03 first-run hides tab bar and back, unsaved fields not preserved, PIN digits shown on edit; S05 header shows the PIN |
| U16 | Bar: three states, over at once for a zero cap | Four states; over by choice after the subject's warning is dismissed |

Verified: each pass condition checked statically by locating the new line at the named screen or section. No browser, no build.

## Intent changes
- `docs/06-screen-specs.md`: §1 Budget bar, §1 Timeline, §1 Day switcher, §2 Navigation, S01 (removed), S03, S04, S05, S09, S10, S11, S14, T03, T04, T05, §5 coverage.
- `docs/04-journeys.md`: J1, J2, J3, J4, J5, J6, coverage table.
- `docs/05-domain-model.md`: Household.name, Kid.pin, DayType copy rule, Channel.programme and programmesByDay, layout derivation, OverlapAck.
- `PLAN.md`: D27 to D37 appended; Phase 4 exit check now reads D01 to D37.
- `PRD.md` (local): stories 1, 2, 30, 32; key behaviours on channels; Further Notes.

## Checks run
No package manifest exists yet; there are no lint, type or test scripts to run. Verification was static.

## Noticed, not touched
- `docs/01-goals.md` demo path step 1 still says "create the household and two kids"; with D35 the household is implicit. Wording only; the criteria are unchanged.
- `docs/06-screen-specs.md` §S15 lists a household name field and "Load demo household"; both already match D35 and needed no edit.

## Re-evaluate
Run ux-design-eval again in code mode on the first milestone that ships S03, S05 and S06, at 375px, walking J1 and J3 with the on-screen keyboard open on the time fields (U2, U8).
