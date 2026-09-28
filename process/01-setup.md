# 01 — Repo and process (playbook)

## Purpose

Put the project under version control on a public remote before any research or code, so every later phase leaves a traceable history and the method folder travels with the project.

## Inputs

- `PLAN.md` with a closed decision log.
- The user's hosting decisions: repo host, visibility, tracker (or none).
- The list of files that must stay local (from the decision log).

## Steps

1. Check tooling in one pass: version control client, host CLI and its login state, runtime and package manager versions, committed identity (name, email), default branch setting. Report the result before acting.
2. Initialise the repository on the agreed default branch.
3. Write the ignore file before the first add. Include: documents that must stay local, dependencies, build output, environment files, OS and editor files, hosting state.
4. Stage everything, show the staged list, commit once with a message naming the phase.
5. Stop before creating the remote. Creating a public repository publishes content, so it needs an explicit yes. Present the exact command, the proposed name, and what becomes public.
6. The user runs the command or says yes. Verify the remote and the tracking branch afterwards.
7. Write this phase's record and, if a tracker was chosen, note where the PRD will publish.

## Outputs

- Repository on the remote with the first commit pushed.
- `docs/log/01-setup.md`.

## Exit check

- `git remote -v` shows the origin.
- The default branch tracks its remote counterpart.
- The ignore file excludes every document the decision log marks as local.

## Lessons

- Check tooling before proposing steps. A logged-in host CLI turns repo creation into one command, and knowing that shapes the walkthrough.
- Separate the local steps (reversible, run at once) from the publishing step (outward-facing, needs a yes). Users who asked to be walked through want to see the command, not only the result.
