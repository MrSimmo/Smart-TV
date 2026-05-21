Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/`. Print the session-start confirmation line.

You are implementing ticket TKT-03. Read `tickets/TKT-03-browse-hero.md` in full.

Then:

1. `view` `design/mockups/moonfin_01_home.png`. Specifically check: hero gradient direction (left-heavy), metadata strip order, Continue Watching card dimensions (296×168), focused-card ring spec.
2. Inspect `packages/app/src/views/Browse/Browse.js` to understand: featured-item selection logic (if any), how Continue Watching is currently rendered, the panel-render hookup in `App/App.js`.
3. Inspect `packages/app/src/services/jellyfinApi.js:174` for `getResumeItems` and `packages/app/src/utils/helpers.js:74` for `getLogoUrl`. Reuse these — do not recreate.
4. Implement the ticket:
   - Create `BrowsePlex.jsx`, `.module.less`, `index.js` under `views/plex-ui/BrowsePlex/`.
   - Create `FeaturedHero.jsx`, `.module.less`, `index.js` under `components/plex-ui/FeaturedHero/`.
   - Create `PosterCard.jsx`, `.module.less`, `index.js` under `components/plex-ui/PosterCard/` — generic, accepts size variant prop. Continue Watching uses the 296×168 variant.
5. Add the `App/App.js` panel-render branch for Browse: `uiTheme === 'plex' ? <BrowsePlex .../> : <Browse .../>`. Single additive change.
6. Run `npm run lint`. Fix issues.
7. Run `npm run build:tizen` and `npm run build:tizen:legacy`. Both clean.
8. Update `PROGRESS.md`. Tick TKT-03.
9. Commit: `feat(plex-ui): add BrowsePlex and FeaturedHero (TKT-03)`.

Constraints:
- New files only, plus the one allow-listed branch in `App/App.js`. No other upstream modifications.
- Hero gradient is `linear-gradient`, not `backdrop-filter`. Forbidden in legacy build.
- No `transition: all`, no flex `gap`. `will-change: transform` only on focused Continue Watching card + immediate left/right neighbours.
- PosterCard must be reusable by TKT-05 (LibraryPlex) — accept size/aspect-ratio variant props.
- UK English in comments and commit messages.

If a blocker arises, write it to the ticket under `## Blocked` and stop. Especially: if the upstream Browse view doesn't expose a clean featured-item source, stop and discuss before inventing one.

Verify by running the build commands and by toggling `uiTheme` and confirming both Browse variants render correctly. Mark `Status: ✅` only when every acceptance box ticks.
