# CLAUDE.md — Project-level conventions

Merges with the user-level `~/.claude/CLAUDE.md`. On conflict, project-level wins.

## Reading order at session start

Read these before planning or writing any code:

1. `CLAUDE.md` (this file)
2. `PROGRESS.md` (most recent entry first; carry forward any `[!]` or `[ ]` items)
3. `ARCHITECTURE.md`
4. `UPSTREAM_SYNC.md` if the session touches the routing/touchpoint allow-list
5. All ADRs under `decisions/` if the session introduces or modifies architectural decisions
6. The active ticket file (e.g. `tickets/TKT-NN-*.md`)

Print the confirmation line from user-level CLAUDE.md section 9 (the `Read: …` line).

## Deviation from user-level CLAUDE.md

- **ADR location.** User-level CLAUDE.md mandates `docs/adr/NNNN-…`. This project uses `decisions/NNNN-…` per the PLAN_MODE_BRIEF.md user-level instruction. ADR-001 documents the override.
- **DESIGN.md.** User-level CLAUDE.md mandates `DESIGN.md` at the project root for any UI work. This project consolidates design-token authority into `decisions/0003-design-token-system.md` plus the LESS file at `packages/app/src/styles/plex-ui/tokens.less`. There is no separate `DESIGN.md`; ADR-003 serves that role.

Both deviations are intentional and named here so the override trail is explicit.

## Per-phase execution rules

- **One phase per execution session.** Do not chain phases in a single session.
- **Branch:** `phase/<n>-<slug>` (e.g. `phase/2-sidebar`). Branch from `plex-ui`.
- **Commits:** Conventional Commits. Examples: `feat(plex-ui): add SidebarPlex skeleton`, `style(plex-ui): wire focused/active states`, `docs(adr): add ADR-006 for X`, `chore(plex-ui): tag phase 2`.
- **Tag at phase completion:** `plex-ui-phase-<n>` (e.g. `plex-ui-phase-2`).
- **Update PROGRESS.md before reporting completion** (user-level CLAUDE.md section 12).

## File scope

- **New code lives under** `packages/app/src/{components,views,styles}/plex-ui/` only. No exceptions.
- **Upstream modification allow-list** (ADR-002):
  - `packages/app/src/App/App.js`
  - `packages/app/src/context/SettingsContext.js`
  - `packages/app/src/views/Settings/*` (additive sections only)
  - `package.json` (description + `// fork` marker only)
- Any other modification to upstream files **must** be discussed first. Add a `Blocker` to the active ticket and stop.

## Style rules (legacy-WebKit envelope)

- No `backdrop-filter`, no flex `gap`, no grid `gap` (use `grid-gap`), no `aspect-ratio` (use padding-bottom trick).
- No `transition: all`. Only `transform` and `opacity` transitions.
- `will-change` only on the focused item + immediate neighbours, never on every card.
- No optional chaining, `??`, `Array.flat()`, `Object.fromEntries()` in code that lands in the legacy bundle. The repo's babel/swc config + `polyfills.js` already handle this for some cases; verify the legacy build is clean.

## Verification gates per ticket

Every ticket's acceptance includes:

1. `npm run lint` clean.
2. `npm run build:tizen` clean.
3. `npm run build:tizen:legacy` clean.
4. PROGRESS.md updated with phase box ticked and a one-line summary.
5. Manual TV deployment instructions read by the human (user deploys via Jellyfin 2 Samsung).

## UK English

UK English in all tickets, ADRs, code comments, docs, commit messages, and PR descriptions. User-facing strings remain on the existing `en-US` default — no new `en-GB` locale is added. Spelling drift (e.g. "colour" → "color" inside a string id) is allowed only where the string id itself is en-US.

## Plan-mode artefacts

This repo expects `ticket-<v>.md` / `prompt-<v>.md`-style artefacts when scoped to a single version (per the `ticket` skill). The Plex-UI rollout uses the brief's `TKT-NN-<slug>.md` schema instead — phase-numbered, multi-file. Phase 6 onward, follow-up fixes may use the `prompt-<v>-fix<N>.md` skill naming.

## Don't

- Don't refactor adjacent code outside the active ticket.
- Don't rename upstream files.
- Don't add dependencies without an ADR.
- Don't bypass `polyfills.js` or the `.legacy` HTML class.
- Don't commit without updating PROGRESS.md.
