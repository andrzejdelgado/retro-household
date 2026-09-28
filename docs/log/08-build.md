# 08 — Build

One entry per milestone of `DEV-PLAN.md`, written when the milestone closes.

## M0 — Scaffold and shell
Date: 2026-09-28

Steps taken (in order):
1. Scaffolded Next.js 16.3 (App Router, TypeScript, Tailwind 4, ESLint, `src/`) into a temporary subfolder, since the root already held documents, and moved it up. Merged the gitignore.
2. Read the bundled Next.js 16 guides before writing code, as its agent file asks; `LayoutProps<"/">` is a generated global type, so `typecheck` runs `next typegen` first.
3. Installed vitest, prettier with the Tailwind plugin, fake-indexeddb and idb. Ran `shadcn init`; this version installs the "base-nova" style on Base UI, whose Button composes links through a `render` prop and needs `nativeButton={false}` when rendering an anchor.
4. Set the design tokens from `docs/07-design-system.md` §2 in `globals.css`: parent light theme, TV dark theme under `.dark` with the kid colour as primary, the warning token, six kid colours, radius 0.75rem. Geist as `--font-sans` and Fraunces as `--font-heading` through next/font.
5. Added sidebar, badge, separator, sheet, tooltip, skeleton, input and card. Built the parent shell: sidebar on desktop, a plain nav of ghost Buttons at the bottom on mobile, a top bar with the bell; four placeholder routes; the `/tv` route with its dark layout.
6. Scripts: lint, typecheck, test, format, format:check, build. CI workflow on push and pull request running all of them.
7. Checked the shell in the browser at desktop and 375px, and the TV route. Fixed the link-rendered buttons. Dev overlay reports no issues.

Decisions and deviations:
- No component source was changed. Two token-mapped class overrides are expected from here on: touch targets get `h-11` or `size-11`, since base-nova buttons are 32 to 36px tall; this stays on step 3 of the customisation ladder.
- The React Compiler lint rule `set-state-in-effect` is turned off for `src/components/ui/**` and `src/hooks/**` only, because the generated `use-mobile` hook trips it and generated code is used as shipped.
- Dependencies beyond the plan's table, all pulled in by `shadcn init`: `@base-ui/react`, `class-variance-authority`, `tw-animate-css`, `cn`, `shadcn`. Recorded in `DEV-PLAN.md`.
- `.claude/launch.json` holds the dev server config for the desktop app's preview when the project folder is the root.

Check: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test` (1 test) and `npm run build` all green locally. CI runs on this push. Shell seen at both widths. Vercel: guided with the user after this entry.

Proves: enables C7.1. Status: closed pending the Vercel URL.
