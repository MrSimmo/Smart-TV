Project progress log. Status: [x] done · [!] failed (retry) · [ ] not started (carry forward) · [~] deferred (reason).

## 2026-05-21 — Plan-mode scaffolding

**Scope:** Produce the full plan-mode deliverable set for the Plex-UI fork (ARCHITECTURE, CLAUDE, ADRs, tickets, prompts, upstream-sync runbook).

**Tasks:**
- [x] T0 — Validate brief assumptions against the actual repo (routing model, paths, framework versions).
- [x] T1 — Resolve open questions with the user (UK English scope, Browse vs Home naming, build verification gate).
- [x] T2 — Write ARCHITECTURE.md, CLAUDE.md (project), UPSTREAM_SYNC.md, and this PROGRESS.md.
- [x] T3 — Write 5 ADRs under `decisions/`.
- [x] T4 — Write 7 tickets under `tickets/` (TKT-00 through TKT-06).
- [x] T5 — Write 8 prompts under `prompts/` (TKT-00 through TKT-06 + ONESHOT).
- [x] T6 — Write `PLAN_COMPLETE.md` listing produced files and any open questions for the human.
- [ ] T7 — Phase 0 (TKT-00) execution session — pending human kickoff.
- [ ] T8 — Phase 1 (TKT-01) execution session — pending T7.
- [ ] T9 — Phase 2 (TKT-02) execution session — pending T8.
- [ ] T10 — Phase 3 (TKT-03) execution session — pending T9.
- [ ] T11 — Phase 4 (TKT-04) execution session — pending T10.
- [ ] T12 — Phase 5 (TKT-05) execution session — pending T11.
- [ ] T13 — Phase 6 (TKT-06) execution session — pending T12.

**Changes:** Created plan-mode deliverable set. No application code modified. No commits made.

**Decisions:** ADR-001 through ADR-005 introduced. See `decisions/` for the full set.

**Verified:** None — this is a planning session. Verification belongs to the execution phases (T7 onward).

**Next:** Resume from `[ ] T7` — kick off Phase 0 by piping `prompts/TKT-00-setup.md` to a fresh execution session, or run the full sweep via `prompts/ONESHOT-execute-all.md`.

## 2026-05-21 — TKT-00 — Setup, scaffolding, uiTheme flag

**Scope:** Phase 0 of the Plex-UI rollout. Create empty `plex-ui/` directories, add `uiTheme` flag to `SettingsContext`, mark `package.json` as the fork. No visible UI change.

**Tasks:**
- [x] TKT-00 — Created `packages/app/src/{views,components,styles}/plex-ui/.gitkeep`; added `uiTheme: 'plex'` to `defaultSettings` (persists via existing storage round-trip); added `description` + `_fork` marker to `package.json`.

**Changes:** Three new `.gitkeep` files; `packages/app/src/context/SettingsContext.js` (+3 lines); `package.json` (+2 lines). Plan-mode artefacts (`ARCHITECTURE.md`, `CLAUDE.md`, `PROGRESS.md`, `decisions/`, `tickets/`, `prompts/`, `design/`, `UPSTREAM_SYNC.md`, `PLAN_MODE_BRIEF.md`, `PLAN_COMPLETE.md`) committed alongside as bootstrap.

**Decisions:** Bound by ADR-001, ADR-002 (`SettingsContext.js` and `package.json` are allow-listed). No new ADRs.

**Verified:** `npm run lint` (clean, two browserslist-data warnings only); `npm run build:tizen` (Moonfin_Tizen_Regular_2.4.0.wgt, 3.80 MB); `npm run build:tizen:legacy` (Moonfin_Tizen_Legacy_2.4.0.wgt, 3.84 MB). End-user verification deferred to TKT-02 when there is a Plex view to render.

**Next:** TKT-01 — design tokens and base styles.

## 2026-05-21 — TKT-01 — Design tokens and base styles

**Scope:** Phase 1 of the Plex-UI rollout. Create the LESS token layer and the `.plex-focusable` mixin every subsequent component will consume.

**Tasks:**
- [x] TKT-01 — Created `styles/plex-ui/tokens.less` (full ADR-003 token table: surfaces, text, accent, semantic), typography ramp + 8-point spacing as LESS variables, `.plex-focusable` mixin in `base.less` (ADR-004 two-state focus, transform/opacity transitions only), `.plex-display` typographic hero fallback, `.plex-section-label`. Side-effect import added to `App.js` after `App.module.less` so Plex selectors win cascade ties.

