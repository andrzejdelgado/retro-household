# 06 — Screen specs

Date: 2026-09-28. Inputs: `docs/04-journeys.md`, `docs/05-domain-model.md`, `docs/01-goals.md`, `docs/03-insights.md`. One spec per screen. Every screen lists its single primary action, its states, the warnings it can show with their fixes, and what it must not do. Visual design (tokens, exact components) comes in Phase 5; where a shadcn/ui component is the obvious fit it is named so Phase 5 starts from it.

## 0. Rules that apply to every screen

- **One primary action per screen** (C7.4). Everything else is secondary or lives in an overflow.
- **Mobile first.** Specs describe the 375px layout. Desktop notes say what changes above 1024px. Nothing scrolls horizontally (C7.1).
- **Warnings are inline, under the field that caused them**, never in a modal, never as a toast. Each shows one sentence written as a consequence for the child, then its fixes as buttons, then a dismiss control. Dismissed warnings collapse to a one-line count at the top of the screen so they can be reopened. Muted (Settings) warnings do not render at all (C2.2, C2.4).
- **The budget bar** is present on every screen that can change a kid's planned minutes: S05, S06, S08, S09, S10, S11. See section 1.
- **No gamification anywhere.** No stars, streaks, points, badges, confetti, or praise for the parent or the child (I3).
- **No screen for the child except the TV app.** Parent screens may assume an adult reader.
- **Empty states say what to do next** and carry the action (C1.4).
- **Every default carries a why.** A small "why" affordance next to any prefilled value opens its one-line reason and source (C2.5).
- **Time entry** uses a native time input on mobile and a text field with 15-minute steps on desktop. Never a wheel with seconds.

## 1. Shared components

### Budget bar and budget sheet
Purpose: the accumulator, always visible where minutes can change (C5.3).

- **Bar** (mobile): a single row pinned above the tab bar. Left: kid colour dot and name. Middle: "Today 25 of 30 min". Right: "Week 1h40 of 2h". A thin fill under the text shows today's ratio. Four states: under (default), at cap (full fill), over (fill in the warning colour, numbers unchanged), over by choice (neutral fill, numbers unchanged, see below). Tapping opens the sheet. While any field on the screen has focus, the bar collapses to a one-line chip in the page header and the tab bar hides; both restore on blur, so the total stays in view above the keyboard (C5.3). Desktop: the same content as a card at the top of the right-hand column, always in view.
- **Sheet** (shadcn Sheet from the bottom on mobile, side on desktop): per-weekday row of planned minutes with a small bar each, the weekly total, days used of max, and the list of active warnings for this kid with their fixes. This is the one place all warnings for a kid appear together.
- Numbers come from `plannedMinutes` and `plannedWeek`. For a kid with a zero cap the bar reads "Today 0 of 0 min" and any planned minutes put it in the over state at once (C5.4). Once the parent has dismissed the warning for that subject, the bar shows over by choice: the numbers are unchanged and the fill is neutral, so an informed decision stops signalling (D37).

### Warning card
One sentence, consequence first. Fix buttons (shadcn Button, secondary variant), at most three. Dismiss as a small tertiary control at the end. Never a red banner; the tone is a note from a calm adult.

### Bracket range picker
For custom practices and custom rules that apply to some ages only. A row of eight equal segments labelled 0 to 8 at the boundaries (nine tick labels, eight cells). Tap one cell to select a single year, tap another to extend to a contiguous range. Selected cells fill with the kid colour. Built on shadcn ToggleGroup with a customisation: selection is always contiguous. Log the customisation in Phase 5.

### Day switcher
A shadcn Tabs row: "Weekday", "Weekend" by default. After a split, one tab per distinct DayType with the weekday names it covers under the label ("Mon · Tue · Wed · Thu"). An overflow menu holds "Split weekdays", "Split weekend", "Copy this day to…", "Merge back". "Copy this day to…" points the chosen weekdays at this day type, so days that are the same are one day edited in one place; "Split" makes a day its own again (D29). On mobile the tabs scroll horizontally inside their own strip; the page itself does not.

