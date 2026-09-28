# 07 — Design system

Date: 2026-09-28. Inputs: `PRD.md`, `docs/06-screen-specs.md` (after D27 to D37), `docs/05-domain-model.md`, `ui-inspration/retro-library.png` as a style hint only (D21). This document is what the build uses: tokens, the component inventory, the customisation log, and per-screen design notes for mobile and desktop. Screens are designed in code as they are built (Phase 7); these notes say what each screen must look like before it is opened in a browser.

## 1. Principles

1. **shadcn/ui as shipped.** Components are installed from the registry and used through their documented props, variants and composition. Styling goes through the theme tokens, not through per-instance overrides.
2. **Customisation is the last resort.** The ladder, tried in order: compose stock components; use a documented variant or size; pass a Tailwind class that only maps to a token (colour, spacing, radius); and only then change a component's source. Only the last step is a customisation, and it is logged in section 5 with the UX it enables and why the ladder failed. Today the log is empty.
3. **Calm over clever.** Warm paper, one accent, generous space, no decoration that competes with the parent's next action. The inspiration image lends a palette and a typographic mood, nothing else.
4. **Mobile first.** Every note below starts at 375px. Desktop notes only say what changes at 1024px and above.
5. **Two themes, one system.** The parent app is light. The TV app is dark and reuses the same tokens with different values. Print is a third rendering of the same components, with its own stylesheet.

## 2. Tokens

Tokens are the shadcn CSS variables in `oklch`, set on `:root` for the parent app and on the `/tv` route's root for the TV app. Values are starting points; the build validates every text and UI pair against WCAG AA (C7.3) and adjusts lightness, not hue.

### Colour, parent app (light)

| Token                                   | Value                 | Use                                                                                                |
| --------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| --background                            | oklch(0.975 0.012 85) | Page. Warm paper, not white                                                                        |
| --foreground                            | oklch(0.22 0.02 60)   | Text. Warm ink, not black                                                                          |
| --card, --popover                       | oklch(0.99 0.008 85)  | Cards, sheets, popovers                                                                            |
| --card-foreground, --popover-foreground | oklch(0.22 0.02 60)   |                                                                                                    |
| --primary                               | oklch(0.48 0.08 195)  | The one accent: teal. Primary buttons, focus rings, active nav                                     |
| --primary-foreground                    | oklch(0.985 0.01 85)  |                                                                                                    |
| --secondary                             | oklch(0.93 0.015 85)  | Secondary buttons, fix buttons on warning cards                                                    |
| --secondary-foreground                  | oklch(0.22 0.02 60)   |                                                                                                    |
| --muted                                 | oklch(0.94 0.012 85)  | Off-air lanes, disabled surfaces, the "over by choice" fill                                        |
| --muted-foreground                      | oklch(0.48 0.02 60)   | Captions, why lines, secondary text                                                                |
| --accent                                | oklch(0.92 0.03 195)  | Hover and selected rows                                                                            |
| --accent-foreground                     | oklch(0.22 0.02 60)   |                                                                                                    |
| --destructive                           | oklch(0.55 0.16 27)   | Remove kid, reset everything. Nowhere else                                                         |
| --border, --input                       | oklch(0.88 0.015 80)  |                                                                                                    |
| --ring                                  | oklch(0.48 0.08 195)  | Same as primary                                                                                    |
| --warning                               | oklch(0.72 0.12 70)   | Additive token. Warning card left edge, budget bar over state                                      |
| --warning-foreground                    | oklch(0.22 0.02 60)   |                                                                                                    |
| --radius                                | 0.75rem               | Cards and sheets. Buttons and inputs derive `--radius-sm` and `--radius-md` from it as shadcn does |

Kid colours are six additive tokens used for a kid's dot, lane, channel tiles and the TV focus ring. Each has a foreground pair for text placed on it.

| Token   | Value                | Name shown to the parent |
| ------- | -------------------- | ------------------------ |
| --kid-1 | oklch(0.62 0.10 195) | Teal                     |
| --kid-2 | oklch(0.66 0.13 40)  | Terracotta               |
| --kid-3 | oklch(0.78 0.13 85)  | Mustard                  |
| --kid-4 | oklch(0.55 0.12 320) | Plum                     |
| --kid-5 | oklch(0.62 0.10 140) | Moss                     |
| --kid-6 | oklch(0.58 0.05 250) | Slate                    |