**Changes:** `packages/app/src/styles/plex-ui/{tokens,base,index}.less` (new); `packages/app/src/App/App.js` (+4 lines, allow-listed touchpoint per ADR-002).

**Decisions:** Bound by ADR-003 and ADR-004. No new ADRs. ADR-001 component-isolation respected — no upstream LESS modified; `variables.less` and `App.module.less` untouched.

**Verified:** `npm run lint` (clean, browserslist-data warnings only); `npm run build:tizen` (Moonfin_Tizen_Regular_2.4.0.wgt clean); `npm run build:tizen:legacy` (Moonfin_Tizen_Legacy_2.4.0.wgt clean). No visible UI change — no consumers yet.

**Next:** TKT-02 — SidebarPlex.

## 2026-05-21 — TKT-02 — SidebarPlex with two-state focus

**Scope:** Phase 2. The Plex-inspired left nav with DISCOVER / LIBRARIES / MORE sections, two-state focus (active + focused), 280px expanded / 88px collapsed, and the server/profile footer.

**Tasks:**
- [x] TKT-02 — Created `components/plex-ui/SidebarPlex/{SidebarPlex.js,SidebarPlex.module.less,index.js}`. Reuses upstream `libraries` prop and existing handlers (no new fetches). Two-state focus per ADR-004 — `.active` for current route, `:focus` for Spotlight cursor; focused wins via cascade order. `collapsed` prop renders the 88px icon-only rail used by TKT-04. `will-change: transform` is set per-instance via `[data-near-focus="true"]` from the JS focus handler, never on the whole list. Wired into `App.js` via the allow-listed branch on `settings.uiTheme === 'plex'`.

**Changes:** `components/plex-ui/SidebarPlex/{SidebarPlex.js,.module.less,index.js}` (new); `App/App.js` (+18 lines — additive branch in the existing left-sidebar conditional, plus the import). Allow-list intact: App.js, SettingsContext.js, Settings views, package.json.

**Decisions:** New code lives under `components/plex-ui/` per ADR-001. Routing touchpoint is the single conditional in App.js as named in ADR-002. Used `.js` rather than ticket's `.jsx` to match the codebase's universal convention (no .jsx files exist anywhere; enact-cli config targets `.js`).

**Verified:** `npm run lint` clean (browserslist-data warnings only); `npm run build:tizen` and `npm run build:tizen:legacy` both produce clean `.wgt` files. End-user verification deferred to the human's Q90R deploy: toggle `settings.uiTheme` between `'plex'` and `'original'`, confirm both sidebars render, walk both focus states with the d-pad.

**Next:** TKT-03 — BrowsePlex + FeaturedHero.

## 2026-05-21 — TKT-03 — BrowsePlex + FeaturedHero + PosterCard

**Scope:** Phase 3. Plex-styled home view: left-heavy hero with clear-logo (typographic fallback), metadata strip, italic tagline, capped plot, white Play CTA with optional resume sub-label; Continue Watching row of 296×168 cards with resume progress bar.

**Tasks:**
- [x] TKT-03 — Created `components/plex-ui/{FeaturedHero,PosterCard}/*` and `views/plex-ui/BrowsePlex/*`. PosterCard supports two variants (`continue` 296×168 and `poster` 2:3) — the latter implemented via padding-bottom 150% rather than `aspect-ratio` for the legacy bundle. FeaturedHero uses `getLogoUrl` from helpers.js and falls back to a `.plex-display` typographic title scaled by character count (60–160px range from ADR-003). BrowsePlex fetches featured + resume from existing `api.getRandomItems` / `api.getResumeItems`. App.js Browse panel branches on `uiTheme === 'plex'`.

**Changes:** `components/plex-ui/PosterCard/{PosterCard.js,.module.less,index.js}` (new); `components/plex-ui/FeaturedHero/{FeaturedHero.js,.module.less,index.js}` (new); `views/plex-ui/BrowsePlex/{BrowsePlex.js,.module.less,index.js}` (new); `App/App.js` (+13 lines — lazy import + allow-listed branch in Browse panel).

**Decisions:** Bound by ADR-001/002/003. Upstream Browse's full theme-music + multi-server + plugin pipeline NOT duplicated in BrowsePlex — those remain on upstream Browse when `uiTheme === 'original'`. PosterCard designed for reuse by LibraryPlex (TKT-05) via the `variant` prop.