### Timeline (routine)
A vertical list of blocks in time order, each a card with time range, icon by `kind`, title, and a chevron. Editing a block opens a Sheet with start, end, title, note, and the why if it came from a practice. Reordering is by changing times, not by drag, so mobile stays reliable. Times ripple: changing a block's end moves the next block's start to match, changing a start moves the previous block's end, and blocks never overlap. The sleep block anchors the end of the day; a change that would push any block past it is refused inline with the reason (D28). Gaps are shown as a thin dashed line with an add action.

### TV timeline (household)
Horizontal hours from 15:00 to 20:00 by default, expanding to include any window outside it. One lane per kid in the kid's colour. Windows are rounded bars with the channel icon. Overlaps are drawn with the two bars offset and a warning marker between them. `away`, dinner and sleep blocks from each kid's routine appear as faint hatched regions in that kid's lane so the parent sees why a proposal is refused.

## 2. Navigation

Parent app on mobile: a bottom tab bar with four items: Home, TV, Rules, Settings. Kids are reached from Home. The tab bar hides while a field has focus and on first-run S03. The bottom tab bar is a customisation of shadcn Tabs (it has no native bottom bar); logged in Phase 5. Desktop: the same four items in a left sidebar, content in a centre column of at most 720px, and a right column for the budget card and warnings on kid screens.

TV app: a separate full-screen route `/tv` with its own dark theme and no parent navigation. Keyboard only: arrows, Enter, Escape, Cmd+K.

## 3. Parent app screens

### S01 — Welcome
Removed (D35). First run opens S03 directly with the purpose sentence on top; the household is created with the default name "Home" when the first kid is saved and renamed in S15. "Load demo household" lives in S15.

### S03 — Add or edit kid
- **Purpose.** Create a kid profile with the facts the app needs.
- **Entry.** First run (no household yet), S04 add kid, S05 edit, "Save and add another" on this screen.
- **Content.** On first run the screen opens under the product name and one sentence: "Routines, rules and a TV schedule for a household with children under 8, printed for the fridge.", headed "Add your first child"; the tab bar is hidden and there is no back until the first kid exists (D35, D36). Name. Birthdate (native date input). A live line under it: "Simona is 4 · bracket 4 to 5" that updates as the date is typed. PIN, optional: four digit boxes (shadcn InputOTP) under the line "For the TV app. You can set it later." On edit the boxes show the current digits. Colour: a row of six swatches. When editing, a destructive "Remove kid" at the bottom behind a confirm.
- **Primary action.** Save. On create, goes to S05 with defaults applied; the first save also creates the Household with the default name "Home", all nine rules enabled and default Wi-Fi windows.
- **Secondary.** "Save and add another": saves and reopens this screen empty (D34).
- **States.** An invalid date, or a PIN with one to three digits, keeps Save disabled with the reason under the field; an empty PIN is allowed (D31). Typed but unsaved fields do not survive a reload; C1.3 applies to saved data. A birthdate that makes the kid 8 or older shows "Retro Household covers children under 8" and still allows saving with the kid shown as 7 to 8.
- **Warnings.** None here; the consequences of the bracket appear on S05.
- **Must not.** Ask for gender, photo, school, or anything not in the model.
- **Criteria.** C1.2, C6.1.

### S04 — Home
- **Purpose.** See the household at a glance and get to any kid.
- **Entry.** Tab bar. Returning visits open here (D36).
- **Content.** Household name as the title. One card per kid: colour, name, age and bracket, today's planned minutes against cap as a small bar, the number of active warnings if any. Below the cards: a row of two quick actions, "Print" (opens S14 with the household rules page selected) and "TV timeline" (S11).
- **Primary action.** Add kid (floating on mobile, in the header on desktop).
- **States.** No kids: an empty state card saying "Add your first child to get routines, screen time and TV set up from best practice for their age." with the add action.
- **Warnings.** Counts only, no cards. Tapping a count opens that kid's budget sheet.
- **Must not.** Show a feed, tips, or news. It is a list of kids.
- **Criteria.** C1.2, C1.4.

