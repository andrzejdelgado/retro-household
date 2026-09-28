# 05 — Domain model

Date: 2026-09-28. Inputs: `PLAN.md` decisions, `docs/01-goals.md`, `docs/03-insights.md`, the five practice files. This is the vocabulary every screen spec, test and milestone uses. Field types are informal. Times are `HH:mm` in 24-hour form. Dates are ISO `YYYY-MM-DD`. Weeks start on Monday. Weekdays are `mon tue wed thu fri sat sun`.

## 1. Stored entities

All stored entities live in the browser's IndexedDB behind one storage interface (D05). Every entity has `id` and `updatedAt`.

### Household

| Field                  | Type             | Notes                                                                                                                                        |
| ---------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| name                   | string           | Defaults to "Home" (D35); edited in Settings; shown on printed pages                                                                         |
| rules                  | HouseholdRule[]  | See below                                                                                                                                    |
| wifiOffWindows         | Window[]         | Household-level. Windows in which Wi-Fi is off                                                                                               |
| settings.warningsMuted | boolean          | Global dismissal (D14)                                                                                                                       |
| settings.demoClock     | datetime or null | Demo-only override of "now" (C4.1, C6.1)                                                                                                     |
| passcode               | 4 to 6 digits    | Opens the parent app once per browser session (D40). Stored as plain text; no security claim in v1. Forgetting it means resetting everything |

### Kid

| Field      | Type                       | Notes                                                                                                                    |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| name       | string                     |                                                                                                                          |
| birthdate  | date                       | Bracket is derived from it, never stored (D08)                                                                           |
| pin        | 4 digits or null           | TV app entry (D09). Optional until the kid's first channel is added (D31). Stored as plain text; no security claim in v1 |
| colour     | token                      | One of a fixed set; used for the kid's lane on the timeline and their channel tiles                                      |
| week       | Record<Weekday, DayTypeId> | Which day type each weekday uses. Default: mon to fri → weekday, sat and sun → weekend (D12)                             |
| dayTypes   | DayType[]                  |                                                                                                                          |
| allowances | Allowance[]                | One per technology that has a budget                                                                                     |
| channels   | Channel[]                  | At most 4 (D11)                                                                                                          |

### DayType (per kid)

| Field  | Type           | Notes                                                 |
| ------ | -------------- | ----------------------------------------------------- |
| label  | string         | "Weekday", "Weekend", or a weekday name after a split |
| blocks | RoutineBlock[] | Ordered by start                                      |

Splitting a week means creating a new DayType for one weekday, as a copy of the one it had, and pointing `week[weekday]` at it. Copying a day onto other weekdays means pointing those weekdays at the source DayType, so days that are the same are one object edited in one place (D29). A DayType no weekday points at is deleted.

### RoutineBlock

| Field      | Type                                                                                                    | Notes                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| start, end | time                                                                                                    |                                                                |
| title      | string                                                                                                  |                                                                |
| practiceId | PracticeId or null                                                                                      | Set when picked from the library; null for a custom block      |
| kind       | `care` `outdoors` `play` `reading` `chores` `independence` `emotional` `family` `screen` `sleep` `away` | Drives the printed icon. `away` marks daycare, school, a class |
| note       | string                                                                                                  | Optional, printed small                                        |

The block with `kind = screen` is the kid's screen slot. TV channel windows default from it (D17). There is at most one per DayType.

### Allowance (per kid)

| Field         | Type                            | Notes                                                                                                            |
| ------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| tech          | `longform` `games` `schoolApps` | Only technologies that count towards the budget (D13). Audio and video calls do not count and are not allowances |
| minutesPerDay | number                          | Prefilled from the bracket's tech stage row                                                                      |
| daysPerWeek   | number                          | Prefilled                                                                                                        |
| source        | `manual` `device`               | `device` is reserved for the future console counting (D25). Always `manual` in v1                                |

Long-form TV is special: its planned minutes come from the channel schedules, not from this record. The `longform` allowance only holds the parent's chosen ceiling for display; the accumulator uses the schedule.

### Channel (per kid)

| Field           | Type                              | Notes                                                                                                           |
| --------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| name            | string                            | Short; a child may not read it                                                                                  |
| icon            | token                             | One of a small fixed set of simple glyphs, chosen by the parent                                                 |
| windows         | Window[]                          | When the channel is on air. Usually one                                                                         |
| programme       | ShowId[]                          | The ordered playlist that plays on every day of the window. Laid out from the window start using show durations |
| programmesByDay | Record<Weekday, ShowId[]> or null | Set only when the parent turns on "Vary by day" (D30); then it replaces `programme` for the days it lists       |

