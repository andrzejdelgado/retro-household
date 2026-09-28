# Retro Household — Plan

Date: 2026-09-28. Status: discovery closed, plan approved pending review.

This document leads from the idea to a PRD and then to a dev plan. It records every decision taken during discovery so nothing is re-litigated later. The reusable, project-agnostic method lives in `process/`. The record of each phase lives in `docs/log/NN-*.md`.

## 1. Product in one paragraph

Retro Household is a parent-facing web app for households with children aged 0 to 8. Parents set up routines, household rules, Wi-Fi hours and a scheduled TV programme, drawing on a built-in library of best practices or writing their own. Routines and rules print to one-page PDFs for the fridge. A kid-facing TV app plays each child's channels like 1990s broadcast television: shows run on a clock, nothing waits, and outside the schedule there is calmly nothing to watch. A screen-time accumulator keeps the total planned screen time per child visible against the recommended cap at all times. The physical device (phone box, landline handset, Wi-Fi control, console counting) comes later and reuses this software.

## 2. Operating principles

1. Don't assume, don't hide confusion, surface tradeoffs. Questions go to the user in batches before work starts.
2. Minimum code that solves the problem. No speculative features or abstractions.
3. Touch only what you must.
4. Define success criteria, loop until verified, then stop.
5. Forgiving UX. Every conflict the app detects comes with a warning and a proposed fix. Warnings can be dismissed per warning or globally.
6. Clean, clear, uncluttered, sleek UI built from shadcn/ui components used orthodoxly. Customisation is allowed only where it improves UX, decided case by case and logged.

## 3. Decision log

| ID | Decision |
|---|---|
| D01 | All work happens inside the `Retro Household` folder. Nothing outside it is read or written. |
| D02 | Product name is Retro Household. |
| D03 | v1 is software only. The TV app is designed as a kid-facing app and launched as a full-screen route in the same web app on the desktop. The physical device and a native TV app come later from this work. |
| D04 | Stack: React, Next.js (App Router, TypeScript), Tailwind, shadcn/ui, Prettier, Vitest, GitHub, Vercel. npm. OAuth is deferred until sync needs identity. |
| D05 | Storage is browser-local (IndexedDB), behind one small storage interface so a home server with a local database file can replace it later. No external database, no cost. |
| D06 | v1 demos on one computer. Mobile layouts are checked through the browser's device mode. No cross-device sync in v1. |
| D07 | Parent app is designed mobile-first, then desktop. The TV app is the only kid-facing surface. |
| D08 | Eight one-year age brackets: 0-1, 1-2, 2-3, 3-4, 4-5, 5-6, 6-7, 7-8. Best-practice content written in wider brackets is mapped onto these. A child's bracket is computed from birthdate and everything depending on it updates automatically on the birthday or when the parent edits routines, schedules or rules. |
| D09 | Kid profile: name, birthdate, 4-digit PIN for the TV app. No login for anyone. No parent PIN in v1. |
| D10 | Each kid's tech privileges are independent. No "stricter rule wins" for siblings. |
| D11 | v1 features: (1) routines per kid with printable one-page PDF per day type, (2) Wi-Fi hours, (3) TV schedule with up to 4 channels per kid, each channel with a start and end time, (4) household major rules with a printable rules page that also carries Wi-Fi hours and TV hours. |
| D12 | Day types default to weekday and weekend day. A parent can split into Monday to Sunday and clone one day onto another. Routines and TV schedules are per kid; Wi-Fi hours are household-level. |
| D13 | Screen-time accumulator: planned allowances per kid per technology (long-form TV, games, school apps), prefilled from the tech stages file, summed and shown against the child's daily and weekly cap at all times. Weekly cap wins. Warnings cover daily cap, weekly cap, days per week, and "never two days in a row" for 3 to 5. |
| D14 | Warnings never block. They can be dismissed per warning or globally in Settings. |
| D15 | TV app flow: PIN screen, channel picker with up to 4 tiles (off-air tiles dimmed and labelled off), playback with broadcast semantics (position derived from the wall clock), off-air screen with a calm animation and no countdown. When a kid's budget is spent the TV stays off for that kid until the next day. |
| D16 | Co-watching: Cmd+K dims the content and opens an overlay where the parent selects which other kids are watching. From that moment watched minutes are deducted from every selected kid's budget. The TV app keeps a viewing log per kid per day. |
| D17 | Conflict helper: one TV set. The parent app shows a household TV timeline with every kid's windows. Defaults stagger kids: the youngest starts at the rhythm's screen slot and each next kid follows after the previous window ends. When a window crosses dinner or bedtime, or the routine (school, pick-up) forbids it, the app warns and proposes an alternative: move a younger kid one hour earlier if the routine allows, or mark a together slot. |
| D18 | Content library: the parent adds video files through a file picker. Files are stored as blobs in IndexedDB with duration read from metadata. The scheduler never places a show that would be cut by the window end. |
| D19 | PDFs are produced with a print stylesheet. No PDF library unless print CSS proves insufficient. |
| D20 | UX research is desk research with proto-personas built from `parent-tech-concerns.md`. It produces user journeys and written screen specs. |
| D21 | The inspiration image is a style hint only, not a UX or object model. |
| D22 | PRD lives in `PRD.md` at the root and is gitignored. The repo is public on GitHub and set up step by step with the user. |
| D23 | Locale: English UI, 24-hour clock, Monday-first week. |
| D24 | The five best-practice markdown files stay untouched. A structured content file inside the app is derived from them. Each default practice carries a one-line why, and sources appear on an in-app Sources page. |
| D25 | Games: in v1 a manual allowance. The future device counts console time over Wi-Fi automatically. The data model marks each allowance as manual or device-reported from the start. |
| D26 | Demo controls: mouse and keyboard for PIN entry, arrows and Enter as remote, Escape back to the PIN screen, Cmd+K for co-watch. A "load demo household" action seeds a household. |

