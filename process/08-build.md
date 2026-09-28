# 08 — Build (playbook)

## Purpose
Turn the dev plan into working software one milestone at a time, with each milestone observed to pass before the next starts, and each screen designed in the code it ships in.

## Inputs
- The dev plan with its milestones, checks and criteria mapping.
- The design system, screen specs, domain model and decision log.
- A fresh checkout with the toolchain the plan names.

## Steps
1. Read the framework's own current guide before writing a line of code when it ships one; a framework a year newer than the model's training data breaks assumptions about types, conventions and file layout.
2. Scaffold into a temporary subfolder when the root already holds documents, then move the files up; merge the ignore file by hand.
3. Set tokens, fonts and the shell first, then one passing test, then continuous integration on every push. Read the build's exit code, never a grep of its output; the first broken build went unnoticed for one commit because a pipeline hid the status.
4. Build the deep modules with their tests before any screen that uses them. A test that checks derived data against its source documents turns "defaults match the research" into a guard.
5. For each screen milestone: build from the design system, walk the journey in the browser at the phone width and at desktop, run the design critique, apply what it finds, log any customisation with its ladder justification, then record. Use the seeded data for cases the demo persona cannot reach.
6. When a walk exposes a model flaw, fix the model and log a decision with the finding as its source, rather than patching the screen.
7. Keep stored data honest during development: when the model changes shape, either migrate or clear, and say which in the record.
8. Close each milestone with a record entry: steps in order, decisions and deviations, the checks with their results, the criteria proved, status.
9. The last milestone walks the full demo path, runs the accessibility and UX audits, checks every criterion against evidence, and confirms the deployment.

## Outputs
- Working software on the main branch, deployed.
- One record entry per milestone in `docs/log/`.

## Exit check
- Every milestone's check was observed to pass.
- Every criterion has evidence in the record.
- The deployment serves the last commit.

## Lessons
- Exact-string patches fail after a formatter has wrapped the code; patch with whitespace-tolerant matches or rewrite the file, and verify with a search before moving on.
- Strict compiler lint rules (no state set synchronously in effects, no ref access or clock reads in render) shape component structure: key a form on its target instead of resetting state, do work in event handlers, and put a live clock in an interval.
- A component library's portal renders outside a themed wrapper; theme the document root while the route is mounted.
- Drive keyboard behaviour by dispatching events in the page when the automation's keystrokes do not reach an unfocused document.
- The deployed URL is a test environment in its own right: an empty browser found a loading state that never ended.
- Generated components are used as shipped; a compact button height becomes a token-mapped class, not a source edit, and the customisation log stays empty.
