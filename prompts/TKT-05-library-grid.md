Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/`. Print the session-start confirmation line.

You are implementing ticket TKT-05. Read `tickets/TKT-05-library-grid.md` in full.

Then:

1. `view` `design/mockups/moonfin_03_library.png`. Confirm three filter-chip states are visually distinct (default, active, focused), and that focused + active can coexist (user hovering their currently-applied filter).
2. Inspect `packages/app/src/views/Library/Library.js` to find: the items fetch, the filter state shape, the virtualised grid setup, the panel-render hookup in `App/App.js`.
3. Confirm PosterCard from TKT-03 supports the 2:3 aspect variant (padding-bottom: 150%) — if it does not, extend it here in a backward-compatible way.
4. Implement the ticket:
   - Create `LibraryPlex.jsx`, `.module.less`, `index.js` under `views/plex-ui/LibraryPlex/`.
   - Create `FilterChip`, `PosterGrid`, `ViewToggle` components under `components/plex-ui/`.
   - Reuse the upstream items fetch and filter state — do not recreate.
   - Posters use the padding-bottom 150% trick for 2:3 aspect ratio. Do NOT use the CSS `aspect-ratio` property.
   - List-view mode in ViewToggle may render a "Coming soon" placeholder; the toggle itself must still be focusable.
5. Add the `App/App.js` panel-render branch for Library.
6. Run `npm run lint`. Fix issues.
7. Run `npm run build:tizen` and `npm run build:tizen:legacy`. Both clean.
8. Update `PROGRESS.md`. Tick TKT-05.
9. Commit: `feat(plex-ui): add LibraryPlex grid with filter chips (TKT-05)`.

Constraints:
- New files only, plus the one allow-listed branch in `App/App.js`. No other upstream modifications.
- No `aspect-ratio` CSS property — legacy WebKit doesn't support it. Use padding-bottom.
- No `transition: all`, no `backdrop-filter`, no flex `gap`.
- `will-change: transform` only on the focused poster + its immediate four neighbours (up/down/left/right).
- UK English.

If a blocker arises, write to the ticket under `## Blocked` and stop. Especially: if the upstream Library view's filter state shape is incompatible with the Plex filter chip set, stop and ask — do not invent.

Verify against a Movies library of >50 items. Mark `Status: ✅` only when every acceptance criterion ticks.