## 4. Scope

In v1: everything in D11 to D19, plus kid profiles, settings, Sources page, demo seed.

Out of v1: OAuth and accounts, cross-device sync, home server, physical device, phone box and landline, Wi-Fi enforcement, console time counting, native TV app, actual-usage tracking outside the TV app, kid-facing anything other than the TV app.

Roadmap, not v1: a read-only "what opens next" view per child (next bracket, its date, what changes), proposed by insight I12 and parked on 2026-09-28.

## 5. Phases

Each phase has inputs, outputs and an exit check. A phase closes when the exit check passes and its `docs/log/NN-*.md` record is written.

### Phase 0 — Repo and process
- Inputs: this plan.
- Steps: `git init`, `.gitignore` (PRD.md, node_modules, .next, .env*), public GitHub repo created with the user step by step, first commit of docs, process playbooks and practice files.
- Outputs: repo on GitHub, `docs/log/01-setup.md`, `process/01-setup.md` playbook.
- Exit check: `git remote -v` shows the GitHub origin and the first push succeeded.

### Phase 1 — Goals and success criteria
- Inputs: discovery log, practice files.
- Steps: write product goals, non-goals, and measurable success criteria for v1 (for example: a parent with two kids reaches a printed weekday routine in under 10 minutes without reading help; no state in the app can be reached where a warning has no proposed fix).
- Outputs: `docs/01-goals.md`, `docs/log/02-goals.md`.
- Exit check: every goal has at least one criterion that can be checked in the demo.

### Phase 2 — UX research (desk)
- Inputs: `parent-tech-concerns.md`, the other four files, goals.
- Steps: build 3 proto-personas from the concerns and household types (one kid under 3, two kids 3 to 8, three kids spread), list their jobs to be done, map concerns to product responses, write insights.
- Outputs: `docs/02-personas.md`, `docs/03-insights.md`, `docs/log/03-ux-research.md`.
- Exit check: every v1 feature in D11 traces to at least one insight, and every insight traces to a source in the practice files.

### Phase 3 — Journeys, domain model, screen specs
- Inputs: personas, insights, decision log.
- Steps: map user journeys (first setup, add a kid, build a routine, set TV schedule and resolve a conflict, print, kid uses TV, co-watch), define the domain model (household, kid, bracket, day type, routine block, practice, rule, allowance, channel, show, viewing log, warning), write a spec per screen with states, empty states, warnings and fixes.
- Outputs: `docs/04-journeys.md`, `docs/05-domain-model.md`, `docs/06-screen-specs.md`, `docs/log/04-ux-specs.md`.
- Exit check: every journey step points at a screen spec, and every screen spec lists its warnings and their proposed fixes.

### Phase 4 — PRD
- Inputs: everything above.
- Steps: run the `to-prd` skill to synthesise the PRD without re-interviewing, save as `PRD.md` (gitignored, D22).
- Outputs: `PRD.md`, `docs/log/05-prd.md`.
- Exit check: the user approves the PRD, and every decision D01 to D26 is either reflected or explicitly superseded in it.

### Phase 5 — Design system and screens
- Inputs: PRD, screen specs, inspiration image as a style hint.
- Steps: define design tokens (colour, type, spacing, radius) as a shadcn theme, list which shadcn components each screen uses, log every customisation with its UX reason, design mobile screens first then desktop. Screens are defined as written short specs in the repo, with ocassinal low-fi image as guide.
- Outputs: `docs/07-design-system.md`, static screen pages, `docs/log/06-design.md`.
- Exit check: every screen spec has a mobile and a desktop specs, and the customisation log has no entry without a reason.

### Phase 6 — Dev plan
- Inputs: PRD, designs, domain model.
- Steps: order the build into milestones each with a verifiable check (tests in Vitest, a demo step, or a build passing), starting with scaffold, storage interface, content model and accumulator logic, then parent screens, then TV app, then print.
- Outputs: `DEV-PLAN.md`, `docs/log/07-dev-plan.md`.
- Exit check: every milestone has a check that can fail, and the first milestone can start without any open question.

### Phase 7 — Build
Governed by `DEV-PLAN.md`. Each milestone closes with its check passing and a short log entry in `docs/log/08-build.md`.

## 6. Working protocol

- Questions go to the user in batches of 3 to 6 before any phase starts, each with a recommendation. Assumptions are stated explicitly and stand unless objected to.
- Every decision gets a D-number in this file the moment it is made.
- Every phase writes its record to `docs/log/` before the next one starts. Method lessons go to the matching playbook in `process/`, phrased generically.
- Nothing is built before the PRD exists.
- The user says go between phases.

## 7. Risks and open points

- The routine tables in the practice files assume a 16:00 Nordic pick-up. Journeys must allow later pick-ups without breaking the TV window logic.
- The 0 to 1 and 1 to 2 brackets have no screen budget, so the TV features mostly hide for them. The UI must make that feel intentional, not empty.
- Video blobs in IndexedDB have browser-specific quotas. Demo clips should be short.
- Print CSS output differs across browsers. The print check happens in the demo browser.
