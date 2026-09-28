# Retro Household — Dev plan

Date: 2026-09-28. Inputs: `PRD.md`, `docs/07-design-system.md`, `docs/05-domain-model.md`, `docs/06-screen-specs.md`, `docs/01-goals.md`, `PLAN.md` (D01 to D44). Governs Phase 7. Each milestone has a scope, a check that can fail, the criteria it proves, and closes with a short entry in `docs/log/08-build.md` and a commit.

## Ground rules for the build

- **Definition of done per milestone.** Tests green, `npm run build` green, the milestone's check observed, screens reviewed at 375px and desktop against their spec, design notes and reference template, and the log entry written. Nothing is "done" on intent.
- **Design in code.** A screen milestone builds from the design system, then runs a design review: walk the spec's states, compare with the design note and the reference in `docs/07-design-system.md` §9, run the design critique, fix, and log any customisation with its ladder justification. Expected customisations: none.
- **Modules before screens.** The eight deep modules ship with their tests before the screens that use them. Screens never contain domain logic.
- **Minimum code.** No abstraction for a single use. No feature outside the PRD. No dependency without a line in this file saying why.
- **One commit per milestone on `main`**, with the milestone ID in the message. CI runs lint, tests and build on every push.
- **Criteria are the finish line.** The last milestone is the demo path in `docs/01-goals.md` walked end to end, with every criterion checked off.

## Project layout

```
src/
  app/                 Next.js App Router
    (parent)/          parent app routes, shared layout with sidebar, top bar, tab bar
    tv/                TV app route, dark theme, no parent layout
    print/             print pages rendered for S14
  components/ui/       shadcn components, installed as shipped
  components/          shared product components (budget bar, warning card, tiles, grids)
  content/             static content model derived from best-parctices (build-time data)
  lib/
    bracket/ clock/ routine/ schedule/ accumulator/ warnings/ conflicts/ viewing/
    storage/ media/ print/ seed/
  test/                fixtures: demo household (Selena 1, Simona 4), seed household (2, 4, 7)
```

## Dependencies and why

| Package                                                              | Why                                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| next, react, typescript, tailwindcss                                 | Stack (D04)                                                                              |
| shadcn/ui components via the CLI, lucide-react                       | Stack (D04); icons the library ships with                                                |
| next/font/google (Geist, Fraunces)                                   | Typography (D39); both are on Google Fonts, so no `geist` package                        |
| @base-ui/react, class-variance-authority, tw-animate-css, cn, shadcn | Installed by `shadcn init` for the base-nova style; the component sources depend on them |
| idb                                                                  | A thin promise wrapper over IndexedDB; keeps the storage module small                    |
| fake-indexeddb (dev)                                                 | Storage tests without a browser                                                          |
| vitest (dev)                                                         | Tests (D04)                                                                              |
| prettier, prettier-plugin-tailwindcss (dev)                          | Formatting (D04)                                                                         |
| eslint with the Next config (dev)                                    | Comes with the scaffold                                                                  |

Nothing else without a row here.

## Milestones

### M0 — Scaffold and shell

Scope: Next.js App Router in TypeScript, Tailwind, shadcn init with the tokens from the design system (parent light theme, TV dark theme on the `/tv` root), Geist and Fraunces through next/font, Prettier, Vitest with one passing test, ESLint, a GitHub Actions workflow running lint, test and build on push. The parent layout with sidebar (desktop), bottom tab bar and top bar with a bell (mobile), four empty routes, and an empty `/tv` route. Vercel project connected to the repository, walked through with the user; if deferred, it moves to M12.
Check: `npm run lint`, `npm test`, `npm run build` all green locally and in CI; the deployed URL shows the shell at phone and desktop width.
Proves: nothing yet; enables C7.1.

### M1 — Content, bracket, clock

Scope: the content module derived from the five practice files: brackets, caps, tech stages per technology per one-year bracket, practices with why and source, rhythm templates, major rules, sources. The bracket module (age, bracket, next bracket date, the 8th-birthday edge). The clock module with the demo override.
Check: a test parses every table in the five markdown files and compares each value with the content module for all eight brackets; bracket tests around birthdays with a mocked clock. All green.
Proves: C2.1, C6.1 (logic).

### M2 — Storage, household state, seed

Scope: the storage interface (load, save, blobs) with the IndexedDB implementation and an in-memory implementation for tests; the household provider that loads once, saves on every change, and exposes the household to screens; the seed module with the three-kid household and short demo clips referenced by name; reset.
Check: a round-trip test through fake-indexeddb for every entity including a blob; in the browser, a change survives a reload.
Proves: C1.3 (mechanism).

### M3 — Routine and schedule

Scope: the routine module: apply a template per bracket and day type, split, copy by re-pointing (D29), merge, block edits with the ripple rule (D28), the single-screen-block invariant, keep edited blocks across a bracket change. The schedule module: layout from the window start, refusal of a show that crosses the window end, now-playing offset, per-weekday default days per bracket, one programme with vary-by-day (D30).
Check: tests for split, copy, merge, ripple including the sleep anchor refusal, template refresh on a birthday; layout and now-playing tests with a mocked clock. All green.
Proves: C3.4, C4.1, C4.2, C6.2 (logic).

### M4 — Accumulator, warnings, conflicts, viewing