### Colour, TV app (dark)

| Token              | Value                            |
| ------------------ | -------------------------------- |
| --background       | oklch(0.16 0.01 260)             |
| --foreground       | oklch(0.92 0.01 85)              |
| --card             | oklch(0.21 0.01 260)             |
| --muted            | oklch(0.26 0.01 260)             |
| --muted-foreground | oklch(0.60 0.01 260)             |
| --primary          | the signed-in kid's colour token |
| --ring             | the signed-in kid's colour token |
| --border           | oklch(0.30 0.01 260)             |

No warning or destructive token is used on the TV app. Nothing on it is red or amber.

### Typography

| Role        | Font                                            | Notes                                                                                                                   |
| ----------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Display     | Fraunces (variable, optical size) via next/font | Screen titles, kid names in headers, printed page headers. Weight 500 to 600, optical size follows size                 |
| Body and UI | Geist via next/font                             | Everything else. `font-feature-settings: "tnum"` on any number a parent compares: budget bar, layout preview, timelines |
| TV app      | Geist                                           | Never under 32px at 1080p (R8)                                                                                          |
| Print       | Fraunces for headers, Geist for rows            | Never under 12pt (C3.3)                                                                                                 |

Type scale, parent app, from the Tailwind defaults so no custom scale exists: `text-sm` 14px captions and why lines, `text-base` 16px body and inputs, `text-lg` 18px card titles, `text-2xl` 24px screen titles in Fraunces, `text-4xl` 36px only for the first-run heading. Line height 1.5 for body, 1.2 for display.

### Spacing, layout, elevation, motion

- Tailwind spacing scale as is. Page gutter 16px on mobile, 24px on desktop. Cards stack with 12px. Sections with 24px.
- Content column on desktop: at most 720px, centred, with the sidebar on the left and a 320px right column on kid screens for the budget card.
- Elevation: borders, not shadows, for cards. One shadow level, shadcn's `shadow-sm`, only on the floating add button and the budget chip.
- Motion: shadcn's built-in transitions only. 150ms for state changes, 200ms for sheets and drawers. `prefers-reduced-motion` disables the off-air animation (T04) and every non-essential transition.
- Icons: lucide, the set shadcn ships with, at 20px in the UI and 24px in the tab bar. Stroke width as shipped.

## 3. Component inventory

