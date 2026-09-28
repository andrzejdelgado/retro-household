# Process — a reusable method for AI-assisted product work

This folder is project-agnostic. It holds the method only: one playbook per phase, plus the protocols that apply to every phase. Copy the folder into a new project as is. Project-specific records (what happened, what was decided, on which date) never go here; they go to `docs/log/NN-<phase>.md` in the project that produced them.

## Folder layout

```
process/            method, reusable, no project content
  README.md         this file: phases, protocols, templates
  00-discovery.md   playbook for discovery
  NN-<phase>.md     one playbook per further phase, added as phases are run for the first time
docs/log/           project records, one file per phase, written as the phase closes
PLAN.md             the project's plan and decision log
PRD.md              the project's PRD
DEV-PLAN.md         the project's build milestones
```

## The shape of a project

| Phase | Name | Produces | Closes when |
|---|---|---|---|
| 0 | Discovery | Decision log, plan | The AI has no questions left and the user says go |
| 0 | Repo and process | Public repo, `process/` and `docs/log/` in place | First push succeeds |
| 1 | Goals | Goals, non-goals, success criteria | Every goal has a checkable criterion |
| 2 | UX research | Personas, insights | Every feature traces to an insight, every insight to a source |
| 3 | Journeys and specs | Journeys, domain model, screen specs | Every journey step points at a screen, every screen lists its warnings and fixes |
| 4 | PRD | PRD | User approves; every decision is reflected or superseded |
| 5 | Design | Tokens, component inventory, screens | Every screen has mobile and desktop; every customisation has a reason |
| 6 | Dev plan | Ordered milestones with checks | Every milestone has a check that can fail |
| 7 | Build | Working software | Each milestone's check passes |

## Protocols

### Question protocol
1. Read every input file completely before asking anything.
2. Summarise what was read in a few lines so the user can correct misreadings.
3. Name the tensions found between inputs. Do not resolve them silently.
4. Ask 3 to 6 questions per batch. Each question carries a recommendation. Only ask what changes the work materially.
5. State assumptions explicitly at the end of every batch. An assumption stands unless the user objects.
6. Repeat until the AI has no questions. Then say so plainly and wait for go.

### Decision protocol
- Every decision gets an ID (D01, D02, ...) in `PLAN.md` the moment it is made, phrased so it can be checked later.
- A superseded decision stays in the log with a note pointing to its replacement. Nothing is deleted.
- Recommendations in questions are marked as such, so the log distinguishes what the user chose from what the AI suggested.

### Scope protocol
- One folder is the boundary. Nothing outside is read or written.
- Source material stays untouched. Derived artefacts live next to it, never over it.
- Scope is fixed in the decision log. Features not in the log are out until the log changes.

### Phase protocol
- Each phase has inputs, steps, outputs and an exit check written before the phase starts.
- A phase is closed by writing `docs/log/NN-<phase>.md` with the template below.
- If running a phase teaches something about the method, the lesson goes into that phase's playbook here, phrased generically. The project detail that taught it stays in the log.
- The user says go between phases.

### Operating principles (Karpathy)
- Don't assume, don't hide confusion, surface tradeoffs.
- Minimum code that solves the problem.
- Touch only what you must.
- Define success criteria, loop until verified, then stop.

## Templates

### Playbook (`process/NN-<phase>.md`)

```
# NN — <Phase name> (playbook)
Purpose:
Inputs:
Steps:
Outputs:
Exit check:
Lessons:
```

### Phase record (`docs/log/NN-<phase>.md`)

```
# NN — <Phase name>
Date:
Inputs:
Steps taken (in order):
Decisions made (IDs):
Outputs:
Exit check result:
What was learned:
```
