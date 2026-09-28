# 08 — Build

One entry per milestone of `DEV-PLAN.md`, written when the milestone closes.

## M0 — Scaffold and shell
Date: 2026-09-28

Steps taken (in order):
1. Scaffolded Next.js 16.3 (App Router, TypeScript, Tailwind 4, ESLint, `src/`) into a temporary subfolder, since the root already held documents, and moved it up. Merged the gitignore.
2. Read the bundled Next.js 16 guides before writing code, as its agent file asks; `LayoutProps<"/">` is a generated global type, so `typecheck` runs `next typegen` first.
3. Installed vitest, prettier with the Tailwind plugin, fake-indexeddb and idb. Ran `shadcn init`; this version installs the "base-nova" style on Base UI, whose Button composes links through a `render` prop and needs `nativeButton={false}` when rendering an anchor.
4. Set the design tokens from `docs/07-design-system.md` §2 in `globals.css`: parent light theme, TV dark theme under `.dark` with the kid colour as primary, the warning token, six kid colours, radius 0.75rem. Geist as `--font-sans` and Fraunces as `--font-heading` through next/font.
5. Added sidebar, badge, separator, sheet, tooltip, skeleton, input and card. Built the parent shell: sidebar on desktop, a plain nav of ghost Buttons at the bottom on mobile, a top bar with the bell; four placeholder routes; the `/tv` route with its dark layout.
6. Scripts: lint, typecheck, test, format, format:check, build. CI workflow on push and pull request running all of them.
7. Checked the shell in the browser at desktop and 375px, and the TV route. Fixed the link-rendered buttons. Dev overlay reports no issues.

Decisions and deviations:
- No component source was changed. Two token-mapped class overrides are expected from here on: touch targets get `h-11` or `size-11`, since base-nova buttons are 32 to 36px tall; this stays on step 3 of the customisation ladder.
- The React Compiler lint rule `set-state-in-effect` is turned off for `src/components/ui/**` and `src/hooks/**` only, because the generated `use-mobile` hook trips it and generated code is used as shipped.
- Dependencies beyond the plan's table, all pulled in by `shadcn init`: `@base-ui/react`, `class-variance-authority`, `tw-animate-css`, `cn`, `shadcn`. Recorded in `DEV-PLAN.md`.
- `.claude/launch.json` holds the dev server config for the desktop app's preview when the project folder is the root.

