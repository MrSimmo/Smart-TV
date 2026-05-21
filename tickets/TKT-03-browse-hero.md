# TKT-03 — BrowsePlex + FeaturedHero

## Objective

Implement the Plex-inspired home/browse view with a left-heavy featured hero and a Continue Watching row. After this ticket: `BrowsePlex` renders when `uiTheme === 'plex'` and the active panel is the Browse panel; FeaturedHero uses Jellyfin `clearlogo` artwork when available with a typographic fallback, includes the full metadata strip (rating, RT %, certificate, year, runtime, tech flags, genres), italic tagline, plot capped at 640px width, and the primary CTA pill with optional "Resume from HH:MM" sub-label. Continue Watching row reuses the existing resume data source.

## Phase

03 • **Upstream conflict risk:** LOW. New files only, except the existing App.js panel-render switch which gets a single `uiTheme === 'plex' ? <BrowsePlex .../> : <Browse .../>` branch.

## Prerequisites

- TKT-00, TKT-01, TKT-02 done.

## Design reference

- `view` `design/mockups/moonfin_01_home.png`. Regions to match exactly:
  - Sidebar slot (already TKT-02) — verify it still renders correctly inside BrowsePlex.
  - Featured hero: clear-logo title, left-heavy gradient scrim, metadata strip, tagline, plot, CTAs.
  - Continue Watching row: 296×168 cards, 12px radius, bottom progress bar, focused-state ring + scale.
  - Top bar: 380px search button, settings + downloads icon buttons.

## Files this ticket creates

- `packages/app/src/views/plex-ui/BrowsePlex/BrowsePlex.jsx`
- `packages/app/src/views/plex-ui/BrowsePlex/BrowsePlex.module.less`
- `packages/app/src/views/plex-ui/BrowsePlex/index.js`
- `packages/app/src/components/plex-ui/FeaturedHero/FeaturedHero.jsx`
- `packages/app/src/components/plex-ui/FeaturedHero/FeaturedHero.module.less`
- `packages/app/src/components/plex-ui/FeaturedHero/index.js`
- `packages/app/src/components/plex-ui/PosterCard/PosterCard.jsx` (used by Continue Watching row and re-used by LibraryPlex grid in TKT-05)
- `packages/app/src/components/plex-ui/PosterCard/PosterCard.module.less`
- `packages/app/src/components/plex-ui/PosterCard/index.js`

## Files this ticket modifies

- `packages/app/src/App/App.js` — add `BrowsePlex` import + the panel-render conditional for the Browse panel. Single additive branch alongside the existing Browse render.

## Acceptance criteria

- [ ] BrowsePlex renders when `uiTheme === 'plex'` and the Browse panel is active. Upstream Browse renders when `uiTheme === 'original'`.
- [ ] FeaturedHero displays the Jellyfin `clearlogo` for the featured item when available. Use `getLogoUrl()` from `packages/app/src/utils/helpers.js:74` — do not recreate.
- [ ] FeaturedHero falls back to typographic title rendering (Bebas Neue / Impact stack, scale 60–160px depending on title length) when no clear-logo exists.
- [ ] Left-heavy gradient scrim per mockup (darker on the left where text lives, fading to transparent on the right).
- [ ] Metadata strip, in order: green rating pill, Rotten Tomatoes %, certificate, year, runtime, tech flags (HDR/4K etc.), genre pills (accent-tinted background, `--accent-2` text). HDR badge uses `--warn`.
- [ ] Tagline rendered in italics, `--accent-2` colour.
- [ ] Plot text capped at `max-width: 640px` (~60ch).
- [ ] Primary CTA: white pill, scale 1.04 on focus, sub-label reads runtime for unstarted items or "Resume from HH:MM" for items with progress.
- [ ] Continue Watching row uses `api.getResumeItems(limit)` from `services/jellyfinApi.js:174`. Reuse, do not recreate.
- [ ] Continue Watching cards: 296×168, 12px border-radius, bottom edge progress bar, focused state = scale 1.04 + 3px `--accent` ring.
- [ ] Top bar: 380px search button, settings + downloads icon buttons. Spotlight-navigable.
- [ ] D-pad traversal: from sidebar → hero CTA → tech flags → genre pills → Continue Watching row → search button → back to sidebar via left.
- [ ] No `transition: all`, no `backdrop-filter`. Hero gradient is a plain `linear-gradient`, not `backdrop-filter`.
- [ ] `will-change: transform` on focused Continue Watching card + immediate left/right neighbours only.
- [ ] `npm run lint`, `npm run build:tizen`, `npm run build:tizen:legacy` all clean.
- [ ] PROGRESS.md updated.

## Technical notes

- Featured item selection: reuse the upstream Browse view's featured-item logic if it exists, otherwise pick the first item from `api.getLatest(libraryId, 1)` for the user's default Movies library. Confirm by reading `views/Browse/Browse.js` first.
- `clearlogo` endpoint: `getLogoUrl(serverUrl, item)` from `utils/helpers.js:74` returns the right URL with `ImageTags.Logo` / `ParentLogoItemId` fallback already handled.
- Continue Watching: `api.getResumeItems(limit)` from `services/jellyfinApi.js:174`. The endpoint pages are `/Users/{userId}/Items/Resume?Limit=…&MediaTypes=Video&Fields=ImageTags,…`. The shape is already what we need.
- The PosterCard component is generic and will be reused by LibraryPlex (TKT-05). Make it accept props for size variant (Continue Watching size vs library grid size).
- Spotlight container nesting: Hero is one container, Continue Watching row is another, top bar is a third. Each uses `SpotlightContainerDecorator`.

## Out of scope

- Library grid card variants beyond what PosterCard supports here (sized for 296×168). The library grid's 2:3 aspect ratio is TKT-05.
- Detail view navigation logic — clicking a card or the CTA should call the existing navigation function from `App.js`, not invent a new one.
- Search functionality — the search button navigates to the existing search panel (no new search UI in this ticket).

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

I will deploy and verify with the remote:
- Featured hero loads with clear-logo for at least one library item that has one set in Jellyfin.
- Fallback typographic title renders for items without a clear-logo (manually clear the logo on an item in Jellyfin admin to test).
- Continue Watching row populates from at least one resumable item.
- D-pad traversal covers every interactive element in the order specified.

## Status: ✅
