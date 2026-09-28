# UX Eval — Retro Household: first run to first printed routine (build)

**Verdict:** clear — a first-time parent finishes both journeys on a phone without help; the two defects below are small.

**Scope:** J1 (`/passcode` → `/kids/new` → `/kids/[id]`) and J3 (`/kids/[id]/routine`, `/kids/[id]/routine/practices`).
**Inputs used:** intent docs (`PLAN.md` D01 to D47, `docs/01-goals.md` to `docs/07-design-system.md`, the specs eval and fixup), source under `src/`, the running app at 375px with the browser database cleared for a true first run.
**Date:** 2026-09-28
**Stance:** first-time parent, on a phone, in a hurry (D07).

## Summary

Walked both journeys as a new user after clearing the browser database, then read the source for every branch on the way. The flow matches the specs after the docs-only fixup: no welcome screen, the passcode in set mode, the first child on one card, defaults announced on landing, the block editor refusing with a reason. The biggest takeaway is that the unhappy paths hold: a mismatched passcode, a refused bedtime push, and Escape out of every drawer all behave. Two things a first-timer hits: a future birthdate is accepted as "age 0", and the back gesture after the first save shows a page with its title twice.

**Top 3**
1. Medium · ERROR-OPAQUE — a birthdate in the future is accepted and reads "Simona is 0 · bracket 0 to 1".
2. Low · INCONSISTENT — `/kids/new` after the first kid shows "Add a child" in the top bar and again as the card title.
3. Low · SILENT-ACTION — the block editor's refusal is plain text between the fields and Save; it is correct but easy to miss on a small screen.

## Intent sheet (condensed)

Same as `docs/ux-eval/2026-09-28-specs-eval.md` with D27 to D47 applied. Rules checked here: R1 one primary action, R2 warnings inline, R3 empty states carry the action, R5 defaults carry a why, R6 375px without horizontal scroll, R7 native time entry; must-nots M1 (no gamification) and M3 (nothing from the UI on paper); D31 PIN optional, D34 save and add another, D35 no welcome screen, D36 first-run S03 without chrome, D45 swallowed blocks removed with undo.

## The flow, as mapped

1. **Entry:** `/` redirects to `/passcode` when no household exists (`parent-chrome.tsx`).
2. **Passcode, set mode:** "Choose a parent passcode", four to six digits, Continue enables at four; "Repeat it"; a mismatch clears and says "The two entries differ. Try again."; a match creates the household and lands on `/kids/new`.
3. **Add your first child:** product name and purpose above one card; name, birthdate with the live bracket line, six colour swatches, optional PIN; Save, or Save and add another. No tab bar, no back.
4. **Kid overview:** header with age, bracket and PIN state; the first-visit note; four section cards; the budget bar.
5. **Routine:** day switcher, timeline, block drawer with start, end, title, note; Save applies the ripple; a refused change shows its reason inline.
6. **Practices:** domain tabs, selection tiles, "Add (n selected)", back to the routine.
- **Branches:** future birthdate (accepted, U1); browser back after the first save (returns to `/kids/new` with chrome, U2); Escape closes every drawer to the screen underneath; reload keeps saved data.
- **Exits:** the kid overview, the routine with the new block.

## Intent alignment

| Rule | Status | Pointer |
| --- | --- | --- |
| R1 one primary action | honoured | one `variant="default"` button per screen in scope |
| R2 warnings inline, never toast | honoured | `warning-card.tsx`, no `sonner` in the tree |
| R3 empty states carry the action | honoured | `home-screen.tsx` empty card, `routine-screen.tsx` gap rows |
| R5 defaults carry a why | honoured | `kid-overview.tsx` first-visit line; `block-editor.tsx` why line |
| R6 375px, no horizontal scroll | honoured | walked; `scrollWidth` equals `clientWidth` on every screen in scope |
| R7 native time entry | honoured | `block-editor.tsx` `type="time" step={900}` |
| M1 no gamification | honoured | no stars, streaks or badges in scope |
| D31 PIN optional | honoured | `kid-form.tsx` `pinOk` allows empty |
| D34 save and add another | honoured | `kid-form.tsx` secondary button |
| D35 no welcome screen | honoured | `/passcode` set mode then `/kids/new` |
| D36 first-run S03 without chrome | honoured | `parent-chrome.tsx` `firstRun`; `app-shell.tsx` top bar returns null |
| D45 swallowed blocks removed with undo | honoured | `routine-screen.tsx` "Removed: … Undo" |
| S03 states: invalid date | broken for a future date | → U1 |
| S03 entry after the first kid | honoured, heading duplicated | → U2 |