### Window

| Field      | Type      | Notes                         |
| ---------- | --------- | ----------------------------- |
| days       | Weekday[] |                               |
| start, end | time      | `end` after `start`, same day |

### Show (household library)

| Field       | Type                                                           | Notes                                                                                           |
| ----------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| title       | string                                                         | From the file name, editable                                                                    |
| durationSec | number                                                         | Read from the file's metadata on import                                                         |
| fileKey     | blob key                                                       | The video blob in IndexedDB (D18)                                                               |
| posterKey   | blob key                                                       | A frame captured on import, used on channel tiles                                               |
| category    | `stories` `films` `nature` `music` `learning` `family` `other` | Fixed list, chosen on import (D43)                                                              |
| brackets    | Bracket range                                                  | The one-year brackets the video suits, set with the range picker (D43). A filter, never a block |

### ViewingLog (per kid)

| Field             | Type     | Notes                                                                        |
| ----------------- | -------- | ---------------------------------------------------------------------------- |
| kidId             | KidId    | The kid whose budget this entry consumes                                     |
| date              | date     |                                                                              |
| channelId, showId | ids      |                                                                              |
| startedAt         | datetime |                                                                              |
| seconds           | number   | Accumulated while playing                                                    |
| coWatch           | boolean  | True when this kid was added through the co-watch overlay rather than by PIN |

### OverlapAck (household)

| Field      | Type      | Notes |
| ---------- | --------- | ----- |
| kidIds     | KidId[]   |       |
| days       | Weekday[] |       |
| start, end | time      |       |

An acknowledged overlap is a "together slot" (D17). The timeline stops flagging it. Budgets are unaffected because each kid's own channel minutes already count. When the TV app starts playing inside an acknowledged overlap it opens the co-watch overlay once with the other acknowledged kids switched on (T05, D33).

### Dismissal (household)

| Field      | Type   | Notes                                                             |
| ---------- | ------ | ----------------------------------------------------------------- |
| warningKey | string | `code:subject` so one dismissal covers one warning on one subject |

## 2. Content model (static, shipped with the app)

Derived from the five markdown files, which stay untouched (D24). Every content row keeps a `source` pointing at file and section.

### Bracket

Eight values: `0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8`. A kid's bracket is `floor(ageInYears)` on the current date, using the demo clock when set. A kid who turns 8 leaves scope; the app shows them as `7-8` with a note and no further changes.

### Cap (per bracket, from the total screen budget table)

| Bracket       | minutesPerDay | minutesPerWeek | maxDaysPerWeek | noConsecutiveDays                           |
| ------------- | ------------- | -------------- | -------------- | ------------------------------------------- |
| 0-1, 1-2, 2-3 | 0             | 0              | 0              | —                                           |
| 3-4, 4-5      | 30            | 120            | 4              | true (long-form, "never two days in a row") |
| 5-6, 6-7      | 45            | 240            | 5              | false                                       |
| 7-8           | 60            | 300            | 6              | false                                       |

### TechStage (per technology, per bracket)

Each row from `household-tech-access-stages.md` expanded to one-year brackets: `tech`, `bracket`, `depth` text, `minutesPerDay`, `sessionsPerWeek` or `daysPerWeek`, `perSessionMax`, `why`, `source`. Technologies with zero access at every bracket under 8 (short-form video, tablets, browsing, voice assistants, AI, connected toys, smartwatches, messaging, social media) are kept as rows so the Screen time screen can list them as closed, with the age they open.

### Practice (from `household-routine-elements.md`)

