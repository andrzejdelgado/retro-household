# 07 — Dev plan
Date: 2026-09-28

## Inputs
- `PRD.md`, `docs/07-design-system.md`, `docs/05-domain-model.md`, `docs/06-screen-specs.md`, `docs/01-goals.md`, `PLAN.md` D01 to D44, the module sketch confirmed in Phase 4.

## Steps taken (in order)
1. Wrote the ground rules: definition of done, design in code with a review per screen, modules before screens, minimum code, one commit per milestone with CI on push, criteria as the finish line.
2. Fixed the project layout and a dependency list of nine rows with reasons (idb and fake-indexeddb are the only additions beyond the stack).
3. Ordered thirteen milestones M0 to M12: scaffold and shell; content, bracket and clock; storage and seed; routine and schedule; accumulator, warnings, conflicts and viewing; then seven screen milestones in journey order; then the demo pass and release.
4. Gave each milestone a check that can fail and a "proves" line. Mapped every criterion C1.1 to C8.2 to a milestone; C1.1 is timed provisionally at M6 and repeated at M10 once print exists.
5. Stated dependencies: linear, with M3 and M4 parallelisable.
6. Checked for open questions before M0: none; the Vercel connection is guided or deferred.
7. Wrote `process/07-dev-plan.md` (playbook) and this record. Committed and pushed.

## Decisions made
None new in the log. Build conventions recorded in `DEV-PLAN.md`: idb for storage, GitHub Actions for CI, commits on main per milestone.

## Outputs
- `DEV-PLAN.md`
- `process/07-dev-plan.md`
- `docs/log/07-dev-plan.md`

## Exit check result
Every milestone has a check that can fail. Every criterion maps to a milestone (C7.2, C7.3, C8.1, C8.2 in M12; the rest as listed). M0 has no open question. Passed, pending user review of the milestone order and the dependency list.

## What was learned
- Ordering screens by journey rather than by module produced milestones that each end in a demo step the user can watch, which is a better review unit than "the routine module is done".
