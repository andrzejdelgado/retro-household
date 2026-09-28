# 01 — Repo and process
Date: 2026-09-28

## Inputs
- `PLAN.md`, decisions D01, D04, D22.

## Steps taken (in order)
1. Checked tooling: git 2.53, GitHub CLI 2.90 logged in as andrzejdelgado, Node 25.9, npm 11.12, git identity set globally, no default branch configured, folder not yet a repository.
2. `git init -b main`.
3. Wrote `.gitignore`: PRD.md, node_modules, .next, out, coverage, .env files, .DS_Store, editor folders, .vercel.
4. Staged and committed 11 files as "Discovery: plan, decision log, process playbooks, best-practice sources".
5. Stopped before publishing. Presented the `gh repo create` command, the proposed name `retro-household`, and what becomes public.
6. User ran the command. Public repository created at https://github.com/andrzejdelgado/retro-household, remote `origin` added, `main` pushed and tracking `origin/main`.
7. Wrote `process/01-setup.md` (playbook) and this record.

## Decisions made
None new. D22 executed (public repo, PRD gitignored).

## Outputs
- https://github.com/andrzejdelgado/retro-household
- `.gitignore`
- `process/01-setup.md`
- `docs/log/01-setup.md`

## Exit check result
`git remote -v` shows origin. `main` tracks `origin/main`. `PRD.md` is ignored. Passed.

## What was learned
- The GitHub CLI was already logged in, so the walkthrough needed one command rather than a web flow. Checking first saved the user a detour.