`id`, `domain` (the seven categories), `brackets` (the one-year brackets it applies to), `title`, `detail`, `duration` text, `why` (one line, written per practice from the file's own framing), `source`.

### RhythmTemplate (from `household-rhythms.md`)

Per bracket, per day type: the default `RoutineBlock[]`. Infants (0-1) get the outdoor row only.

### MajorRule (from `household-major-rules.md`)

`id`, `title`, `detail`, `source`. Nine rows.

### HouseholdRule (stored, per household)

`ruleId` or `customText`, `enabled`. Defaults: all nine enabled.

### Source

`id`, `title`, `url`, `usedBy` (file names). The union of the source lists in the practice files.

## 3. Derived values (never stored)

| Value                          | From                                        | Rule                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bracket(kid)                   | birthdate, now                              | See Bracket                                                                                                                                                                        |
| cap(kid)                       | bracket                                     | Cap table                                                                                                                                                                          |
| screenSlot(kid, weekday)       | week, dayTypes                              | The `screen` block of that weekday's DayType, or null                                                                                                                              |
| scheduledMinutes(kid, weekday) | channels                                    | Sum of show durations laid out inside each window on that weekday, across the kid's channels                                                                                       |
| plannedMinutes(kid, weekday)   | allowances, scheduledMinutes                | scheduledMinutes + sum of `games` and `schoolApps` minutesPerDay on days those apply                                                                                               |
| plannedWeek(kid)               | plannedMinutes over mon..sun                | Total, days with any minutes, and consecutive-day pairs                                                                                                                            |
| layout(channel, weekday)       | window, programme or programmesByDay, shows | Shows placed back to back from window start. A show that would end after the window end is not placed and is flagged (W10). Remaining time is off-air                              |
| nowPlaying(channel, now)       | layout, now                                 | The show whose placed interval contains `now`, and the offset into it (C4.1). Null means off-air                                                                                   |
| budgetLeft(kid, date)          | cap, viewingLog                             | Daily: cap.minutesPerDay minus logged minutes today. Weekly: cap.minutesPerWeek minus logged minutes since Monday. The TV is off for the kid when either is at or below zero (D15), and only when the cap is above zero (D46) |
| warnings(household)            | everything above                            | See the catalogue                                                                                                                                                                  |
| dayTypeFor(kid, weekday)       | week                                        |                                                                                                                                                                                    |

## 4. Warning catalogue

Warnings are derived on every change. Each has a `code`, a `subject`, a message written as a consequence for the child, and one or more fixes that apply in one action (C2.2). None blocks saving (C2.3). A Dismissal or the global mute hides a warning without removing it from the derivation, so the accumulator still shows the numbers.

| Code                  | Subject              | Trigger                                                                                                           | Fixes                                                                                                                                          |
| --------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| W01 daily-cap         | kid, weekday         | plannedMinutes > cap.minutesPerDay                                                                                | Shorten the window to fit; remove the last show of the day; reduce the manual allowance to fit                                                 |
| W02 weekly-cap        | kid                  | plannedWeek total > cap.minutesPerWeek                                                                            | Take one day off the channel; shorten every window proportionally                                                                              |
| W03 too-many-days     | kid                  | Days with minutes > cap.maxDaysPerWeek                                                                            | Turn off the day with the fewest minutes; propose a day set that fits                                                                          |
| W04 consecutive-days  | kid                  | Bracket has noConsecutiveDays and two adjacent days have long-form minutes                                        | Propose mon, wed, fri, sun; turn off one of the pair                                                                                           |
| W05 not-yet-open      | kid, tech or channel | Any planned minutes for a tech whose stage says no access at the bracket, including any channel for a kid under 3 | Remove the channel or allowance; keep it (acknowledge)                                                                                         |
| W06 after-dinner      | kid, window          | Window ends after the DayType's dinner block starts, or after 18:00 when no dinner block exists                   | Move the window earlier to end at dinner; shorten it                                                                                           |
| W07 past-bedtime      | kid, window          | Window overlaps or follows the DayType's sleep block                                                              | Move earlier; shorten                                                                                                                          |
| W08 routine-clash     | kid, window          | Window overlaps an `away` block (daycare, school, class)                                                          | Move the window to start when the block ends; move it before the block if there is room                                                        |
| W09 tv-overlap        | kids, weekday        | Two kids' windows overlap on the same weekday and no OverlapAck covers it                                         | Stagger: push the older kid's window to start when the younger's ends; move the younger kid one hour earlier when W08 allows; mark as together |
| W10 show-does-not-fit | channel, weekday     | A show in the programme cannot be placed before the window end                                                    | Remove the show; extend the window (which may raise W01, W06, W07)                                                                             |
| W11 window-empty      | channel, weekday     | Window exists on a weekday with no shows                                                                          | Copy another day's programme; remove the day from the window                                                                                   |
| W12 co-watch-overage  | kid, date            | A ViewingLog entry pushed the kid past the daily or weekly cap                                                    | None. Informational, shown in the parent app only                                                                                              |

## 5. Invariants

- A kid has at most 4 channels.
- A DayType has at most one `screen` block.
- Every weekday in `week` points at an existing DayType.
- Window `end` is after `start`. Windows of one channel do not overlap each other.
- A programme never places a show across the window end.
- Nothing about a kid is computed from a stored age. Only the birthdate is stored.
- The five practice files are never read at runtime. The content model is a build-time derivation checked by tests against the files' values (C2.1).