### S05 — Kid overview
- **Purpose.** The hub for one kid.
- **Entry.** S04 card.
- **Content.** Header: name, age and bracket, the TV PIN or "No PIN yet", edit link to S03. On the first visit after creation, a dismissable line under the header: "Set up from recommended practice for age 4. Change anything." Four section cards in order: Routine (the day switcher's day types and how many blocks each has), Screen time (today's planned total and what is open at this age in one line), TV channels (up to four small tiles with icon and window, or the empty state), Print (buttons for each distinct day and one for the rules page). Budget bar pinned.
- **Primary action.** Open routine.
- **States.** Under 3: the TV channels card reads "No screen time is recommended under 3. You can still add a channel; the app will show what it means." with the add action present (C5.4). Kid at 7 to 8 turning 8: a line noting the last bracket.
- **Warnings.** Counts on the Screen time and TV cards; cards themselves in the budget sheet.
- **Must not.** Show a viewing log as a chart. The log is a plain list under Screen time, reachable but not the hero.
- **Criteria.** C1.2, C5.3, C5.4, C6.1.

### S06 — Routine
- **Purpose.** Build and edit one kid's day rhythm per day type.
- **Entry.** S05.
- **Content.** Day switcher. Timeline of blocks for the selected day type. An add button at the bottom offering "From practices" (S07) and "Custom block" (opens the block sheet empty). The `screen` block shows a small link "TV window follows this slot".
- **Primary action.** Add block.
- **Secondary.** Split, copy, merge in the day switcher overflow. Print this day (S14).
- **States.** A day type with no blocks (only possible after the parent deletes everything): "This day is empty. Start from the recommended rhythm for age 4, or add blocks yourself." with both actions.
- **Warnings.** W06 after-dinner, W07 past-bedtime, W08 routine-clash appear under the block whose edit caused them, because moving an `away`, dinner or sleep block can invalidate the TV window. Fix buttons apply to the channel window and say so.
- **Must not.** Offer drag-and-drop as the only way to reorder. Show more than one day type at once on mobile.
- **Criteria.** C1.1, C2.1, C2.5, C3.4.

### S07 — Practices library
- **Purpose.** Pick best practice for this kid's age and add it to the routine.
- **Entry.** S06 add from practices.
- **Content.** Seven domain tabs (shadcn Tabs, scrollable strip). Under each, the practices whose bracket range includes the kid's bracket, as cards: title, duration text, a "why" line, source link (S16). Practices already in the routine show a check. A filter "Show all ages" reveals the rest, each with its age range and a note.
- **Primary action.** Add (per card). Adds a block at the next gap in the selected day type, or at the end, and returns to S06 with the new block highlighted.
- **States.** A domain with nothing for this age (for example chores at 0 to 1): "Nothing recommended in this domain before age 1."
- **Warnings.** None.
- **Must not.** Rank, recommend, or badge practices. The order is the file's order.
- **Criteria.** C2.1, C2.5.

### S08 — Screen time
- **Purpose.** See and set every technology allowance for this kid, against the cap.
- **Entry.** S05.
- **Content.** Top: the cap for this age as a sentence with its why. Then one row per technology from the tech stages: name, this age's depth line, and either a minutes-per-day and days-per-week control (open technologies) or "opens at N" (closed ones). Long-form TV is read-only here and says "set by the TV schedule" with a link to S09. Games and school apps are editable when open. Below the rows: the viewing log as a plain list by date. Budget bar pinned.
- **Primary action.** Save.
- **States.** Under 3: every row reads closed; the log is empty with "No viewing yet."
- **Warnings.** W01, W02, W03 under the field that caused them. W05 when a value is entered for a closed technology. W12 as an informational line in the log.
- **Must not.** Show a chart of screen time. Numbers and bars only.
- **Criteria.** C2.2, C2.3, C2.4, C5.1, C5.2, C5.3.