## Findings

| ID | Severity | Check | Title | Where |
| --- | --- | --- | --- | --- |
| U1 | Medium | ERROR-OPAQUE | A future birthdate is accepted as age 0 | `src/components/kid-form.tsx` `validDate` |
| U2 | Low | INCONSISTENT | "Add a child" appears twice on `/kids/new` after the first kid | `src/components/kid-form.tsx` card title; `src/app/(parent)/kids/new/page.tsx` top bar |
| U3 | Low | SILENT-ACTION | The refusal in the block editor is easy to miss | `src/components/routine/block-editor.tsx` `refused` paragraph |

## Detailed findings

### U1 · Medium · ERROR-OPAQUE · A future birthdate is accepted as age 0
**Where:** `src/components/kid-form.tsx`, `validDate` checks only the format and parseability.
**Ref:** Nielsen #5 error prevention; §S03 states "Invalid date … keeps Save disabled with the reason".
**Impact:** a parent who mistypes the year (2030 for 2020) gets "Simona is 0 · bracket 0 to 1", saves, and every default is wrong with no hint why.
**Evidence:** typed 2030-01-01 at 375px; the live line read "Simona is 0 · bracket 0 to 1" and Save stayed enabled.
**Fix:** treat a birthdate after today as invalid with the line "That is in the future." under the field. **Effort:** S

### U2 · Low · INCONSISTENT · "Add a child" twice
**Where:** `src/components/kid-form.tsx` card title; `src/app/(parent)/kids/new/page.tsx` `<TopBar title="Add a child" />`.
**Ref:** Nielsen #8.
**Impact:** after the first kid the top bar and the card both say "Add a child"; the page reads as if something repeated.
**Evidence:** browser back from the first kid's page; page text "Add a child / Add a child / Name".
**Fix:** drop the card title when the top bar is shown, keeping "Add your first child" on first run. **Effort:** S

### U3 · Low · SILENT-ACTION · The refusal is easy to miss
**Where:** `src/components/routine/block-editor.tsx`, the `refused` paragraph between the note and Save.
**Ref:** Nielsen #9; §1 timeline "refused inline with the reason".
**Impact:** after tapping Save nothing seems to happen unless the parent reads the small paragraph above the button.
**Evidence:** set Dinner's end to 19:15; the drawer showed "This would push bedtime past 19:00. Shorten something first." in body text.
**Fix:** render the refusal as the warning card style, with the warning edge, so it reads as the app's answer. **Effort:** S

## What is good

- The passcode mismatch clears and says exactly what happened (`passcode-screen.tsx` "The two entries differ. Try again.").
- The live bracket line updates as the birthdate is typed and names the child (`kid-form.tsx`).
- A refused ripple names the reason and the time it would break (`routine.ts` editBlock).
- Escape closes every drawer to the screen underneath, and Tab reaches the practices switch with a visible ring.
- The first-run page has no chrome and one card, as D35 and D36 ask.

## Checked and fine

- **Forms:** persistent labels, native date and time inputs, `inputMode="numeric"` on the PIN, Save names the outcome.
- **Feedback:** landing on the kid overview shows the defaults and the first-visit note; the budget bar updates at once.
- **Effort:** two required fields to the first value.
- **Mobile reach:** 44px targets, the primary action in the thumb zone, no horizontal scroll.
- **Reduced motion:** the off-air animation and the PIN shake are static under the media query.

## Prioritised next steps

**Fix first**
1. U1 — reject future birthdates with a reason.
2. U2 — one heading on `/kids/new`.

**Eventually**
- U3 — refusal in the warning card style.

## Coverage

Walked at 375px in the built-in browser with the database cleared; keyboard events dispatched in the page where the automation's keystrokes did not reach the unfocused document. The accessibility tree tool does not compute names from button contents, so icon-and-text buttons showed unnamed there; native screen readers do compute them, and this was not counted as a finding. Outside the UX remit: none observed.

## Suggested next pass

The channel editor at 375px with the on-screen keyboard open on the time fields (J6), and the print dialog for a split week (J4).
