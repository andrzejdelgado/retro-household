# 01 — Goals and success criteria

Date: 2026-09-28. Inputs: `PLAN.md` (decisions D01 to D26), the five practice files, `docs/log/00-discovery.md`.

Every goal below has at least one criterion that can be checked in the v1 demo on one computer. Criteria are numbered so screen specs, tests and the dev plan can point at them. "Checked by" names the method: a timed run, a checklist walk, a unit test, a print preview, or a device-mode check in the browser.

## Goals

### G1 — A parent sets up a whole household in one sitting, unaided
Kids, routines, rules, Wi-Fi hours and TV schedules, from an empty app to a printed page, with no manual and no dead ends.

| ID | Criterion | Checked by |
|---|---|---|
| C1.1 | From an empty app, a parent with two kids (ages 3 and 6) reaches a printed weekday routine for both in under 10 minutes without reading any help text. | Timed demo run |
| C1.2 | Every screen reached during setup shows one clear next action. No screen is a dead end. | Checklist walk of every setup screen |
| C1.3 | Closing the browser mid-setup and reopening loses nothing. | Reload at each setup step |
| C1.4 | Every list that can be empty has an empty state that says what to do next. | Checklist walk |

### G2 — Best practice is the default; deviation is informed, never blocked
The practice files are the starting point for every value. A parent can change anything, sees what the change means, and is never stopped.

| ID | Criterion | Checked by |
|---|---|---|
| C2.1 | Every default shown for a child equals the practice files' value for that child's bracket, for all eight one-year brackets and every table in the five files. | Unit tests over the content model |
| C2.2 | Every warning carries at least one proposed fix that applies with one action. | Audit of the warning catalogue against the screen specs |
| C2.3 | No warning prevents saving. | Unit test per warning type |
| C2.4 | Dismissing one warning hides only that warning. The global switch in Settings hides all. Both persist across reload. | Unit test and reload check |
| C2.5 | Every default practice shows a one-line why on demand, and the Sources page lists every source in the practice files. | Checklist walk |

### G3 — Printed routines and rules that work on a fridge
The paper is the child-facing artefact for the parent app. It has to be readable at arm's length and fit one page.

| ID | Criterion | Checked by |
|---|---|---|
| C3.1 | Each kid's day type prints on exactly one page in the demo browser's print preview, portrait, A4 and Letter. | Print preview |
| C3.2 | The household rules page prints on one page and includes the major rules, Wi-Fi hours and every kid's TV hours. | Print preview |
| C3.3 | No printed text is smaller than 12pt. Nothing from the screen UI (buttons, navigation, warnings) appears on paper. | Print preview and print stylesheet review |
| C3.4 | Splitting a kid's week into Monday to Sunday and cloning a day produces one printed page per distinct day. | Demo run |

### G4 — The TV behaves like broadcast television and is calm when off
Shows run on the clock. Nothing waits for the child. Outside the schedule there is nothing to look at and nothing to wait for.

| ID | Criterion | Checked by |
|---|---|---|
| C4.1 | Tuning into a channel N minutes after a show started plays the show from minute N. | Unit test with a mocked clock |
| C4.2 | The scheduler never places a show that would be cut by the channel's end time. | Unit test |
| C4.3 | Outside the channel window, and once a kid's daily or weekly budget is spent, the TV shows the off-air screen: a calm animation, no countdown, no time of return, no sound. | Checklist walk with a mocked clock |
| C4.4 | On the channel picker, an off-air channel's tile is visibly dimmed and labelled off. | Visual check |
| C4.5 | Cmd+K dims the picture and opens the co-watch overlay. Every kid selected there has watched minutes deducted from that moment on. | Unit test on the viewing log |
| C4.6 | A wrong PIN clears the input with calm feedback. Nothing else changes. | Demo run |
| C4.7 | Arrows, Enter and Escape are enough to reach every TV screen. | Checklist walk with keyboard only |

### G5 — Screen time per child is always visible and always right
The accumulator is the product's spine. It has to be correct across brackets, day types, technologies and co-watching, and visible wherever it can change.

