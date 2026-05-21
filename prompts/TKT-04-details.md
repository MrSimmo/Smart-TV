Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/`. Print the session-start confirmation line.

You are implementing ticket TKT-04. Read `tickets/TKT-04-details.md` in full.

Then:

1. `view` `design/mockups/moonfin_02_details.png`. Pay special attention to: the "In Library" chip being neutral (not red), the CTA hierarchy (one primary pill + four equal 60px circular buttons), the cast row's 110px portraits with 2px accent border on focus.
2. Inspect `packages/app/src/views/Details/Details.js` to find: the item-data fetch, the People-array split (cast vs crew), the panel-render hookup in `App/App.js`.
3. Inspect `packages/app/src/components/plex-ui/SidebarPlex/SidebarPlex.jsx` (from TKT-02) to confirm the `collapsed` prop is already in place.
4. Implement the ticket:
   - Create `DetailsPlex.jsx`, `.module.less`, `index.js` under `views/plex-ui/DetailsPlex/`.
   - Create `CastRow`, `CrewStrip`, `MetadataPill` components under `components/plex-ui/`.
   - Render SidebarPlex with `collapsed={true}` inside DetailsPlex.
   - Reuse the upstream item-fetch and People-array split logic — do not recreate.
5. Add the `App/App.js` panel-render branch for Details.
6. Run `npm run lint`. Fix issues.
7. Run `npm run build:tizen` and `npm run build:tizen:legacy`. Both clean.
8. Update `PROGRESS.md`. Tick TKT-04.
9. Commit: `feat(plex-ui): add DetailsPlex with collapsed sidebar (TKT-04)`.

Constraints:
- New files only, plus the one allow-listed branch in `App/App.js`. No other upstream modifications.
- "In Library" chip is NEUTRAL — not red, not an error state. Check the mockup carefully.
- No `transition: all`, no `backdrop-filter`. `will-change: transform` only on the currently-focused cast portrait and its neighbours.
- UK English.

If a blocker arises, write to the ticket under `## Blocked` and stop.

Verify by running the build commands and by navigating to three different items via the Plex UI: one with clear-logo, one without, one with resume progress. Mark `Status: ✅` only after every acceptance criterion ticks.
