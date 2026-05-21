Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/` before starting (`0003-design-token-system.md` and `0004-focus-state-model.md` are the most relevant). Print the session-start confirmation line.

You are implementing ticket TKT-01. Read `tickets/TKT-01-design-tokens.md` in full.

Then:

1. `view` `design/mockups/moonfin_01_home.png`, `moonfin_02_details.png`, `moonfin_03_library.png`. Sample colour values by eye against ADR-003's token table to sanity-check.
2. Inspect `packages/app/src/styles/variables.less` (upstream-owned — do not modify) to understand the existing LESS variable naming conventions, then design Plex tokens to live in a parallel namespace.
3. Find the top-level stylesheet entry point. The likely location is `packages/app/src/index.less` or an `@import` chain reachable from `App/App.js`. Add a single `@import` line for `styles/plex-ui/index.less` AFTER all Sandstone imports.
4. Implement the ticket:
   - Create `packages/app/src/styles/plex-ui/tokens.less` with the full ADR-003 token table.
   - Create `packages/app/src/styles/plex-ui/base.less` with the `.plex-focusable` mixin (ADR-004) and a `.plex-display` class for typographic hero fallback.
   - Create `packages/app/src/styles/plex-ui/index.less` that imports both.
5. Run `npm run lint`. Fix issues.
6. Run `npm run build:tizen`. Verify clean.
7. Run `npm run build:tizen:legacy`. Verify clean.
8. Update `PROGRESS.md`. Tick TKT-01.
9. Commit: `feat(plex-ui): add design tokens and base mixins (TKT-01)`.

Constraints:
- New files only, plus the single `@import` line in the stylesheet entry. No other upstream modifications.
- Tokens use CSS custom properties on `:root`; spacing/typography use LESS variables. Do not invert this.
- `.plex-focusable` mixin uses `transform` and `opacity` transitions only — no `transition: all`.
- `will-change` is NOT set inside the mixin; it's set per-instance via `data-near-focus`.
- UK English in comments and commit messages.

If a blocker arises, write it to the ticket under `## Blocked` and stop.

Verify by running the three build commands and pasting verbatim output. Mark `Status: ✅` only when every box ticks.
