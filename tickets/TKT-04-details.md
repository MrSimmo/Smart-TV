# TKT-04 — DetailsPlex

## Objective

Implement the Plex-inspired item details view. After this ticket: `DetailsPlex` renders when `uiTheme === 'plex'` and the active panel is the Details panel. The 88px collapsed sidebar rail variant (SidebarPlex with `collapsed={true}`) is used. The view displays a breadcrumb, clear-logo title block (or typographic fallback), three-tier metadata (facts row, genre pills, tech badges), tagline + capped plot, primary Play CTA with resume sub-label, four equal-weight 60px circular icon buttons (mark-watched, favourite, playlist, more), crew strip as a 2-column grid, and a cast row of circular portraits. This is the biggest readability win of the redesign.

## Phase

04 • **Upstream conflict risk:** LOW. New files; one panel-render branch added to `App/App.js`.

## Prerequisites

- TKT-00 through TKT-03 done.
- SidebarPlex `collapsed` prop is used here — verify the prop already exists from TKT-02.

## Design reference

- `view` `design/mockups/moonfin_02_details.png`. Regions to match:
  - Collapsed 88px sidebar rail on the left.
  - Breadcrumb at top (Movies › Genre › Title).
  - Clear-logo title block (160px tall area).
  - Three-tier metadata: facts row, genre pills, tech badges.
  - Tagline + plot capped at 640px width.
  - CTA hierarchy: primary Play pill + four 60px circular icon buttons.
  - Crew strip: 2-column label/value grid.
  - Cast row: circular 110px portraits at the bottom.

## Files this ticket creates

- `packages/app/src/views/plex-ui/DetailsPlex/DetailsPlex.jsx`
- `packages/app/src/views/plex-ui/DetailsPlex/DetailsPlex.module.less`
- `packages/app/src/views/plex-ui/DetailsPlex/index.js`
- `packages/app/src/components/plex-ui/CastRow/CastRow.jsx`
- `packages/app/src/components/plex-ui/CastRow/CastRow.module.less`
- `packages/app/src/components/plex-ui/CastRow/index.js`
- `packages/app/src/components/plex-ui/CrewStrip/CrewStrip.jsx`
- `packages/app/src/components/plex-ui/CrewStrip/CrewStrip.module.less`
- `packages/app/src/components/plex-ui/CrewStrip/index.js`
- `packages/app/src/components/plex-ui/MetadataPill/MetadataPill.jsx` (small reusable pill — rating, RT%, certificate, year, runtime, tech flags)
- `packages/app/src/components/plex-ui/MetadataPill/MetadataPill.module.less`
- `packages/app/src/components/plex-ui/MetadataPill/index.js`

## Files this ticket modifies

- `packages/app/src/App/App.js` — add `DetailsPlex` import + `uiTheme === 'plex' ? <DetailsPlex .../> : <Details .../>` branch in the Details panel render.

## Acceptance criteria

- [ ] DetailsPlex renders when `uiTheme === 'plex'` and Details panel is active. Upstream Details renders when `uiTheme === 'original'`.
- [ ] SidebarPlex is rendered with `collapsed={true}` (the 88px rail variant).
- [ ] Breadcrumb at top shows the navigation path (Movies › Genre › Title) using accent-2 colour for the separator chevrons.
- [ ] Clear-logo title block uses `getLogoUrl(serverUrl, item)` for the image. Falls back to typographic rendering (Bebas Neue, scale appropriate for title length).
- [ ] Facts row in order: IMDB rating pill (green / `--good`), Rotten Tomatoes %, certificate, year, runtime, neutral "In Library" status chip. The In Library chip is **neutral**, not red/error — match the mockup exactly.
- [ ] Genre pills: `--pill-bg` background, `--accent-2` text, focusable.
- [ ] Tech badges: small uppercase. HDR badge tinted `--warn`.
- [ ] Tagline + plot: plot max-width 640px.
- [ ] Primary CTA: "Play" pill with sub-label. If item has progress, sub-label reads `Resume from H:MM:SS · Nh Nm left`. Otherwise sub-label reads the runtime.
- [ ] Four 60px circular icon buttons of equal visual weight: mark-watched, favourite, playlist, more (overflow menu).
- [ ] CrewStrip: 2-column grid. Left column = role label (`--text-mute`, uppercase). Right column = name(s) as underlined links.
- [ ] CastRow: circular 110px portraits, name + role below. Focused portrait gets 2px `--accent` border + scale 1.06.
- [ ] D-pad traversal: collapsed sidebar → breadcrumb → primary CTA → icon buttons (l-to-r) → genre pills → cast row → back up via vertical nav.
- [ ] No `transition: all`, no `backdrop-filter`, no flex `gap`.
- [ ] `npm run lint`, `npm run build:tizen`, `npm run build:tizen:legacy` all clean.
- [ ] PROGRESS.md updated.

## Technical notes

- Item data comes from the same fetch the upstream Details view uses. Read `views/Details/Details.js` first and reuse its data hook/loader.
- Cast and crew data is in the same Jellyfin item response (`People` array). Filter by role to split crew vs cast — the upstream Details view already does this; reuse the split logic if present.
- "In Library" status: derive from the item being a Jellyfin library item (it always will be in this view, so the chip is informational not functional — see mockup). Don't overthink this — it's a static neutral chip, not a state machine.
- The MetadataPill is generic: takes `variant: 'good' | 'warn' | 'neutral' | 'accent'`, label, optional icon. Reuse across the facts row and the tech badges.
- Spotlight: the action button row (Play + 4 circular buttons) is a single horizontal container. The cast row is its own horizontal container. Both use `SpotlightContainerDecorator`.

## Out of scope

- Episode list rendering (this is the film/series details view; episode-list redesign is a future ticket).
- Modifying upstream Details fetching.
- Adding new Jellyfin API calls — reuse what the upstream Details view already fetches.

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

I will deploy and verify with the remote against at least three items: a film with a clear-logo, a film without one (typographic fallback), and a film with resume progress (sub-label rendering).

## Status: ⬜