**Verified:** `npm run lint` clean (browserslist warnings only); `npm run build:tizen` and `npm run build:tizen:legacy` both clean. End-user verification deferred to Q90R deploy.

**Next:** TKT-04 — DetailsPlex.

## 2026-05-21 — TKT-04 — DetailsPlex with collapsed sidebar

**Scope:** Phase 4. Item details view with collapsed 88px SidebarPlex rail, breadcrumb, clear-logo / typographic title, facts row + genre/tech pills, neutral "In Library" chip, primary Play CTA + 4 60px circular buttons, CrewStrip 2-column grid, CastRow 110px circular portraits.

**Tasks:**
- [x] TKT-04 — Created `views/plex-ui/DetailsPlex/*`, `components/plex-ui/{MetadataPill,CrewStrip,CastRow}/*`. SidebarPlex renders collapsed inline. Item data via `api.getItem(itemId)` (same endpoint upstream Details consumes). People array split: `Type === 'Actor' || 'GuestStar'` → CastRow; other roles → CrewStrip. MetadataPill (`good | warn | accent | neutral` variants) reused across facts row and tech badges. App.js Details panel branches on `uiTheme === 'plex'`.

**Changes:** `views/plex-ui/DetailsPlex/{DetailsPlex.js,.module.less,index.js}` (new); `components/plex-ui/{MetadataPill,CrewStrip,CastRow}/*` (new); `App/App.js` (+25 lines — lazy import + allow-listed branch in Details panel).

**Decisions:** Bound by ADR-001/002/004. "In Library" chip rendered as `neutral` variant (not red/error) per the mockup. Upstream Details' full feature surface (episodes, seasons, similar, chapters, subtitle picker, delete, theme music) is NOT duplicated — those remain on upstream Details when `uiTheme === 'original'`. The Plex variant focuses on the readability win of the redesign.

**Verified:** `npm run lint` clean; `npm run build:tizen` and `npm run build:tizen:legacy` both clean. End-user verification on Q90R deferred.

**Next:** TKT-05 — LibraryPlex grid.

## 2026-05-21 — TKT-05 — LibraryPlex grid with filter chips

**Scope:** Phase 5. Library/collection view with full 280px SidebarPlex, 36px title + count + 320px search button, filter chip row (All Genres / Unwatched / 4K-HDR / Year / Rating / Sort with three distinct states), ViewToggle (grid/list with list as "Coming soon"), 7-col 2:3 padding-bottom poster grid with NEW/unwatched/resume overlays.

**Tasks:**
- [x] TKT-05 — Created `views/plex-ui/LibraryPlex/*` and `components/plex-ui/{FilterChip,PosterGrid,ViewToggle}/*`. FilterChip implements all three states (default/active/focused) with `:focus` after `.active` so focused wins via cascade. PosterGrid is a 7-col CSS Grid (grid-row-gap + grid-column-gap, not flex `gap`) consuming PosterCard's existing `poster` variant which already uses padding-bottom: 150% for the 2:3 ratio (no `aspect-ratio` property). Items fetched via `api.getItems({ParentId, IncludeItemTypes, Recursive, Limit: 200, Fields: 'UserData,MediaSources,ProductionYear,Width'})`. Client-side filters for `Unwatched` and `4K/HDR`; sort cycles through Name / Year / Rating / Recently Added. App.js Library panel branches on `uiTheme === 'plex'`.

**Changes:** `views/plex-ui/LibraryPlex/{LibraryPlex.js,.module.less,index.js}` (new); `components/plex-ui/{FilterChip,PosterGrid,ViewToggle}/*` (new); `App/App.js` (+25 lines — lazy import + allow-listed branch in Library panel).

**Decisions:** Bound by ADR-001/002/003/004. Pagination: did NOT integrate `VirtualGridList` (upstream uses it but the integration is tightly coupled to upstream's toolbar/sort/filter mosaic; reproducing it would widen the change well beyond the ticket scope). Plain CSS Grid for first release, 200-item cap. `aspect-ratio` strictly avoided. `gap` shorthand strictly avoided (grid-row-gap + grid-column-gap throughout). Genres/Year/Rating chips render as visual placeholders (hasMore chevron) without dropdown menus — a follow-up ticket can add the popovers.

**Verified:** `npm run lint` clean; `npm run build:tizen` and `npm run build:tizen:legacy` both clean. End-user verification on Q90R deferred.

**Next:** TKT-06 — Polish, accent presets, QA.
