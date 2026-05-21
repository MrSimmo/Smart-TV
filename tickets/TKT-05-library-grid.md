# TKT-05 — LibraryPlex grid

## Objective

Implement the Plex-inspired library/collection view with a filter chip row and a 7-column poster grid. After this ticket: `LibraryPlex` renders when `uiTheme === 'plex'` and the Library panel is active. Header shows library title, item count, and a search button. Filter chip row has All Genres, Unwatched, 4K/HDR, Year, Rating, Sort with three distinct states (default, active, focused). Posters are 2:3 aspect ratio (padding-bottom trick) with overlays (badges top-left, NEW top-right, unwatched dot, resume progress bar). View toggle (grid / list) at top-right of the filter row.

## Phase

05 • **Upstream conflict risk:** LOW. New files; one panel-render branch added to `App/App.js`.

## Prerequisites

- TKT-00 through TKT-04 done. PosterCard from TKT-03 is reused here with a different size variant.

## Design reference

- `view` `design/mockups/moonfin_03_library.png`. Regions to match:
  - Sidebar slot (full 280px expanded — not collapsed).
  - Header: library title (36px / weight 700) + item count (16px / muted) + 320px search button.
  - Filter chips: All Genres, Unwatched, 4K/HDR, Year, Rating, Sort. Three states must be visually distinct.
  - Grid: 7 columns, 2:3 posters.
  - Per-poster overlays per mockup.
  - View toggle (grid/list) at top-right.

## Files this ticket creates

- `packages/app/src/views/plex-ui/LibraryPlex/LibraryPlex.jsx`
- `packages/app/src/views/plex-ui/LibraryPlex/LibraryPlex.module.less`
- `packages/app/src/views/plex-ui/LibraryPlex/index.js`
- `packages/app/src/components/plex-ui/FilterChip/FilterChip.jsx`
- `packages/app/src/components/plex-ui/FilterChip/FilterChip.module.less`
- `packages/app/src/components/plex-ui/FilterChip/index.js`
- `packages/app/src/components/plex-ui/PosterGrid/PosterGrid.jsx`
- `packages/app/src/components/plex-ui/PosterGrid/PosterGrid.module.less`
- `packages/app/src/components/plex-ui/PosterGrid/index.js`
- `packages/app/src/components/plex-ui/ViewToggle/ViewToggle.jsx`
- `packages/app/src/components/plex-ui/ViewToggle/ViewToggle.module.less`
- `packages/app/src/components/plex-ui/ViewToggle/index.js`

## Files this ticket modifies

- `packages/app/src/App/App.js` — add `LibraryPlex` import + the panel-render conditional branch.

## Acceptance criteria

- [ ] LibraryPlex renders when `uiTheme === 'plex'` and Library panel is active. Upstream Library renders otherwise.
- [ ] SidebarPlex renders at full 280px (not collapsed).
- [ ] Header: library title at 36px / weight 700; item count at 16px / `--text-dim`; 320px search button.
- [ ] FilterChip has three explicitly distinct visual states:
  - **default** — `--surface-2` background, `--text-dim` label, no border.
  - **active** — `--pill-bg` background, `--accent-2` label, no scale.
  - **focused** — solid `--accent`, white label, scale 1.04, accent drop shadow.
  - Both **active** and **focused** must be visible to the user simultaneously when both apply (i.e. the user is hovering their current filter).
- [ ] Filter chip row contains: All Genres, Unwatched, 4K/HDR, Year, Rating, Sort.
- [ ] Grid: 7 columns. Posters are 2:3 ratio implemented via padding-bottom (`padding-bottom: 150%` on a positioned wrapper) — **not** `aspect-ratio`.
- [ ] Per-poster overlays per mockup: 4K/HDR/DV badges top-left, NEW badge top-right when applicable, unwatched dot when applicable, resume progress bar at bottom edge when item has progress.
- [ ] Focused poster: scale 1.06, 3px `--accent` ring, accent drop shadow. `will-change: transform` on focused + immediate four neighbours only.
- [ ] Title + year/runtime label below each poster (centred, two lines max with ellipsis).
- [ ] View toggle (grid / list) at top-right of the filter row. List mode is allowed to be a stub that defers full list rendering — call it "Coming soon" if list isn't fully implemented this phase, but the toggle must be focusable.
- [ ] D-pad traversal: sidebar → header search → filter chip row (l-to-r) → view toggle → first poster → spatial nav within the grid → return-up via up-arrow.
- [ ] No `transition: all`, no `backdrop-filter`, no `aspect-ratio`, no flex `gap`.
- [ ] `npm run lint`, `npm run build:tizen`, `npm run build:tizen:legacy` all clean.
- [ ] PROGRESS.md updated.

## Technical notes

- Item fetch: reuse the upstream Library view's data hook — likely `api.getItems({ parentId: libraryId, ... })` from `services/jellyfinApi.js`. Read `views/Library/Library.js` first to find and reuse the call.
- Filter application: the upstream Library view almost certainly already implements at least some of these filters. Reuse the filter state shape if possible; the UI is new but the data layer should not be reimplemented.
- The grid uses Sandstone's `VirtualGridList` for virtualisation (the upstream Library uses it — pattern at `views/Library/Library.js`). Configure with 7 columns and the padding-bottom-derived item dimensions.
- Resume progress bar: derive from `item.UserData.PlaybackPositionTicks / item.RunTimeTicks`. Same data the upstream view uses.
- NEW badge: derive from `item.DateCreated` vs a configurable threshold (default 30 days). Upstream may already have this — reuse if so.

## Out of scope

- Implementing the list-view rendering when ViewToggle is in "list" mode — out of scope this ticket; "Coming soon" placeholder is acceptable.
- New filters beyond what's shown in the mockup.
- Pagination changes — reuse upstream's pagination/virtualisation as-is.

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

I will deploy and verify with the remote against a Movies library of >50 items:
- Filter states visually distinct on focus and active.
- 7-column grid lays out correctly at 1920×1080.
- D-pad spatial nav reaches every poster without dead zones.
- Resume progress bar appears on items with playback progress.

## Status: ⬜
