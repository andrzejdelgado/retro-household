# 04 — User journeys

Date: 2026-09-28. Inputs: `docs/02-personas.md`, `docs/03-insights.md`, `docs/01-goals.md`, `docs/05-domain-model.md`. Screens are named S01 to S16 (parent app) and T01 to T05 (TV app) and specified in `docs/06-screen-specs.md`. Warning codes are in the domain model. The demo household is Ilona and Andrzej with Selena (1) and Simona (4), from P2.

## J1 — First run to first kid
Persona P2. Criteria C1.2, C1.4.

| Step | Screen | User | System |
|---|---|---|---|
| 0 | S18 Passcode | Opens the app for the first time, chooses a parent passcode and repeats it | Stores the passcode, opens S03 (D40) |
| 1 | S03 Add kid | Arrives from S18 | Shows the product name, one sentence of purpose and "Add your first child". No tab bar, no back |
| 2 | S03 | Enters Simona, birthdate and a colour; leaves the PIN empty | Derives bracket 4-5, shows it live under the birthdate |
| 3 | S03 | Saves | Creates the Household named "Home" with all nine major rules enabled and default Wi-Fi windows, then Simona |
| 4 | S05 Kid | Lands on Simona's page | Routine, allowances and an empty channel list are prefilled from the 4-5 content rows. The budget bar reads 0 of 30 min today. A dismissable line reads "Set up from recommended practice for age 4. Change anything." |

## J2 — Add the second kid
Persona P2. Criteria C1.2, C5.4.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S03 | Taps "Save and add another" after Simona, or add kid on S04 Home | An empty S03 |
| 2 | S03 Add kid | Enters Selena, birthdate, PIN, colour | Bracket 1-2, budget 0 |
| 3 | S05 Kid | Lands on Selena's page | Routine prefilled from the 1-2 rhythm. Screen time shows every technology closed with the age it opens. Channels section says none and explains a 1-year-old has no screen budget, with the add action still available |

## J3 — Build a routine from defaults and print
Persona P2. Criteria C1.1, C2.1, C2.5, C3.1, C3.3.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S05 Kid | Opens Simona's routine | |
| 2 | S06 Routine | Sees the weekday timeline prefilled: wake, school (away), free play, chores, dinner, outside, wind-down | Blocks carry the practice's icon; tapping one shows its why (C2.5) |
| 3 | S06 | Sets the school block's end to 17:00 because of the class | Free play's start ripples to 17:00 and it shrinks; the screen block moves after 17:00 and raises W06 after-dinner if it now ends past dinner, with the fix "shorten to end at dinner" |
| 4 | S06 | Applies the fix | Window shortened, warning gone |
| 5 | S07 Practices | Adds "Boredom rule, 15 min" from the library to the afternoon | A block appears with the practice's title and why |
| 6 | S14 Print | Taps print, chooses weekday | Print preview shows one page: name, day, timeline. Prints via the browser |

## J4 — Split the week and clone a day
Persona P2. Criterion C3.4.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S06 Routine | Opens the day switcher, chooses "Split weekdays" | Weekday becomes five DayTypes mon to fri, each a copy of the old weekday |
| 2 | S06 | Edits Friday: school ends 16:00, no class | Only Friday changes |
| 3 | S06 | On Monday chooses "Copy to…" and ticks tue, wed, thu | Tue, Wed and Thu now point at Monday's day type and the three orphaned day types are deleted. The day switcher shows one tab "Mon · Tue · Wed · Thu" |
| 4 | S14 Print | Prints | One page per day type: "Mon · Tue · Wed · Thu", Fri, Weekend |

## J5 — Set an allowance past the cap
Persona P2. Criteria C2.2, C2.3, C2.4, C5.3.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S08 Screen time | Sees long-form 30 min a day (from the schedule), games closed until 6, school apps closed until 6, and the closed list | Budget bar: today 30 of 30, week 120 of 120 |
| 2 | S10 Channel | Opens Simona's channel from the link on the long-form row and extends its window to 45 min | W01 daily-cap appears under the field: "Simona would have 45 minutes a day. The recommended ceiling at 4 is 30." Fixes: shorten to 30. The budget bar turns to the over state |
| 3 | S10 | Dismisses the warning | The warning collapses; the bar still shows 45 of 30 |
| 4 | S10 | Saves | Saved. Nothing blocked |
| 5 | S15 Settings | Turns on "Hide all warnings" | Every warning hidden; budget bars keep their numbers |

## J6 — Channels and a programme
Persona P2. Criteria C4.2, C5.4.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S09 Channels | On Simona, adds a channel "Stories" with an icon; S09 first asks for Simona's PIN since she has none | Window defaults from Simona's screen slot: days mon, wed, fri, sun (4-5 bracket: max 4 days, never two in a row), 17:00 to 17:30 after the class fix |
| 2 | S12 Library | Adds four video files in the add dialog, sets category Stories and ages 3 to 6 | Duration and a poster frame read on import; the grid shows category and age range (D43) |
| 3 | S10 Channel | Builds the programme by adding two shows | Layout preview: 17:00 show A (12 min), 17:12 show B (15 min), 17:27 off-air. A third show of 20 min is refused with W10 and the fix "remove" or "extend window" |
| 4 | S10 | Leaves "Vary by day" off | The same programme plays on mon, wed, fri and sun |
| 5 | S09 | On Selena, adds a channel "Shichida" | W05 not-yet-open: "Selena is 1. The recommended screen time under 3 is none. Anything scheduled here counts as overage from the first minute." Fixes: remove; keep. Ilona keeps it |
| 6 | S10 | Sets a 15-minute window at 10:00 on weekdays and one show | W01 daily-cap and W02 weekly-cap follow, dismissible |

