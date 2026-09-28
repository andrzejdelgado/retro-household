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
