# 00 — Discovery
Date: 2026-09-28

## Inputs
- User brief in chat: product idea, audience (parents of children 0 to 8), stack, deployment, UX and UI intentions, request for a plan leading to a PRD and a dev plan, request to document the process for reuse.
- `best-parctices/household-major-rules.md`
- `best-parctices/household-tech-access-stages.md`
- `best-parctices/household-routine-elements.md`
- `best-parctices/household-rhythms.md`
- `best-parctices/parent-tech-concerns.md`
- `ui-inspration/retro-library.png`

## Steps taken (in order)
1. Listed every file in the folder. Confirmed the scope boundary (D01).
2. Read all five practice files in full and viewed the inspiration image.
3. Wrote a short summary of the material back to the user and named three tensions: three product layers mixed (planning, home control, hardware); no database plus OAuth; audience is parents, not kids.
4. Question batch 1 (6 questions): v1 scope, persistence and sync, meaning of "follow", research method, repo and tracker, UI reading. Stated assumptions: English, 24h, Monday-first, parent-only UI, mobile-first, print CSS, stricter rule for siblings.
5. User answered. Corrections received: inspiration is a style hint only; eight one-year brackets; TV app is kid-facing and launched on desktop; local database wanted; per-kid accounts; no stricter-rule-for-siblings.
6. Question batch 2 (6 questions): storage fork (browser-local vs home server), TV app packaging, TV content source, schedule shape and warnings, bracket binding, printable page structure. Stated assumptions: kid account is a profile, no parent PIN, OAuth dropped, bracket mapping, public repo.
7. User answered. New facts: warnings are dismissible per warning and globally; accumulator across all techs; schedules update on birthdays; per-kid PDFs; day types splittable Mon to Sun with clone.
8. Question batch 3 (4 questions): accumulator model, channel hours, day-split scope, PRD in git. Stated assumptions: npm, TypeScript, App Router, Vercel Hobby, derived content model, Sources page, channel picker with four tiles.
9. User answered. New facts: each kid has own four channels and a PIN; TV schedules are per kid on one shared TV; app must help split slots; PRD gitignored.
10. Question batch 4 (4 questions): tracking and enforcement, co-watching mechanic, conflict helper, storage consequence. Stated assumptions: under-3 channels warn but are not blocked, Escape returns to PIN screen.
11. User answered. New facts: TV stays off when budget is spent; co-watch via Cmd+K overlay chosen by the parent; defaults stagger kids and the app proposes solutions; single demo computer removes the sync problem.
12. Stated final consequences (content library as blobs, window edges, stagger defaults, games as manual allowance, demo keys) and the two documents to write. User added: stagger by pushing the next kid after the previous window, allow moving a younger kid an hour earlier if the routine permits, consoles will be counted over Wi-Fi by the future device.
13. Declared no questions left. Wrote `PLAN.md`, `process/README.md`, `process/00-discovery.md` (playbook) and this record.
14. User corrected: process files must be project-agnostic. Split the method (`process/`) from the record (`docs/log/`), folded the lessons into the playbook generically.

## Decisions made
D01 to D26, recorded in `PLAN.md` section 3.

## Outputs
- `PLAN.md`
- `process/README.md`
- `process/00-discovery.md` (playbook)
- `docs/log/00-discovery.md` (this record)

## Exit check result
The AI ran out of questions after four batches. Every user answer maps to a decision ID. Passed.

## What was learned
- Reading every input before the first question removed a whole round of questions. The tensions section did more work than the questions themselves: two of the three tensions changed the product (storage, audience).
- Each batch uncovered one fact that reshaped the model (per-kid channels, real viewing tracking, single demo device). Four batches were needed; stopping at two would have produced a wrong data model.
- Stating assumptions at the end of each batch let the user correct one (sibling rule) that was never asked about.


## What to change next time
Folded into `process/00-discovery.md` under Lessons.