## J7 — Resolve the TV overlap
Persona P2 and P3. Criterion C5.5.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S11 TV timeline | Opens the timeline for Monday | Lanes per kid. Selena 10:00 to 10:15, Simona 17:00 to 17:30. No overlap |
| 2 | S11 | Loads the three-kid seed household from Settings, returns | Henry (4) 16:30 to 17:00, Ella (7) 16:30 to 17:30 overlap. W09 with three fixes: stagger Ella to 17:00 to 18:00; move Henry to 15:30 (refused, W08 routine-clash, pick-up at 16:00, shown greyed with the reason); mark together |
| 3 | S11 | Picks stagger | Ella 17:00 to 18:00 raises W06 after-dinner. Fix: shorten to 17:30 |
| 4 | S11 | Applies | Timeline clean |

## J8 — Rules and Wi-Fi, print
Persona P2. Criteria C3.2, C2.5.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S13 Rules | Sees nine rules on, each with its why | |
| 2 | S13 | Turns one off, adds a custom rule "Shoes off at the door" | |
| 3 | S13 | Edits Wi-Fi off windows: 17:00 to 19:30 weekdays, 22:00 to 06:30 every day | |
| 4 | S14 Print | Prints the rules page | One page: rules, Wi-Fi off hours, TV hours per kid |

## J9 — A kid watches TV
Persona P2, Simona at 17:08 on a Monday. Criteria C4.1, C4.3, C4.4, C4.6, C4.7.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | T01 PIN | Simona or Ilona enters the PIN | Wrong PIN clears calmly. Right PIN opens the picker |
| 2 | T02 Picker | Sees one lit tile "Stories" showing show A's poster and any other channels dimmed and marked off | |
| 3 | T03 Playback | Selects it | Show A plays from 08:00 in, since it started at 17:00. No progress bar |
| 4 | T03 | Waits | At 17:12 show B starts. At 17:27 off-air |
| 5 | T04 Off-air | | Calm wordless animation, no sound, no time shown |
| 6 | T01 | Presses Escape | Back to PIN |
| 7 | T02 | Tries on Tuesday | The tile is dimmed and marked off. Selecting it shows T04 |

## J10 — Co-watch
Persona P2. Criteria C4.5, C5.4.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | T03 Playback | Ilona presses Cmd+K while Simona watches | Picture dims. T05 overlay lists Selena with a switch |
| 2 | T05 | Turns Selena on, closes | From now, each second is logged for Simona and Selena, Selena's entry marked coWatch |
| 3 | S05 Kid | Later opens Selena's page | Budget bar shows overage; W12 informational in the log section |

## J11 — A birthday passes
Persona P2. Criterion C6.1.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S15 Settings | Sets the demo clock to the day after Simona turns 5 | |
| 2 | S05 Kid | Opens Simona | Bracket 5-6. Cap 45 a day, 240 a week, 5 days. Games row now open at 6 shows "opens in a year". Channel days set (mon, wed, fri, sun) still valid, no warning. Routine bedtime moves to 19:30 only if the block was still the default; edited blocks are kept |

## J12 — Load the demo household
Criterion C1.3 and demo support.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S15 Settings | Taps "Load demo household" | Asks to confirm replacing current data. Seeds Miranda and John's household (P3) with three kids, channels, a library of short clips, rules |
| 2 | S04 Home | | Three kid cards with budgets and a warning count |

## J13 — Warnings list and lock
Criteria C2.2, C2.4.

| Step | Screen | User | System |
|---|---|---|---|
| 1 | S04 Home | Sees the bell with "3" on it, taps it | |
| 2 | S17 Warnings | Reads three cards grouped under Selena and Simona, applies one fix, dismisses one | The count drops to 1; the dismissed warning stays hidden across reload |
| 3 | S20 Household channels | Opens the TV tab, Channels view, All | Sees Simona's "Stories" on air with the current show and Selena's "Shichida" off air until tomorrow 10:00 |
| 4 | S15 Settings | Taps "Lock now" | S18 in enter mode; the TV app is unaffected |
| 5 | S18 | Taps "Forgot the passcode?" | S19 explains the reset and offers Back |

## Journey to screen coverage

| Screen | Journeys |
|---|---|
| S01 | removed (D35) |
| S03 | J1, J2 |
| S04 | J2, J12 |
| S05 | J1, J2, J3, J10, J11 |
| S06 | J3, J4 |
| S07 | J3 |
| S08 | J5 |
| S09 | J6 |
| S10 | J5, J6 |
| S11 | J7 |
| S12 | J6 |
| S13 | J8 |
| S14 | J3, J4, J8 |
| S15 | J5, J11, J12 |
| S16 | reached from S13 and S07 |
| S17 | J13 |
| S18 | J1, J13 |
| S19 | J13 |
| S20 | J13 |
| T01 to T05 | J9, J10 |

Every journey step points at a screen. Every screen appears in at least one journey.
