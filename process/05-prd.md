# 05 — PRD (playbook)

## Purpose

Fold everything discovery, goals, research and specs produced into one requirements document the build is measured against, without re-interviewing the user. The PRD is a synthesis, not a new source of decisions.

## Inputs

- The decision log, goals and criteria, personas, insights, journeys, domain model and screen specs.
- Any review or critique run on the specs, applied or not.
- The PRD template from the `to-prd` skill or the team's equivalent.

## Steps

1. Do not interview. Every question the PRD needs was answered in discovery; if one was not, that is a discovery gap to log, and the PRD states the assumption.
2. Sketch the modules before writing: prefer deep modules with a small, stable, browser-free interface that can be tested alone. Name each with the criteria it will prove. This sketch becomes the Implementation Decisions section and the spine of the dev plan.
3. Write the PRD in the template order: problem from the user's side, solution from the user's side, a long numbered list of user stories grouped by actor, implementation decisions without file paths or code, testing decisions naming what a good test is and which modules get tests, out of scope, further notes.
4. Write user stories from the journeys and screen specs, one per capability, with the benefit clause carrying the reason from the insights. Include stories for every actor the personas named, including readers of output and demo presenters.
5. Carry unapplied review findings into Further Notes as open questions with their IDs, so they are decided explicitly in later phases rather than lost.
6. Check every decision ID against the PRD. Each is reflected or explicitly superseded.
7. Publish where the project keeps requirements: the issue tracker if there is one, otherwise a root document handled as the decision log says. Ask the user to confirm the module sketch and which modules get tests, together with the PRD review, in one round trip.

## Outputs

- The PRD.
- `docs/log/05-prd.md`.

## Exit check

- The user approves the PRD.
- Every decision in the log is reflected or explicitly superseded.
- The module sketch and the test list are confirmed.

## Lessons

- Putting the module sketch and the test question inside the PRD draft, rather than asking first, saves a round trip and gives the user something concrete to react to.
- A test that checks the derived content model against the original source files turns the "defaults match the research" criterion into an automated guard rather than a manual audit.
