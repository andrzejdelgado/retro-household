# 05 — PRD
Date: 2026-09-28

## Inputs
- `PLAN.md` D01 to D26, `docs/01-goals.md` to `docs/06-screen-specs.md`, the five practice files, the UX eval run (findings U1 to U16, not applied).

## Steps taken (in order)
1. Invoked the `to-prd` skill. No issue tracker, so the PRD lands in `PRD.md` at the root, gitignored per D22.
2. Sketched 14 modules: content, bracket, clock, routine, schedule, accumulator, warnings, conflicts, viewing, media, print, seed, parent app UI, TV app UI. Eight are deep, browser-free and testable alone.
3. Wrote the PRD: problem, solution, 65 user stories across six actors (parent setting up, parent at the TV, second parent and carers, child, presenter), implementation decisions, testing decisions, out of scope, further notes.
4. Carried the UX eval's two High findings and four tensions into Further Notes as open questions for Phases 5 and 6.
5. Checked D01 to D26 against the PRD. All reflected, none superseded.
6. Wrote `process/05-prd.md` (playbook) and this record. Committed and pushed; `PRD.md` itself is not in git.

## Decisions made
None new in the log. The user confirmed the module sketch and the test list (content, bracket, routine, schedule, accumulator, warnings, conflicts, viewing in Vitest; UI, media, print and storage verified by the demo path).

## Outputs
- `PRD.md` (local only)
- `process/05-prd.md`
- `docs/log/05-prd.md`

## Exit check result
User approved the PRD, the module sketch and the test list on 2026-09-28, and asked for the UX eval findings to be applied; they were applied as D27 to D37 and the PRD was synced. Passed.

## What was learned
- The user-story list surfaced two actors the specs served but never named as actors: the presenter and the parent standing at the television. Both got stories.
