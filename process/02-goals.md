# 02 — Goals and success criteria (playbook)

## Purpose

Turn the decision log into goals the product must reach and criteria that can each be checked at the end, so later phases (specs, design, dev plan, tests) have something concrete to point at and the project knows when it is done.

## Inputs

- `PLAN.md` with a closed decision log.
- The source material the product is built on.
- The discovery record, for the tensions that shaped the product.

## Steps

1. Write one goal per outcome the product must deliver for its users. Keep to fewer than ten. Each goal is a sentence about the user's result, not a feature.
2. Add one project-level goal if the project has a non-product deliverable (a reusable method, a case study, a dataset).
3. Under each goal, write criteria in a table with an ID (C<goal>.<n>), the criterion, and how it is checked. Every criterion must be able to fail. "Works well" is not a criterion; "completes in under N minutes without help" is.
4. Name the check method from a short fixed list: timed run, checklist walk, unit test, visual or print preview, device-mode check, audit against a document, search. If no method fits, the criterion is not checkable yet; rewrite it.
5. List the non-goals explicitly, taken from the scope-out section of the plan. Non-goals prevent scope creep in the phases that follow.
6. Write the demo or acceptance path: the ordered steps a reviewer follows at the end, each naming the criteria it exercises. A criterion that no step exercises is either missing from the path or not worth keeping.
7. Check that every decision in the log is served by at least one criterion. Decisions with no criterion are either non-goals or missing criteria.
8. Commit, then present the document for review before the next phase.

## Outputs

- `docs/01-goals.md`.
- `docs/log/02-goals.md`.

## Exit check

- Every goal has at least one criterion.
- Every criterion names a check method and can fail.
- Every step of the demo path names at least one criterion, and every criterion appears in at least one step or is a test-only criterion.

## Lessons

- Numbered criteria pay for themselves immediately: screen specs, tests and milestones can all cite them, which makes traceability a lookup instead of a judgement.
- Writing the demo path exposes criteria that sound right but cannot be shown. Write it in the same session as the criteria, not later.