Scope: planned minutes per weekday and week, days used, consecutive pairs, budget left from a viewing log with the weekly cap winning; the warning catalogue W01 to W12 with fixes as pure transformations, dismissals and the global mute as a filter; the conflict module with the stagger, earlier and together proposals checked against routine constraints and carrying refusal reasons; the viewing module writing seconds to host and co-watchers and rolling up.
Check: one test per warning proving it triggers on its condition and not otherwise, and that each fix removes it or names the warning it raises; accumulator tests for every bracket including the zero cap; two-kid and three-kid stagger tests with a refused proposal; co-watch logging test. All green.
Proves: C2.3, C2.4, C4.5, C5.1, C5.2, C5.5 (logic).

### M5 — First run to kid overview

Screens: S18 Passcode (set and enter modes), S19 Forgot passcode, S03 Add or edit kid, S04 Home, S05 Kid overview with the first-visit line, the budget bar and sheet, the demo clock banner.
Check: the demo path step 1 walked at 375px and desktop; a new browser session asks for the passcode; a kid with a birthdate 5 years ago shows bracket 5 to 6 live; the under-3 variant of S05 renders; design review passed for each screen.
Proves: C1.2, C1.4, C5.3, C5.4 (screens), C7.1, C7.4.

### M6 — Routine and practices

Screens: S06 Routine with the day switcher, timeline, block sheet, split, copy, merge; S07 Practices with selection tiles and "Add (n selected)"; the desktop schedule grid.
Check: journey J3 and J4 walked at both widths; the timed run for C1.1 with kids aged 1 and 4 reaching a printed weekday routine in under 10 minutes (print via M10's page, or the preview if M10 is not yet built, in which case the timing is repeated at M10); design review passed.
Proves: C1.1 (provisional), C2.5, C3.4 (screens).

### M7 — Screen time, warnings list, settings

Screens: S08 Screen time with inline warnings, S17 Warnings behind the bell, S15 Settings with the global mute, passcode change, lock now, demo clock, load demo household, reset; S16 Sources.
Check: journeys J5 and J13 walked; a warning dismissed on S08 disappears from S17 and stays hidden after reload; the global switch hides every warning while the budget bar keeps its numbers; design review passed.
Proves: C2.2, C2.3, C2.4 (screens), C6.1 (through the demo clock).

### M8 — Library and channels

Screens: S12 Library with category and age filters, the add dialog and drawer, media import (duration, poster, blob), S09 Channels with the inline PIN ask, S10 Channel editor with the layout preview, vary by day, and the no-slot or zero-cap state, S20 Household channels.
Check: journey J6 walked with four short clips; a 20-minute show is refused by a 27-minute remainder with W10; Selena's channel raises W05 and saves; S20 shows on-air and off-air correctly under the demo clock; design review passed.
Proves: C4.2 (screen), C4.4 (parent side), C5.4.

### M9 — TV timeline

Screens: S11 with the mobile track and the desktop grid, W09 cards with three fixes and refused fixes carrying their reason, together acknowledgement.
Check: journey J7 walked with the two-kid demo household and the three-kid seed; applying stagger raises W06 and its fix clears it; design review passed.
Proves: C5.5 (screen).

### M10 — Rules, Wi-Fi, print

Screens: S13 Rules as selection tiles with custom rules and the bracket range picker, Wi-Fi off windows, S14 Print with the page picker and preview, the print pages and stylesheet.
Check: journey J8 walked; print preview in the demo browser shows one page per day type and one rules page on A4 and Letter, nothing from the UI on paper, no text under 12pt, the overflow line on an overstuffed day; the C1.1 timing repeated end to end; design review passed.
Proves: C3.1, C3.2, C3.3, C3.4, C1.1.

### M11 — TV app

Screens: T01 PIN with the numpad, T02 Picker, T03 Playback with broadcast semantics and the viewing log, T04 Off-air with the reduced-motion variant, T05 Co-watch overlay opened by Cmd+K and automatically inside an acknowledged overlap (D33); budget enforcement to off-air; Escape and arrows.
Check: journeys J9 and J10 walked under the demo clock: tune in at 17:08 lands 8 minutes into the show; the window end and a spent budget both show T04; wrong PIN clears calmly; co-watch deducts from both logs; keyboard only reaches every screen; design review passed.
Proves: C4.1, C4.3, C4.4, C4.5, C4.6, C4.7.

### M12 — Demo pass and release

Scope: the full demo path in `docs/01-goals.md` walked on one computer, mobile width through device mode; the accessibility audit (C7.3); the audit of interactive elements against the design system (C7.2); the UX eval in code mode at 375px on J1 and J3 with the keyboard open, and its fixup; the process search for project terms (C8.1); the file listing for playbooks and records (C8.2); Vercel deployment current.
Check: every criterion C1.1 to C8.2 marked passed with its evidence in `docs/log/08-build.md`; the deployed URL runs the demo path.
Proves: everything.

## Order and dependencies

M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12. M3 and M4 depend only on M1 and M2 and may be built in parallel. Screen milestones M5 to M11 each depend on the modules before them and on M0's shell; M9 depends on M8's channels; M11 depends on M8 and M4.

## Open questions before M0

None. The first milestone starts without a decision pending. The Vercel connection needs the user's account and is guided during M0 or deferred to M12.