### S09 — Channels
- **Purpose.** Manage a kid's up to four channels.
- **Entry.** S05.
- **Content.** Up to four channel cards: icon, name, window summary ("Mon Wed Fri Sun · 17:00 to 17:30"), the number of programmed days of the window's days. Budget bar pinned.
- **Primary action.** Add channel. Disabled with a line "Four channels is the limit" at four.
- **States.** None: "No channels yet. A channel is a set of shows that plays at a fixed time, like television used to." with the add action. Under 3: the same plus the W05 note before the parent adds anything. Kid without a PIN: adding the first channel first asks for the PIN inline, with the line "Needed so the TV knows whose channels these are." (D31).
- **Warnings.** W05 as a plain note on the empty state for a kid whose bracket is closed, and as an inline warning under the window in S10 once a channel exists. W11 window-empty on cards whose window has unprogrammed days.
- **Must not.** Show anything a child could select. This is a parent screen.
- **Criteria.** C5.4.

### S10 — Channel editor
- **Purpose.** Set when a channel is on air and what it plays.
- **Entry.** S09 card or add.
- **Content.** Name, icon picker (a fixed set of twelve simple glyphs). Window: a weekday selector (seven toggles, defaults from the bracket's day rules) and start and end times, defaulting from the kid's screen slot and the daily cap. Programme: one ordered list of shows that plays on every day of the window, with a layout preview column showing the computed start time of each and the off-air remainder, and an add button opening the library as a sheet. A "Vary by day" switch, off by default, reveals a day switcher over the window's days with a programme per day and a "Copy to…" action (D30). Budget bar pinned.
- **Primary action.** Save.
- **States.** Library empty: the add sheet says "Add videos to the library first" with a link to S12. Window with no days selected: Save disabled with the reason. Kid with no screen block in the selected day type, or a zero cap: the weekday set and both times start empty with the hint "Set when this channel is on air", Save stays disabled until both are set, and W05 sits under the window from the first keystroke (D27).
- **Warnings.** W01, W02, W03, W04 under the window controls. W06, W07, W08 under the times. W10 under the show that does not fit. W11 on unprogrammed days in the day switcher as a dot.
- **Must not.** Allow a show to be placed across the window end. Offer autoplay or looping.
- **Criteria.** C4.2, C5.1, C5.2, C5.3.

### S11 — TV timeline
- **Purpose.** Resolve conflicts on the one household TV.
- **Entry.** Tab bar (TV), S04 quick action.
- **Content.** A day switcher over the seven weekdays. The household TV timeline for the selected day. Under it, the list of W09 warnings for that day, each with its fixes. A fix that another warning would refuse (for example moving a kid before pick-up) is shown disabled with the refusing reason in one line, so the parent sees why. Secondary link to the Library (S12).
- **Primary action.** None (D32). Each warning card carries its fixes, and the first fix is that card's primary. "Open library" (S12) is a secondary link.
- **States.** No kids with windows: "No TV windows yet. Add a channel to a child to see it here." One kid: the timeline shows one lane and no warnings.
- **Warnings.** W09 with fixes stagger, earlier, together. The together fix carries the line "The TV will ask who is watching when this slot starts." (D33). Applying stagger may raise W06 or W07 on the moved window; those appear immediately under the same list.
- **Must not.** Auto-apply anything. Every change is a parent's tap.
- **Criteria.** C5.5.

### S12 — Library
- **Purpose.** The household's videos.
- **Entry.** S11 link, S10 add sheet.
- **Content.** A list of shows: poster, title, duration, which channels use it. Add via the native file picker, multiple files allowed. Import reads duration and captures a poster frame; a progress line per file while it runs.
- **Primary action.** Add videos.
- **States.** Empty: "Add the films and episodes you have already watched and chosen. Short clips are best for a demo." A show used by a channel cannot be deleted until removed from the programme; the delete control says so.
- **Warnings.** None. A file the browser cannot play is refused with "This file type cannot be played in this browser."
- **Must not.** Search the internet, suggest content, or show anything not added by the parent (I1).
- **Criteria.** C4.2.

### S13 — Rules
- **Purpose.** The household's rules for adults and the home, and the Wi-Fi hours.
- **Entry.** Tab bar.
- **Content.** Nine major rules as rows with a switch, title, and a why line. An "Add a rule" text field at the end for custom rules with an optional bracket range picker. Below: Wi-Fi off windows as rows (days, start to end) with add and remove. A print button for the rules page (S14).
- **Primary action.** Print rules page.
- **States.** All rules off: the print page still prints Wi-Fi and TV hours.
- **Warnings.** None.
- **Must not.** Score the household on how many rules are on.
- **Criteria.** C2.5, C3.2.

### S14 — Print
- **Purpose.** Preview and print one page.
- **Entry.** S05, S06, S13, S04.
- **Content.** A picker of pages: one per kid per day type object (weekdays copied onto one another share a page headed with all their day names), plus the rules page. The preview renders the printed page at page proportions. The page for a kid's day: kid name and the day names it covers in the header, age, the timeline as rows of time and title with the kind icon, the TV window as one row, Wi-Fi off hours as a footer line. The rules page: household name, enabled rules, Wi-Fi off windows, each kid's TV hours per day.
- **Primary action.** Print. Calls the browser's print with a print stylesheet that hides everything except the page (C3.3).
- **States.** A page whose content will not fit: the preview shows the overflow and a line "This day has too many blocks for one page. Shorten notes or merge blocks." No auto-shrinking of type below 12pt.
- **Warnings.** None on paper, ever.
- **Must not.** Print buttons, navigation, warnings, or budget bars. Print more than one page per document.
- **Criteria.** C3.1, C3.2, C3.3, C3.4.

### S15 — Settings
- **Purpose.** The few switches the household has.
- **Entry.** Tab bar.
- **Content.** Household name. "Hide all warnings" switch with a line "Budgets are still shown." A Demo section: demo clock (date and time override with a clear button), "Load demo household" (confirm before replacing data), "Reset everything" (confirm). Links: Sources (S16), About.
- **Primary action.** None dominant; each control is its own action. Save applies where a field changes.
- **States.** Demo clock set: a thin banner on every parent screen reads "Demo clock: Tue 3 Mar 2027 17:08" so nobody mistakes it for real time.
- **Warnings.** None.
- **Must not.** Grow. Anything that needs a setting should first try to not need one.
- **Criteria.** C2.4, C6.1.

### S16 — Sources
- **Purpose.** Show where the defaults come from.
- **Entry.** S15, any why line.
- **Content.** The union of the sources in the practice files, grouped by which file uses them, with titles and links. A note on how conflicts were resolved: the stricter guidance wins.
- **Primary action.** None.
- **Must not.** Editorialise.
- **Criteria.** C2.5.

## 4. TV app screens

The TV app is dark, quiet, and wordless wherever a child is the reader. Focus is shown as a soft ring. There is no cursor-dependent interaction; the mouse works but is never required. No sound outside playback. No text smaller than 32px on a 1080p canvas.

### T01 — PIN
- **Purpose.** Identify the kid.
- **Entry.** `/tv`, Escape from anywhere.
- **Content.** Four large dots. Digits are entered on the keyboard or by clicking a large on-screen numpad. Nothing else. No kid names, no list, no hint.
- **Primary action.** Entering the fourth digit submits.
- **States.** Wrong PIN: the dots clear with a short soft shake and return to empty. No message, no counter, no lockout (C4.6). Correct: T02.
- **Must not.** Show which kid the PIN belongs to before entry. Offer "forgot PIN".
- **Criteria.** C4.6, C4.7.

### T02 — Channel picker
- **Purpose.** Choose a channel with the eyes, not by reading.
- **Entry.** T01, Escape from T03 or T04 does not come here; Escape always returns to T01 (D26).
- **Content.** Up to four large tiles in a row (two rows of two on narrow canvases). An on-air tile shows the current show's poster, the channel icon, and the channel name in large type. An off-air tile is dimmed to a flat dark surface with the channel icon at low contrast and a small "off" glyph; no poster, no name emphasis (C4.4). The kid's colour tints the focus ring.
- **Primary action.** Enter on the focused tile.
- **States.** No channels: a single off-air tile. All off-air: all dimmed; selecting any goes to T04.
- **Must not.** Show times, countdowns, "starts in", or schedules. Show other kids' channels.
- **Criteria.** C4.4, C4.7.

### T03 — Playback
- **Purpose.** Play the channel like broadcast.
- **Entry.** T02.
- **Content.** Full-screen video. On entry and on channel change, the channel icon and name appear in a corner for two seconds and fade. Left and right arrows switch to the kid's neighbouring channels. Nothing else on screen.
- **Behaviour.** The show and the offset into it come from `nowPlaying`. When a show ends, the next placed show starts at its placed time; any gap shows T04 until then. When the window ends, or `budgetLeft` reaches zero, T04 replaces the picture for the rest of the day. Every playing second is written to the ViewingLog for the kid and for each co-watcher.
- **Primary action.** None. It plays.
- **States.** Missing file (the blob cannot be read): the channel icon on a dark surface and nothing else for the child; the show title goes into the viewing log entry, and the seconds still count.
- **Must not.** Show a progress bar, remaining time, a pause control, "next episode", or any control the child could use to extend or skip (I15).
- **Criteria.** C4.1, C4.3, C4.5.

### T04 — Off-air
- **Purpose.** Nothing to watch, nothing to wait for.
- **Entry.** T02 on an off-air channel, T03 at window end or budget end.
- **Content.** A slow, wordless, silent animation on the dark surface: a soft shape that drifts and breathes over about a minute, in the kid's colour at low contrast. No text, no icon that reads as a clock, no motion faster than a breath. Under prefers-reduced-motion the shape is static at low contrast.
- **Primary action.** None. Escape returns to T01; arrows still switch channels.
- **Must not.** Show a countdown, a time, a message, a sound, or anything that rewards looking.
- **Criteria.** C4.3.

### T05 — Co-watch overlay
- **Purpose.** Let the parent record that other kids are watching too.
- **Entry.** Cmd+K on T03 or T04, and once automatically when T03 starts playing inside an acknowledged overlap, with the other acknowledged kids already switched on so that Done confirms (D33). This is a parent gesture and the overlay may use words.
- **Content.** The picture dims to a quarter. A centred panel titled "Who is watching with Simona?" lists every other kid as a row with their colour, name, and a switch (shadcn Switch, large). Under each switch a one-line note when the kid's budget is zero or nearly spent: "Selena has no screen budget at 1. Minutes here count as overage." A "Done" button. Escape also closes.
- **Behaviour.** Turning a switch on starts logging for that kid from that second, marked coWatch. Turning it off stops. Switch states persist for the rest of the session on this channel.
- **Primary action.** Done.
- **Must not.** Let the child reach it: Cmd+K only, no on-screen control, no mouse target on T03. Show the budget as a number the child could negotiate over; the note is for the parent and appears only in the overlay.
- **Criteria.** C4.5, C5.4.

## 5. Coverage

| Criterion group | Screens |
|---|---|
| C1 setup | S03, S04, S05, S06 |
| C2 informed deviation | S06, S07, S08, S13, S15, S16, warning card |
| C3 print | S14 |
| C4 TV | T01 to T05, S10, S12 |
| C5 accumulator | budget bar and sheet, S05, S08, S09, S10, S11 |
| C6 time | S03, S05, S15 |
| C7 UI | every parent screen |

Every journey step in `docs/04-journeys.md` points at one of these screens. Every screen lists the warnings it can show, and every warning in the catalogue (W01 to W12) appears on at least one screen with its fixes.