Every interactive element on every screen maps to a stock component. Where two stock parts could do, the table names the one to use so screens stay consistent (Nielsen #4).

### Shared components (spec §1)

| Spec component          | Built from                                                                                                                                                   | Notes                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Budget bar (mobile)     | `Card` with `Progress` inside, fixed above the tab bar                                                                                                       | The chip state on focus is the same `Card` at `size="sm"`, inline in the page header. Four states are colour tokens on the `Progress` indicator: primary, primary at cap, warning when over, muted when over by choice. Never a custom component |
| Budget sheet            | `Drawer` on mobile, `Sheet` side="right" on desktop                                                                                                          | shadcn's own guidance: Drawer for touch, Sheet for pointer. Contents: a `Table` of weekdays and a list of warning cards                                                                                                                          |
| Budget card (desktop)   | `Card` in the right column                                                                                                                                   | Same contents as the bar plus the weekday table always open                                                                                                                                                                                      |
| Warning card            | `Alert` with a `--warning` left border, fixes as `Button variant="secondary" size="sm"`, dismiss as `Button variant="ghost" size="sm"`                       | Never `AlertDialog`, never `sonner`. The first fix is `variant="default"` only on S11 where the card is the screen's only primary (D32)                                                                                                          |
| Bracket range picker    | `Slider` with two thumbs, `min={0} max={8} step={1}`, tick labels 0 to 8 under it                                                                            | Selection is contiguous by construction, so no ToggleGroup customisation is needed. Applies to custom practices and custom rules                                                                                                                 |
| Day switcher            | `Tabs` with `TabsList` scrollable in its own strip; overflow actions in `DropdownMenu`                                                                       | Tab label is the day type name; the weekday names under it are `text-sm text-muted-foreground`                                                                                                                                                   |
| Timeline (routine)      | A list of `Card` rows; editing in `Drawer` (mobile) or `Sheet` (desktop); time entry `Input type="time"`                                                     | Gaps are a `Separator` with a dashed style token and an inline add `Button variant="ghost"`                                                                                                                                                      |
| TV timeline (household) | A `ScrollArea` holding a CSS grid; lanes are plain `div`s in kid colours; hatched regions use a token pattern; overlap markers are `Badge variant="outline"` | No chart library. This is layout, not data visualisation                                                                                                                                                                                         |
| Bottom tab bar          | `nav` with four `Button variant="ghost"` each with a lucide icon and a label; the active one uses `text-primary`                                             | No Tabs customisation. A nav is what it is                                                                                                                                                                                                       |
| Desktop sidebar         | `Sidebar`                                                                                                                                                    | The stock component, with the same four items                                                                                                                                                                                                    |
| Empty state             | `Card` with a title, one sentence, and one `Button`                                                                                                          | Same shape on every screen                                                                                                                                                                                                                       |
| Why affordance          | `Popover` opened from a `Button variant="ghost" size="icon"` with the info icon                                                                              | Popover, not Tooltip, so it works on touch and can hold a link to S16                                                                                                                                                                            |
| Demo clock banner       | `Alert` at the top of the page, `variant="default"`                                                                                                          | Visible on every parent screen while set                                                                                                                                                                                                         |
| Top bar                 | A `header` with the title and a `Button variant="ghost" size="icon"` bell carrying a `Badge` with the warning count                                          | Opens S17. The only header control                                                                                                                                                                                                               |
| Selection tiles         | `ToggleGroup type="multiple"` of `Card`-sized items, each a `ToggleGroupItem` with an icon, title and a line; a pinned `Button` "Add (n selected)"           | Practices (S07) and rules (S13), from the onboarding reference (D44)                                                                                                                                                                             |
| Schedule grid (desktop) | A CSS grid inside `ScrollArea`: time rows, one column per day type (S06) or per kid (S11); blocks and windows as `Card`s in the cells                        | From the bookings reference (D44). No calendar library                                                                                                                                                                                           |

### Per-screen components

| Screen                 | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S03 Add or edit kid    | `Card`, `Label`, `Input` (name), `Input type="date"`, `InputOTP` (PIN), a `RadioGroup` of six colour swatches, `Button` Save, `Button variant="secondary"` Save and add another, `Button variant="destructive"` behind `AlertDialog` for remove                                                                                                                                                                                                                 |
| S04 Home               | `Card` per kid with `Progress`, `Badge` for warning counts, `Button` add kid, two `Button variant="secondary"` quick actions                                                                                                                                                                                                                                                                                                                                    |
| S05 Kid overview       | `Alert` (first-visit line, dismissable), four `Card`s, `Button` open routine, the budget bar                                                                                                                                                                                                                                                                                                                                                                    |
| S06 Routine            | Day switcher, timeline, `DropdownMenu` for split, copy, merge; `Button` add block with a `DropdownMenu` for "From practices" and "Custom block"                                                                                                                                                                                                                                                                                                                 |
| S07 Practices library  | `Tabs` for the seven domains, `Card` per practice with `Button size="sm"` add, `Switch` for "Show all ages", `Badge` for age ranges                                                                                                                                                                                                                                                                                                                             |
| S08 Screen time        | `Table` of technologies, `Input type="number" inputMode="numeric"` and a `Select` for days per week, `Badge` for "opens at N", `Table` for the viewing log, `Button` save                                                                                                                                                                                                                                                                                       |
| S09 Channels           | `Card` per channel, `Button` add channel, `InputOTP` inline for the PIN ask (D31)                                                                                                                                                                                                                                                                                                                                                                               |
| S10 Channel editor     | `Input` name, `ToggleGroup type="single"` for the icon picker, `ToggleGroup type="multiple"` for the seven weekdays, two `Input type="time"`, `Switch` "Vary by day", a list of `Card` rows with the layout preview in `tnum` figures, `Drawer` or `Sheet` holding the library picker, `Button` save                                                                                                                                                            |
| S11 TV timeline        | Day switcher, TV timeline, warning cards, `Button variant="link"` open library                                                                                                                                                                                                                                                                                                                                                                                  |
| S12 Library            | `ToggleGroup type="single"` category tiles, the bracket range `Slider` in a `Collapsible` for the age filter, a grid of `Card`s with `AspectRatio` posters and `Badge`s, add in a `Dialog` (desktop) or `Drawer` (mobile) holding `Input type="file" multiple accept="video/*"` inside a dashed drop zone, `Input` title, `Select` category, the range `Slider`; `Progress` per importing file; `Button variant="ghost"` delete with `AlertDialog` when allowed |
| S13 Rules              | `Switch` per rule, `Input` plus `Button` for a custom rule, the bracket range picker, `Card` rows for Wi-Fi windows with `Input type="time"` pairs and weekday `ToggleGroup`, `Button` print                                                                                                                                                                                                                                                                    |
| S14 Print              | `Select` for the page picker on mobile, `RadioGroup` on desktop, a preview `Card` at page proportions, `Button` print                                                                                                                                                                                                                                                                                                                                           |
| S15 Settings           | `Input` household name, `Switch` hide all warnings, `Input type="datetime-local"` demo clock with `Button variant="ghost"` clear, `Button variant="secondary"` load demo household behind `AlertDialog`, `Button variant="destructive"` reset behind `AlertDialog`, `Button variant="link"` sources                                                                                                                                                             |
| S16 Sources            | `Accordion` grouped by practice file, plain links                                                                                                                                                                                                                                                                                                                                                                                                               |
| S17 Warnings           | Warning cards under kid headings, `Separator` between groups, `Button variant="link"` to the owning screen                                                                                                                                                                                                                                                                                                                                                      |
| S18 Passcode           | `Card`, `InputOTP` with six slots (four to six digits), `Button` continue, `Button variant="link"` forgot                                                                                                                                                                                                                                                                                                                                                       |
| S19 Forgot passcode    | `Card`, `Button variant="secondary"` back, `Button variant="destructive"` behind `AlertDialog`                                                                                                                                                                                                                                                                                                                                                                  |
| S20 Household channels | `Tabs` per kid, a grid of `Card` tiles with `Badge` on air or off air, an add tile as a dashed `Card` with a `Button variant="ghost"`                                                                                                                                                                                                                                                                                                                           |
| T01 PIN                | `InputOTP` at TV scale, an on-screen numpad of `Button size="lg"`                                                                                                                                                                                                                                                                                                                                                                                               |
| T02 Picker             | Up to four `Card`s as tiles with `AspectRatio` 16:9 posters; off-air tiles use `--muted` and a lucide power-off icon                                                                                                                                                                                                                                                                                                                                            |
| T03 Playback           | A `video` element; the channel badge on entry is a `Badge` at TV scale that fades                                                                                                                                                                                                                                                                                                                                                                               |
| T04 Off-air            | A single `div` with the animation; static under reduced motion                                                                                                                                                                                                                                                                                                                                                                                                  |
| T05 Co-watch           | `Dialog` with a list of `Switch` rows and a `Button` Done                                                                                                                                                                                                                                                                                                                                                                                                       |

Not used anywhere, on purpose: `sonner` (no toasts, R2), `Tooltip` (touch), `Chart` (I3, no charts of screen time), `Carousel`, `Pagination`, `Breadcrumb`, `Menubar`, `NavigationMenu`, `Calendar` (native date inputs are enough), `HoverCard`.

## 4. States and feedback

- **Pending.** A `Button` in its `disabled` state with the label unchanged and a lucide spinner icon, for any action over 400ms (library import). Everything else is instant and shows its result in place.
- **Saved.** No toast. The screen shows the new value; the budget bar updates; S05 returns from S03 with the new kid card visible.
- **Focus.** shadcn's ring on every focusable element, in `--ring`. On the TV app the ring is the kid's colour at 4px.
- **Disabled.** shadcn's `disabled` styling. A disabled fix on S11 carries its reason as text beside it, never only as greyness (C7.3, colour is not the only signal).
- **Hit areas.** Every touch target at least 44px on mobile: `Button` default size, `Switch` with its label as the click target, list rows as whole-row links.

## 5. Customisation log

No component source has been changed. Two customisations the Phase 3 specs expected were avoided:

| Expected                                              | Avoided by                                                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Bottom tab bar as a customised `Tabs`                 | A `nav` of four ghost `Button`s. Tabs describe content panels; this is navigation, and a nav needs no component change |
| Contiguous-range `ToggleGroup` for the bracket picker | A two-thumb `Slider` with `step={1}`, whose selection is contiguous by nature                                          |

Format for any future entry: component, file changed, the UX the change enables, why steps 1 to 3 of the ladder could not deliver it, and the date. An entry without the "why the ladder failed" line is not accepted (C7.2).

## 6. Per-screen design notes

Each note gives the mobile layout at 375px, then what changes on desktop. Copy that the spec fixes is not repeated here.

### S03 Add or edit kid

Mobile: one column. On first run, the product name in Fraunces `text-4xl` and the purpose sentence above a single `Card` headed "Add your first child"; no tab bar, no back. Fields in order: name, birthdate, live bracket line in `text-sm text-muted-foreground`, colour swatches as a horizontal `RadioGroup` of six 44px circles with the selected one ringed, then the optional PIN with its line under the `InputOTP`. Save is full width at the bottom of the card; "Save and add another" is a secondary button under it. Remove kid, on edit only, sits below a `Separator` at the end.
Desktop: the card is 480px centred. Buttons align right. Nothing else changes.

### S04 Home

Mobile: household name as the title. Kid cards full width: a 12px colour dot, the name in Fraunces `text-lg`, "4 · bracket 4 to 5" in muted, a `Progress` with "25 of 30 min today" in `tnum` under it, a `Badge` with the warning count at the right edge. Quick actions as two half-width secondary buttons under the cards. Add kid as a floating primary button bottom right, above the tab bar.
Desktop: cards in a two-column grid inside the 720px column. Add kid moves into the header. No floating button.

### S05 Kid overview

Mobile: header with the name in Fraunces `text-2xl`, age and bracket, "PIN 4821" or "No PIN yet" in muted, an edit link. The first-visit `Alert` under the header. Four cards in the spec's order, each with a title, one line of status, and a chevron; the whole card is the tap target. Budget bar pinned.
Desktop: a left section nav (Profile, Routine, Screen time, TV, Print) at 200px with the selected section's content beside it, following the settings reference; the budget card in the right column with the weekday table open.

### S06 Routine

Mobile: day switcher strip under the title, scrolling inside itself. Timeline rows: time range in `tnum` on the left at 64px, icon, title, chevron. Gaps as dashed separators with a ghost add. The screen block shows "TV window follows this slot" in `text-sm`. Add block is a primary button pinned above the budget bar. Editing opens a `Drawer` with two time inputs side by side, title, note, and the why line if any.
Desktop: the schedule grid, time rows from 06:00 to 21:00 and one column per day type, blocks as cards in the cells in the kind's icon and title; the day switcher becomes the column headers; editing opens a `Sheet` on the right; the budget card sits in the right column (D44).

### S07 Practices library

Mobile: domain `Tabs` strip. Practices as selection tiles in a single column: title, duration in muted, the why line; a selected tile shows the primary border and a check. Already-added ones are disabled with the check. "Add (n selected)" pinned above the budget bar. The "Show all ages" `Switch` sits at the top right of the list.
Desktop: tiles in a three-column grid, the onboarding reference layout. Same otherwise.

### S08 Screen time

Mobile: the cap sentence as the first paragraph with its why affordance. One `Card` per technology instead of a table: name, depth line, then either the two controls side by side or a `Badge` "opens at 6". Long-form TV shows "Set by the TV schedule" and a link to S09. The viewing log as a compact list below a heading. Budget bar pinned; on focus it becomes the header chip.
Desktop: a `Table` with columns technology, allowed now, minutes, days. Budget card in the right column.

### S09 Channels

Mobile: up to four `Card`s with the icon at 40px, the name, the window summary, and a muted line for programmed days. Add channel as the primary button at the bottom; at four it is disabled with its reason under it. The PIN ask, when needed, appears as a `Card` above the list with the `InputOTP` and its line, and the add action waits until it is filled.
Desktop: cards in two columns.

### S10 Channel editor

Mobile: sections with headings in this order: Channel (name, icon `ToggleGroup` as a wrapping row of 44px cells), On air (weekday `ToggleGroup` as seven equal cells, then start and end time inputs side by side), Programme (the "Vary by day" `Switch` at the top right, then the show rows with the computed time on the left in `tnum`, the title, the duration, and a remove ghost button; the off-air remainder as the last muted row; add show as a secondary button opening the library `Drawer`). Save pinned above the budget bar. Warnings appear directly under the control they belong to.
Desktop: the same sections in the centre column; the library picker as a `Sheet`; the layout preview gains a thin horizontal bar under the list showing the window with shows as segments.

### S11 TV timeline

Mobile: day switcher over seven short weekday tabs. The timeline in a `ScrollArea` that scrolls horizontally inside itself, 15:00 to 20:00 by default, lane height 44px, kid name at the left edge of each lane, windows as rounded bars with the channel icon, hatched routine regions behind. Warning cards stacked under it, each with its fixes; the first fix of each card is that card's primary. "Open library" as a link at the bottom. Nothing else.
Desktop: the schedule grid, time rows from 15:00 to 20:00 and one column per kid headed with the kid's name and colour, windows as cards in the cells with the channel icon, routine regions hatched behind; warning cards in the right column (D44).

### S12 Library

Mobile: category tiles in a horizontally scrolling strip, the age filter as a collapsed row under it, then a two-column grid of poster cards with the title, duration in `tnum`, and small badges for category and ages; "Used by Stories" in muted. Add videos as the primary button at the top opening the `Drawer`. While importing, a `Card` per file with its name and a `Progress`.
Desktop: the POS reference layout without the cart: category tiles in a row, a five-column grid of poster cards, add in a `Dialog` with the drop zone, title, category and age range.

### S13 Rules

Mobile: nine rules as selection tiles in a single column, the title and the why line, selected when on; the tile is the click target. A custom rule `Input` with an add button under the list, and the bracket range `Slider` revealed only after the parent starts typing. Wi-Fi off windows as `Card` rows: weekday cells and two time inputs; add window as a secondary button. Print rules page as the primary button at the bottom.
Desktop: rules and Wi-Fi side by side in two columns of the centre column.

### S14 Print

Mobile: a `Select` at the top listing every page; below it the preview card at A4 proportions scaled to width, scrollable inside itself. Print is the primary button pinned at the bottom. An overflow line appears above the preview when the page does not fit.
Desktop: the page list as a `RadioGroup` on the left, the preview at real proportions on the right, Print in the header.

### S15 Settings

Mobile: three sections with headings: Household (name), Warnings (the switch with its line), Demo (clock input with clear, load demo household, reset). Sources and About as links at the end. Destructive actions in the destructive variant, each behind an `AlertDialog` that names the consequence in its confirm button.
Desktop: the same, 480px wide.

### S16 Sources

Mobile and desktop: an `Accordion` with one item per practice file, each listing its sources as links with the title and the domain. A closing paragraph on how conflicts were resolved.

### T01 PIN

1080p canvas, dark. Four 96px dots centred, an `InputOTP` at that scale, and a numpad of twelve 120px `Button size="lg"` cells under it in a 3 by 4 grid. Focus ring 4px in a neutral colour since no kid is known yet. Wrong PIN: dots clear with a 200ms shake, nothing else. Reduced motion: no shake, dots simply clear.

### T02 Picker

Up to four tiles in a row at 400 by 300 with 32px gaps, centred. On-air tile: the poster at 16:9, the channel icon at 48px in the corner, the name at 40px below. Off-air tile: `--muted` surface, the icon at 48px in `--muted-foreground`, a 40px power-off icon centred, no name emphasis. Focus ring 4px in the kid's colour. Two rows of two below 1280px wide.

### T03 Playback

The video fills the canvas. On entry and channel change, a `Badge` with the icon and name at 40px in the top-left corner, fading after two seconds. Nothing else. The missing-file state is the icon at 96px centred on `--card`.

### T04 Off-air

A single soft shape, 30 percent of the canvas width, in the kid's colour at 20 percent opacity on `--background`, drifting across a 200px path and scaling between 0.95 and 1.05 over 60 seconds, easing in and out. No sound. Under reduced motion it is static in the centre.

### T05 Co-watch

A `Dialog` at 720px wide over the dimmed picture. Title at 40px. One row per other kid: a 24px dot, the name at 32px, the `Switch` at TV scale on the right, the budget note under the name in `--muted-foreground` when it applies. Done as a `Button size="lg"` at the bottom right. Focus starts on the first switch.

## 7. Print stylesheet

- `@media print` hides the tab bar, sidebar, budget bar, warnings, buttons and every interactive element, and shows only the selected page.
- Page: A4 portrait with 16mm margins, and Letter falls back to the same layout. `@page { size: auto; margin: 16mm }`.
- Kid day page: header with the kid's name in Fraunces 24pt and the day names in 14pt, age in 12pt muted. Timeline as a two-column table: time in 12pt `tnum` at 22mm wide, then icon and title in 12pt, note in 10pt only if present. The TV window as one row. Wi-Fi off hours as a 12pt footer line.
- Rules page: household name 24pt, rules as a list at 12pt with the why in 10pt under each, Wi-Fi off windows as a table, each kid's TV hours as a table.
- Overflow is never solved by shrinking type. The screen reports it (S14 states).

## 8. Accessibility baseline

- Text contrast 4.5:1, UI contrast 3:1, checked per token pair during the first milestone that renders them.
- Every icon-only button has an accessible name. Every input has a visible `Label`.
- Colour never carries meaning alone: budget states also change the numbers' wording ("over by 15 min"), off-air tiles carry the power-off icon, disabled fixes carry their reason.
- Keyboard: every parent screen completes by keyboard; the TV app is keyboard first.
- `prefers-reduced-motion` respected everywhere.

### S17 Warnings

Mobile: warning cards under a heading per kid in the kid's colour, then "Household". Each card as in §1 with a link "Open" to the owning screen. The empty state is one line. Desktop: the same list in the centre column, following the notifications reference without its search, filters and "mark all as read".

### S18 Passcode

Mobile: product name in Fraunces `text-4xl`, one sentence, a `Card` with the `InputOTP` centred and Continue full width; in set mode the card shows "Choose a parent passcode" then "Repeat it" as two steps in the same card. "Forgot the passcode?" as a link under the card in enter mode. Desktop: the login reference's right column only, 420px centred, no image panel, no providers, no sign-up line.

### S19 Forgot passcode

Mobile and desktop: one `Card`, two sentences, Back as a secondary button and "Reset everything" as a destructive button, following the forgot-password reference's shape without an email field.

### S20 Household channels

Mobile: kid `Tabs` strip, then a single column of channel tiles: icon at 40px, name, kid dot, window summary, and the on-air or off-air `Badge` with its line; the add tile at the end of each kid's section. Desktop: the tables reference layout: kid tabs in a row, tiles in a four-column grid.

## 9. Reference templates

The templates in `templates/` (shadcnuikit.com) are layout references only (D38). Each screen below names its reference and what is taken and left. Nothing is copied from the kit; every layout is rebuilt from the registry with the tokens in section 2.

| Screen                                           | Reference              | Taken                                                               | Left                                                                      |
| ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| S04 Home                                         | HR dashboard           | Sidebar shell, header, stat-card style for kid cards                | Charts, gauge, KPI deltas, date range, download                           |
| S05 Kid overview (desktop)                       | Settings page          | Left section nav with the form beside it                            | Avatar upload, email, bio                                                 |
| S06 Routine (desktop), S11 TV timeline (desktop) | Hotel bookings         | Time rows, one column per day type or kid, blocks as cards          | Booking IDs, list toggle, add button in the header                        |
| S07 Practices, S13 Rules                         | Onboarding flow        | Selectable tile grid, "Continue (n selected)" as "Add (n selected)" | Wizard framing; first run stays on S03 (D35)                              |
| S12 Library                                      | POS menu               | Category tiles, poster card grid, add dialog with drop zone         | The cart column, prices, search                                           |
| S17 Warnings                                     | Notifications page     | The grouped list                                                    | Search, type filters, mark all as read, timestamps                        |
| S18 Passcode                                     | Login v1               | The single centred card                                             | Image panel, email, providers, sign-up                                    |
| S19 Forgot passcode                              | Forgot password        | The single card shape                                               | Email field                                                               |
| S20 Household channels                           | POS tables             | Filter tabs, tile grid with a status badge                          | Floors, reserved states                                                   |
| Every parent screen                              | Shell of all templates | Sidebar on desktop, top bar                                         | Search, theme toggle, avatar, download link; the bell stays and opens S17 |

Other kit pages (calendar, tasks, notes, file manager list view) may be consulted for a specific layout question during the build, under the same rule: reference only, rebuilt from the registry.
