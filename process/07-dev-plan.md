# 07 — Dev plan (playbook)

## Purpose
Order the build so that every step ends in something that can be observed to pass or fail, so the team always knows what is done, and so the design work happens where the screens are made.

## Inputs
- PRD, design system, domain model, screen specs, goals and criteria, decision log.
- The module sketch confirmed at the PRD stage.

## Steps
1. Write the ground rules first: definition of done per milestone, how screens are designed and reviewed in code, modules before screens, minimum code, commit and CI conventions, and that the criteria are the finish line.
2. Fix the project layout and the dependency list with a reason per package. A package without a reason is not installed.
3. Order milestones: scaffold and shell; the deep modules with their tests, grouped by dependency; then screens in journey order, each milestone small enough to review in one sitting; then a final demo and release pass.
4. For each milestone write: scope (modules or screens), a check that can fail and names how it is observed (tests, a journey walked at each width, a print preview, a deployed URL), the criteria it proves, and whether a design review applies.
5. Map every criterion to at least one milestone. A criterion with no milestone is either missing a milestone or belongs in the final pass.
6. State the order and the dependencies between milestones, and which can run in parallel.
7. List open questions before the first milestone. If any exist, resolve them before closing the phase.
8. Commit and present. The build then follows the plan, one log entry per milestone.

## Outputs
- `DEV-PLAN.md`.
- `docs/log/07-dev-plan.md`.

## Exit check
- Every milestone has a check that can fail.
- Every criterion maps to a milestone.
- The first milestone can start without an open question.

## Lessons
- Putting the deep modules and their tests before any screen means the screens are thin and the demo cannot be broken by logic hidden in a component.
- A "proves" line per milestone keeps the criteria honest: the final pass then checks a list rather than rediscovering what was promised.
- Writing the dependency list with reasons up front prevents the build from acquiring packages by habit.
