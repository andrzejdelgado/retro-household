# 03 — UX research, desk method (playbook)

## Purpose

Ground the product in who uses it and why before any screen exists, using published research and the project's own source material when interviews are not available. Produce personas the team can argue with and insights each feature can be traced to.

## Inputs

- The source material (research summaries, practice documents, survey findings) the product is built on.
- `PLAN.md` decision log and `docs/01-goals.md`.
- The household or organisation types the product must serve, from the decision log.

## Steps

1. Pick the persona set to cover the product's regimes, not its demographics. One persona per regime where the product behaves differently (for example: no budget at all, the demo case, the complexity case). Three is usually enough.
2. For each persona write: household or context, the source concerns or findings it is built from, what they want in their words, jobs to be done, pains, and "what must be true for them". Name the persona used for the demo.
3. Add secondary readers: people who consume the product's output without using the product. Add the non-user user if one exists (a child, a customer of the customer) with what their abilities allow.
4. Write insights as a table: ID, the insight, the evidence with file and section, the implication for the product, and what it serves (features, decisions, criteria). An insight with no evidence is an opinion; an insight with no implication is trivia. Drop both.
5. Build a feature coverage table: every feature in the decision log against the insights that support it. A feature with no insight is either unjustified or missing an insight.
6. When research suggests something not in the decision log, write it as a proposed addition in its own section and ask for a decision. Do not slip it into the specs.
7. Label the whole thing as proto: hypotheses to be corrected by real interviews later.
8. Commit and present for review.

## Outputs

- `docs/02-personas.md`.
- `docs/03-insights.md`.
- `docs/log/03-ux-research.md`.

## Exit check

- Every feature in the decision log traces to at least one insight.
- Every insight names its evidence in a source file.
- Any proposed addition is listed separately and awaits a decision.

## Lessons

- Choosing personas by product regime rather than by demographics produced households that exercise different code paths, which the specs and tests can reuse directly.
- Writing "what must be true for them" per persona turned into acceptance conditions almost verbatim.
- The insights table's "serves" column is where traceability lives. Fill it while writing each insight, not afterwards.