Check: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test` (1 test) and `npm run build` all green locally and in CI (the first CI run failed on Prettier for a Markdown file; Markdown is now excluded from Prettier). Shell seen at both widths locally and on the deployed URL. Vercel project created by the user from the dashboard with all defaults; production at https://retro-household.vercel.app, deploying on every push to main.

Proves: enables C7.1. Status: closed.

## M1 — Content, bracket, clock
Date: 2026-09-28

Steps taken (in order):
1. Wrote the content module under `src/content`: types, the eight brackets with range expansion, caps, tech stages (16 technologies, 28 rows, later-opening entries), practices (7 domains, 27 rows, the domain's framing line as the one-line why), rhythm templates (10, weekday and weekend per bracket group), the nine major rules, and sources derived from the files' source sections (25). Row text is kept exactly as written in the files.
2. Wrote lookups in `src/content/index.ts`: cap, tech stage and default allowances per bracket, practices per bracket and domain, rhythm template per bracket and day kind, opens-at age for closed technologies.
3. Wrote the bracket module (age by calendar, bracket, out-of-scope at 8, next birthday) and the clock module (demo override, Monday-first weekday, time conversions with "24:00" as the end of day).
4. Wrote the fidelity test `src/content/content.test.ts`: it parses every pipe table in the five markdown files and checks caps, every tech-stage row for every one-year bracket it covers, every later-opening row, every practice row, every cell of the weekday and weekend rhythm tables ("Same" cells resolved against the leftmost cell), the nine rule bullets in order, and every source link. 139 tests pass.

Decisions and deviations:
- Rhythm templates put a `screen` block at 16:30 with the daily cap's length (D17) and keep the window's own activity as the following block. For 7 to 8 the cap fills the window, so the activity is kept as a note on the TV block ("On days without TV this hour is: …") rather than dropped. A `sleep` block from bedtime to 24:00 anchors each day (D28). Infants get a single outdoor block with a note that they set their own rhythm.
- Sources are derived once by a small script and committed as data. To regenerate after a practice file changes:
  ```
  python3 - <<'PY'
  import re, json, pathlib
  files = ["household-major-rules.md","household-tech-access-stages.md","household-routine-elements.md","household-rhythms.md","parent-tech-concerns.md"]
  by_url = {}
  for f in files:
      text = pathlib.Path("best-parctices", f).read_text()
      m = re.search(r"## Sources\n(.*)$", text, re.S)
      if not m: continue
      for title, url in re.findall(r"- \[(.+?)\]\((.+?)\)", m.group(1)):
          by_url.setdefault(url, {"title": title, "url": url, "usedBy": []})["usedBy"].append(f)
  entries = ",\n".join("  {\n    title: %s,\n    url: %s,\n    usedBy: %s,\n  }" % (json.dumps(e["title"]), json.dumps(e["url"]), json.dumps(e["usedBy"])) for e in by_url.values())
  pathlib.Path("src/content/sources.ts").write_text('import type { Source } from "./types";\n\n// Derived from the "## Sources" sections of best-parctices/*.md (D24).\nexport const SOURCES: Source[] = [\n%s,\n];\n' % entries)
  PY
  ```
- Vitest config renamed to `.mts` to stop a Vite loader warning.

Check: lint, typecheck, format:check, 139 tests and build all green. Proves: C2.1, C6.1 (logic). Status: closed.

## M2 — Storage, household state, seed
Date: 2026-09-28

Steps taken (in order):
1. Wrote the stored entity types in `src/lib/model/types.ts` from `docs/05-domain-model.md` §1, including the passcode (D40), show category and age range (D43), one programme per channel with an optional per-day override (D30), and a `fromTemplate` flag per routine block so edited blocks survive a bracket change (D08).
2. Wrote the storage interface (`load`, `save`, `putBlob`, `getBlob`, `deleteBlob`, `clear`) with an in-memory implementation for tests and server rendering and an IndexedDB implementation on `idb` (one household record, one blob store).
3. Wrote `emptyHousehold()`: default name "Home", nine rules on, Wi-Fi off from 16:00 to 19:30 on weekdays and from 22:00 every day, from the major rules on work and phones.
4. Wrote the household provider: loads once on mount, `update(mutate)` saves on every change, `replace` for first run, seed and reset.
5. Round-trip test through fake-indexeddb and the memory store for a household with a kid and a blob, plus clear. 141 tests pass.
6. Wired the provider into the parent and TV layouts.

Decisions and deviations:
- The seed household (Miranda and John, kids 2, 4 and 7) needs template application from the routine module, so it moves to M3. The plan's "short demo clips referenced by name" is dropped: ffmpeg is not on this machine and the repository ships no video; seeded shows are metadata and the demo adds real clips through the library (T03 handles a missing file).
- The "change survives a reload" browser check waits for the first screen that saves (M5); the mechanism is proven by the test.
- Fixed the Vitest alias for a project path containing a space (`fileURLToPath`, not `URL.pathname`).
- The first M2 commit broke the production build: the IndexedDB store opened its database at construction, which also runs during server prerendering. The database now opens on first use. Lesson: read the build's exit code, not a grep of its output.

Check: lint, typecheck, format:check, 141 tests and build green. Proves: C1.3 (mechanism). Status: closed.

## M3 — Routine and schedule
Date: 2026-09-28

Steps taken (in order):
1. Added `kind` to DayType so a split weekday still refreshes from the weekday template.
2. Wrote the routine module: template application, `createKid` with default day types and allowances, split, copy by re-pointing (D29) with relabelling ("Monday · Tuesday · Wednesday · Thursday"), merge back, `editBlock` with the ripple rule, `addPractice` and `addBlock` (first gap that fits, else just before sleep by shortening the last block), `removeBlock`, and `refreshForBracket` (D08: untouched template blocks replaced, edited ones kept, allowances refreshed).
3. Wrote the schedule module: default days per bracket, default window from the screen slot for the cap's length (D17, D27), layout back to back with refusal at the window end, now-playing offset, scheduled minutes, per-day programme override (D30).
4. Wrote the seed household (Miranda and John: Grace 2, Henry 4, Ella 7; four shows as metadata; Henry and Ella's default windows overlap at 16:30).
5. Tests: create, split, copy, merge, ripple including the bedtime refusal and the backward shrink, practice placement, birthday refresh; defaults, layout, now-playing at 17:08, per-day programme; seed brackets and overlap. 160 tests pass.

Decisions and deviations:
- D45 logged: a block swallowed by a ripple is removed and reported, not refused. Refusal made the demo persona's class-until-17:00 edit a dead end. J3 and the timeline spec updated.
- Manual allowances have days per week but no chosen days. The accumulator (M4) will count them on the first N weekdays, Monday first; recorded there.

Check: lint, typecheck, format:check, 160 tests, build exit 0. Proves: C3.4, C4.1, C4.2, C6.2 (logic). Status: closed.

## M4 — Accumulator, warnings, conflicts, viewing
Date: 2026-09-28

Steps taken (in order):
1. Accumulator: planned minutes per weekday (placed TV minutes plus manual allowances on the first N weekdays), the planned week with days used and consecutive TV pairs, budget left from the viewing log with the weekly cap winning.
2. Viewing: seconds logged to the host and every co-watcher, extending the open row per sitting; the per-kid log for S08.
3. Conflicts: lanes per kid, overlaps per weekday with the younger kid first, acknowledgement check, and `canPlace` with refusal reasons against school, bedtime and the small hours.
4. Warnings: W01 to W12 derived from the household with fixes as pure transformations, the dismissal key per subject, `visibleWarnings` applying dismissals and the global mute as a filter. W09 offers stagger, an earlier move that carries its refusal reason when disabled, and together.
5. Tests: planned minutes and the week, budget with weekly cap winning and the zero-cap case, co-watch logging, every warning code triggering and clearing, two-kid and three-kid overlaps with a refused earlier move, dismissals and mute. 178 tests pass.

Decisions and deviations:
- D46 logged: a zero cap is not enforced by the TV; the window is the limit and minutes are overage. Without it D14 and D15 contradicted each other for the demo premise.
- Manual allowances count on the first N weekdays, Monday first, since the allowance has days per week but no chosen days (S08). If this proves confusing in M7, the allowance gains a day set.
- Every warning message is a consequence for the child, one sentence, then the fixes (spec §1 warning card).

Check: lint, typecheck, format:check, 178 tests, build exit 0. Proves: C2.3, C2.4, C4.5, C5.1, C5.2, C5.5 (logic). Status: closed.

## M5 — First run to kid overview
Date: 2026-09-28

Steps taken (in order):
1. Added the shadcn parts the parent screens use (input-otp, label, radio-group, progress, alert, alert-dialog, drawer, dialog, popover, switch, select, tabs, toggle-group, slider, scroll-area, collapsible, accordion, table, dropdown-menu, textarea), all as shipped.
2. Built the parent chrome: the passcode gate (D40) with a session flag, the sidebar or bottom nav, no chrome on first-run S03 (D36), and the demo clock banner. The top bar reads the warning count from the household.
3. Screens: S18 passcode in set and enter modes (creates the household with the passcode on first run), S19 forgot passcode with a reset behind a confirm, S03 add or edit kid with the live bracket line, six colour swatches, optional PIN (D31) and "Save and add another" (D34), S04 home with kid cards and the floating add action, S05 kid overview with the first-visit note, four section cards, the budget bar with its drawer on mobile and the budget card on desktop, and the warning card component.
4. Design review at 375px and desktop in the browser: first run from the passcode to the kid overview, the drawer, the home screen, a reload of the kid page (data persisted, passcode not asked again in the session). Critique applied: "Age 4" wording, 44px hit heights on the Edit and Got it buttons, the drawer's swipe handle.

Decisions and deviations:
- The base-nova Progress renders its own track; the indicator colour is set from the parent through a `[&_[data-slot=progress-indicator]]:` class, not a component change. Base UI adds a presentational helper span that page-text extractors read as "x"; it is invisible and ignored by screen readers.
- The household is created when the passcode is set (S18), one step before D35's "first kid save"; the difference is invisible to the parent.
- Routes: `/passcode`, `/passcode/forgot`, `/kids/new`, `/kids/[id]`, `/kids/[id]/edit`. Section cards link to `/kids/[id]/routine`, `/screen-time`, `/channels` and `/print`, which arrive in M6 to M10.

Check: lint, typecheck, format:check, 178 tests, build exit 0; demo step 1 walked at both widths. Proves: C1.2, C1.4, C5.3, C5.4 (screens), C7.1, C7.4; C1.3 in the browser. Status: closed.

## M6 — Routine and practices
Date: 2026-09-28

Steps taken (in order):
1. Routine module gained `insertBlock` (explicit times, refuses overlaps) and `gapsOf`; 179 tests.
2. S06 Routine: the day switcher (Tabs plus an actions menu: split weekdays, split weekend, copy this day to…, merge back), the mobile timeline of block cards with gap rows, the block editor as a Drawer on mobile and a Sheet on desktop (start, end, title, note, kind for custom blocks, the practice's why, remove), the "Removed: … Undo" line after a ripple (D45), the copy dialog with weekday toggles (D29), routine-related warnings under the timeline, and the desktop schedule grid with time rows by day-type columns (D44).
3. S07 Practices: seven domain tabs, selection tiles built on ToggleGroup with the title, duration, detail, why and a source link, already-added tiles disabled with a check, "Show all ages", and "Add (n selected)" placing each practice at the first gap or before sleep.
4. Design review in the browser: the mobile timeline, the block editor with the class-until-17:00 edit (pick-up and TV removed, named, undone), the practices tiles and the add flow (a practice landed at 18:45 before sleep), the desktop grid and the desktop practices layout. Fixes applied: stock tab triggers, bottom padding under the floating button, the tab strip hidden on desktop where column headers take its place, the practices add bar inline on desktop, headroom in the grid.

Decisions and deviations:
- The block form is keyed on its target instead of resetting state in an effect, to satisfy the React Compiler lint rule without touching generated code.
- Split and merge were verified by the module tests and the menu, not walked in the browser; J4's print step waits for M10.
- C1.1's timed run waits for M10 (print), as the dev plan allows.

Check: lint, typecheck, format:check, 179 tests, build exit 0; J3 walked at both widths. Proves: C2.5, C3.4 (screens). Status: closed.

## M7 — Screen time, warnings list, settings, sources
Date: 2026-09-28

Steps taken (in order):
1. S08 Screen time: the cap sentence with a why popover, one card per technology with the file's depth line (a leading "Same" resolved against the row above for display only), "opens at N" badges for closed technologies, television read-only with a link to channels, minutes and day toggles for games and school apps, inline warnings, the viewing log, a Save strip above the budget bar.
2. S17 Warnings: every visible warning grouped by kid then household, cards with the first fix as primary (D32) and dismiss, an "Open" link to the owning screen, the mute note.
3. S15 Settings: household name, hide all warnings, change passcode and "Lock now", demo clock with clear, load demo household and reset everything behind confirms, the Sources link.
4. S16 Sources: an accordion per practice file with the source links and the conflict rule.
5. Design review with the seed household: warnings list (five from the seed, with the refused "earlier" fix carrying its reason), dismiss (bell 5 to 4), Ella's screen time (30 minutes of games on Monday raised W01 and W02 at the field, the budget bar turned to the over state), mute (bell empty), desktop layouts of all three.

Decisions and deviations:
- D47 logged: the seed exposed that the file's separate ceilings for television, games and school apps exceed the global cap when stacked on one day, so a fresh 7-year-old on prefilled values raised ten warnings. Manual allowances now start at zero with the file's ceiling shown beside the field, and carry chosen days instead of a count. Model, accumulator, warnings, seed, tests, spec and domain model updated. Stored data from before this change does not load; the browser database was cleared, since no real users exist yet.
- The Next.js runtime overlay showed the crash from the old data shape; the record keeps it as the reason the model gained `days`.

Check: lint, typecheck, format:check, 180 tests, build exit 0; J5 and J13 walked at both widths. Proves: C2.2, C2.3, C2.4 (screens), C6.1 (through the demo clock control; the birthday walk waits for M12). Status: closed.
