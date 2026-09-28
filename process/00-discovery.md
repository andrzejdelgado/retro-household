# 00 — Discovery (playbook)

## Purpose
Turn a product idea and its source material into a decision log the whole project can be checked against, before any plan, PRD or code exists. Discovery ends when the AI has no questions left, not when the user runs out of patience.

## Inputs
- The user's brief, in their own words.
- Every file the user points at (research, practices, inspiration, prior specs). All of it, in full.
- The user's stated constraints: stack, hosting, cost, deadline, scope boundary.

## Steps
1. List every file in the project folder. Confirm the scope boundary with the user.
2. Read every input completely. Do not ask a question that an input already answers.
3. Write back a summary of the material in a few lines, so misreadings surface at once.
4. Name the tensions between the inputs and between the inputs and the brief. Typical ones: several product layers mixed into one (pure software, integration, hardware); a stated stack element with no purpose under the stated constraints; an audience the brief names but the product cannot face.
5. Run question batches until none remain. Ask in the first batch, whatever the product:
   - Who uses each surface? Which surfaces face which users?
   - How and where will the result be demoed and deployed? On how many devices?
   - Where does data live, and does it have to move between devices or people?
   - Which of the mixed product layers is in this version?
   - How will user research be done: real users or desk research?
   - Where do the repo, tracker and documents live?
   - Locale: language, clock, first day of the week.
6. After each batch, state assumptions explicitly. Include assumptions about things not yet asked; users correct those too.
7. Record every answer as a numbered decision, phrased so it can be checked later. Mark which decisions came from a recommendation and which from the user.
8. Before declaring discovery closed, walk the full mental model end to end (every entity, every surface, every user flow) and check that each part is covered by a decision. Gaps become the last batch.
9. Declare no questions left. State the consequences of the last answers and the documents about to be written. Wait for go.
10. Write `PLAN.md` (product paragraph, principles, decision log, scope in and out, phases with exit checks, working protocol, risks) and `docs/log/00-discovery.md`.

## Outputs
- `PLAN.md` with a complete decision log.
- `docs/log/00-discovery.md`.

## Exit check
- The AI has no questions left.
- Every user answer maps to a decision ID.
- Every entity, surface and flow in the product has at least one decision covering it.

## Lessons
- Reading every input before the first question removes a whole round of questions. The tensions section does more work than the questions: tensions are where the product changes.
- The first batch should ask how the result will be demoed and who uses each surface. Both answers reshape architecture and are cheap for the user to give. Discovering them late costs a batch.
- Each batch tends to uncover one fact that reshapes the data model. Stopping after two batches produces a wrong model. Expect four.
- Stating assumptions about things never asked lets the user correct them without the cost of a question.
- Keep the method and the record apart from the first file. Mixing project content into the method makes the method unreusable.