| ID | Criterion | Checked by |
|---|---|---|
| C5.1 | A child's planned total equals the sum of their manual allowances plus their scheduled TV minutes, per day and per week, for every day type. | Unit tests |
| C5.2 | The weekly cap wins: a warning appears when the weekly cap is exceeded even if every day is under the daily cap. Days-per-week and "never two days in a row" for 3 to 5 also warn. | Unit tests |
| C5.3 | The total against the cap is visible on every screen where an allowance, channel or schedule is edited, without scrolling away from the field being edited. | Checklist walk on mobile width |
| C5.4 | For a child under 3 the total and cap read zero, and creating a channel for them raises a warning but is possible. | Demo run |
| C5.5 | The household TV timeline shows every kid's windows on one track, flags overlaps, and proposes a fix for each: push the later kid after the earlier window, move a younger kid an hour earlier when the routine allows, or mark a together slot. | Demo run with two kids and with three kids |

### G6 — The household survives time
Birthdays and edits propagate without the parent doing anything.

| ID | Criterion | Checked by |
|---|---|---|
| C6.1 | Advancing the date past a child's birthday changes their bracket, defaults, caps and warnings with no parent action. | Unit test with a mocked date |
| C6.2 | Editing a routine, schedule or rule re-evaluates TV conflicts and warnings at once. | Unit test |

### G7 — Clean, uncluttered, sleek, mobile-first
The parent app is designed for a phone first and works on a desktop. It is built from shadcn/ui components used as intended.

| ID | Criterion | Checked by |
|---|---|---|
| C7.1 | Every parent screen works at 375px wide and at desktop width with no horizontal scroll and no overlapping elements. | Device-mode check in the browser |
| C7.2 | Every interactive element is a shadcn/ui component, or a customisation logged with its UX reason in the design system document. | Audit against `docs/07-design-system.md` |
| C7.3 | Touch targets are at least 44px on mobile. Text contrast meets WCAG AA. | Accessibility audit |
| C7.4 | No screen shows more than one primary action. | Checklist walk |

### G8 — The method is reusable
This goal belongs to the project, not the product.

| ID | Criterion | Checked by |
|---|---|---|
| C8.1 | `process/` contains no project-specific terms. | Search |
| C8.2 | Every phase that ran has a playbook in `process/` and a record in `docs/log/`. | File listing |

## Non-goals for v1

- Accounts, sign-in, OAuth.
- Sync between devices, home server, any database outside the browser.
- Wi-Fi enforcement. Wi-Fi hours are documented and printed, not applied.
- Counting console or school-app time automatically. These are manual allowances.
- A native TV app, Electron or Tauri packaging.
- The phone box, landline handset and call redirection.
- Tracking real-life routine adherence. Paper on the fridge is the tool.
- Any kid-facing surface other than the TV app.
- Children over 8.
- Languages other than English.

## Demo path

The demo on one computer follows this path. Each step names the criteria it exercises.

1. Open the empty app, create the household and two kids with birthdates and PINs. (C1.2, C1.4)
2. Accept default routines for both, print the weekday page for each. (C1.1, C2.1, C3.1)
3. Change one allowance past the cap, see the warning and its fix, dismiss it, save anyway. (C2.2, C2.3, C2.4, C5.3)
4. Set up channels for both kids, see the overlap on the TV timeline, apply the proposed split. (C5.5)
5. Add video files to the library, build one channel's programme. (C4.2)
6. Set household rules and Wi-Fi hours, print the rules page. (C3.2)
7. Open the TV app, enter a PIN, tune in mid-show, then tune in outside the window. (C4.1, C4.3, C4.4, C4.6, C4.7)
8. Press Cmd+K, add the sibling as co-watcher, check both viewing logs. (C4.5)
9. Advance the mocked date past a birthday, show the bracket change. (C6.1)
10. Switch to mobile width in device mode and repeat steps 1 to 4. (C7.1, C7.3)
