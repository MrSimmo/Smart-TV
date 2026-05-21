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

## 2026-05-21 — TKT-06 — Polish, accent presets, QA

**Scope:** Phase 6 — final pass. Appearance section in Settings (UI theme + accent presets), `uiThemePreset` key, runtime accent swap, README, performance grep audit.

**Tasks:**
- [x] TKT-06 — Created `components/plex-ui/AccentPicker/*` (preset chips + `applyAccentPreset` helper + exported `ACCENT_PRESETS`). Added `uiThemePreset: 'moonfin-purple'` to `defaultSettings`. Added an additive Appearance subcategory under Personalization in `views/Settings/Settings.js` (one new subcat + one dispatch case + one renderer; nothing existing moved or renamed). Wired `App.js` to call `applyAccentPreset` whenever `settings.uiThemePreset` or `settings.focusColor` changes — named presets overwrite `focusColor` so the upstream UI follows when toggled back to `'original'`. Created `views/plex-ui/README.md` (screenshot strip, toggle instructions, preset list, file map, ADR cross-references).
- [x] Performance grep audit:
  - `transition: all` — zero matches in plex-ui code (only references in commentary/ADR notes).
  - `backdrop-filter` — zero matches in plex-ui code (only commentary).
  - `aspect-ratio` — zero matches in plex-ui code (only commentary).
  - `will-change` — appears only inside `[data-near-focus="true"]` selectors in SidebarPlex and PosterCard, scoped per ADR-004.
- [x] All previous tickets' `Status: ⬜` already updated to `Status: ✅` at the close of each phase commit (TKT-00..05).

**Changes:** `components/plex-ui/AccentPicker/{AccentPicker.js,.module.less,index.js}` (new); `views/plex-ui/README.md` (new); `context/SettingsContext.js` (+2 lines — added `uiThemePreset` key, ADR-002 allow-list); `views/Settings/Settings.js` (+24 lines — additive Appearance subcategory + dispatch + renderer, ADR-002 allow-list); `App/App.js` (+12 lines — applyAccentPreset import + useEffect, ADR-002 allow-list).

**Decisions:** Bound by ADR-005. Custom preset reuses existing `settings.focusColor` hex — no duplicate UI per the ADR. Settings additions are strictly insertions; no existing rows moved or renamed.

**Verified:** `npm run lint` clean; `npm run build:tizen` and `npm run build:tizen:legacy` both clean; performance grep audit zero forbidden patterns in production CSS. End-user QA (focus coverage, accent preset switching across all three views) deferred to Q90R deploy by the human.

**Next:** Tag `plex-ui-v0.1.0`, push tags, write the final rollout-complete summary, report commits + tag back to the human.

## 2026-05-21 — Plex-UI v0.1.0 rollout complete

**Scope:** Full TKT-00 → TKT-06 rollout executed in a single 1M-context session via `prompts/ONESHOT-execute-all.md`.

**Commits (oldest → newest):**
- `be00e7e` chore(plex-ui): scaffold directories and uiTheme flag (TKT-00)
- `235251b` feat(plex-ui): add design tokens and base mixins (TKT-01)
- `b57065e` feat(plex-ui): add SidebarPlex with two-state focus (TKT-02)
- `eb937f4` feat(plex-ui): add BrowsePlex and FeaturedHero (TKT-03)
- `21d246e` feat(plex-ui): add DetailsPlex with collapsed sidebar (TKT-04)
- `e874ba0` feat(plex-ui): add LibraryPlex grid with filter chips (TKT-05)
- `6a79a78` feat(plex-ui): add accent presets, Settings integration, and visual QA polish (TKT-06)

**Tag:** `plex-ui-v0.1.0` pushed to `origin` (https://github.com/MrSimmo/Smart-TV.git).

**Allow-list adherence (ADR-002):** Only `packages/app/src/App/App.js`, `packages/app/src/context/SettingsContext.js`, `packages/app/src/views/Settings/Settings.js`, and `package.json` were modified upstream-side. All other new code lives under `packages/app/src/{components,views,styles}/plex-ui/`. No upstream component file renamed or rewritten.

**Verification gates passed each commit:** `npm run lint` clean (browserslist-data warnings only — not Plex-UI code); `npm run build:tizen` produced Moonfin_Tizen_Regular_2.4.0.wgt clean; `npm run build:tizen:legacy` produced Moonfin_Tizen_Legacy_2.4.0.wgt clean.

**Performance audit (TKT-06):** zero production matches for `transition: all`, `backdrop-filter`, `aspect-ratio`. `will-change` matches scoped to `[data-near-focus="true"]` selectors only (SidebarPlex row, PosterCard).

**Scope deliberately deferred for follow-ups:**
- Genre / Year / Rating filter chip popovers in LibraryPlex (chips render as static labels with hasMore chevron; selecting them is a no-op this release).
- `VirtualGridList`-backed virtualisation in LibraryPlex (plain CSS Grid for first release; libraries up to ~200 items perform well).
- Upstream Browse's full pipeline (theme-music callbacks, multi-server unified mode, plugin-driven media bar) is not duplicated in BrowsePlex — those remain on upstream Browse when `uiTheme === 'original'`.
- Light theme — would require a new ADR.

**End-user verification:** deferred to Q90R deploy by the human (per ticket Verification sections). The .wgt files are at the repo root after each build.

**Status:** Plex-UI v0.1.0 ready for human deploy + visual QA on Samsung Q90R.

## 2026-05-21 14:18 — Plex-UI v0.1.1 — sixteen Q90R bug fixes

**Scope:** v0.1.1 patch round. Sixteen on-device bugs reported after Q90R QA of `plex-ui-v0.1.0`, plus ADR-0006 (single outer SidebarPlex). Executed in a single 1M-context session against `tickets/prompt-0.1.1.md`.

**Branch:** `phase/7-v0.1.1-fixes` off `plex-ui`.

**Tasks (per-bug status):**
- [x] #2 — Default `navbarPosition` flipped to `'left'`. Fresh sign-in lands on the sidebar layout. Commit `72f7c63`.
- [x] #14 — Navbar Position row removed from Settings; helper kept per prompt. Commit `31b2335` (+ `0100765` eslint-disable for build:tizen lint gate).
- [x] #15 — Card Focus Expansion row removed; `cardFocusZoom` key kept in defaults. Commit `31b2335`.
- [x] #1 + #12 — SidebarPlex rendered once at the App level (ADR-0006). Inline sidebars removed from DetailsPlex and LibraryPlex; sidebar-only props dropped from both signatures and call sites; DetailsPlex `.content` margin flipped to 280px; LibraryPlex `onOpenSearch` retained for the header search button. Commit `ea08279`.
- [x] #11 — BrowsePlex `onPlay` wired through App.js's `handlePlay`. FeaturedHero Play → Player panel. Continue Watching card → Player with `resume=true`. Commit `88cab43`.
- [x] #9 — `Genres: genreFilter || undefined` passed to `api.getItems` (server-side filter). Client-side filter retained as defence-in-depth for unified mode. Commit `b39fb3a`.
- [x] #10 — `itemTypeForLibrary` returns `''` for `CollectionType === 'folders'`; helper omits `IncludeItemTypes` so folder contents render. Commit `89dafd0`.
- [x] #3 — All 14 hard-coded `rgba(124, 92, 252, *)` literals across plex-ui production CSS replaced with `var(--accent-glow)` (or `var(--accent-glow-strong)` on the PosterCard unwatched dot). New tokens added to `tokens.less`; `applyAccentPreset` now writes `rgba()` strings (via `hexToRgba`) for `--pill-bg`, `--accent-glow`, and `--accent-glow-strong`, replacing the prior 8-digit hex (which Tizen 2.4 WebKit does not parse — a latent v0.1.0 bug). Commit `2844c08`.
- [x] #16 — SidebarPlex brand mark replaced with typographic "SP" (`@font-display`, 26px, accent-coloured). Diamond SVG and "Moonfin" wordmark dropped. Commit `c378414`.
- [x] #4 — LibraryPlex header search reads "Search". Behaviour unchanged via the explicit `onOpenSearch` prop. Commit `bbbe855`.
- [x] #6 — ViewToggle removed from LibraryPlex (import, viewMode state, JSX, `viewMode === 'list'` branch, `.viewToggleWrap` LESS). `components/plex-ui/ViewToggle/*` files left in place per prompt. Commit `c5d537a`.
- [x] #5 — `components/plex-ui/FilterMenu/*` added (Spotlight-trapped, anchor-positioned, ≤320×360, ESC/Back/d-pad LEFT closes, returns focus to anchor chip). FilterChip gains `onActivate(value, anchorEl)` prop. LibraryPlex wires functional menus for All Genres, Year, and Rating; chips show the applied filter's label; the grid refilters live. Commit `1114c95`.
- [x] #7 — PosterCard `.title { line-height: 1.2 }` and `.subtitle { margin-top: 4px }`. Commit `4197735`.
- [x] #8 — MetadataPill `.pill { line-height: 1 }` so the label sits centred in the 22px pill. Commit `ea2f3ba`.
- [!] #13 — Reverse-scroll: applied candidate 1 (`overscroll-behavior-y: contain` on LibraryPlex `.content`) and candidate 2 (`contain: layout style` on PosterGrid `.grid`) speculatively. Bug does not reproduce in Chromium / Playwright; per prompt risk note, marked `[!] verified on dev server only, awaiting Q90R re-test`. Commit `c77ad20`.

**Commits (oldest → newest):**
- `1945895` docs(adr): add ADR-0006 single outer SidebarPlex
- `72f7c63` fix(plex-ui): default navbarPosition to 'left' [#2]
- `31b2335` fix(plex-ui): drop Navbar Position and Card Focus Expansion rows [#14] [#15]
- `ea08279` fix(plex-ui): render SidebarPlex once at the App level [#1] [#12]
- `88cab43` fix(plex-ui): wire BrowsePlex Play handler to Player [#11]
- `b39fb3a` fix(plex-ui): pass Genres param to api.getItems in LibraryPlex [#9]
- `89dafd0` fix(plex-ui): show items for Folders libraries in LibraryPlex [#10]
- `2844c08` fix(plex-ui): derive focus glow from accent preset at runtime [#3]
- `c378414` fix(plex-ui): replace SidebarPlex brand with typographic "SP" mark [#16]
- `bbbe855` fix(plex-ui): library header search label reads "Search" [#4]
- `c5d537a` fix(plex-ui): remove ViewToggle from LibraryPlex [#6]
- `4197735` fix(plex-ui): tighten PosterCard title/year spacing [#7]
- `ea2f3ba` fix(plex-ui): vertically centre MetadataPill label [#8]
- `c77ad20` fix(plex-ui): contain elastic overscroll on LibraryPlex grid [#13]
- `1114c95` fix(plex-ui): functional FilterMenu popovers for LibraryPlex chips [#5]
- `0100765` chore(plex-ui): silence unused-var warning on getNavPositionOptions
- `728ddb2` docs(plex-ui): add v0.1.1 ticket + prompt and gitignore playwright artefacts

**Decisions:** ADR-0006 (`decisions/0006-single-outer-sidebar.md`, Accepted, supersedes the inline-sidebar pattern from TKT-04 and TKT-05). No other ADRs created. Allow-list (ADR-002) unchanged — modifications touched only `App/App.js`, `context/SettingsContext.js`, `views/Settings/Settings.js` (additive), and `package.json` was untouched.

**Verified (build gates):**

```text
$ npm run --workspace=@moonfin/app lint
> @moonfin/app@2.4.0 lint
> enact lint .
[baseline-browser-mapping] The data in this module is over two months old.
Browserslist: browsers data (caniuse-lite) is 6 months old.
(0 errors, 0 warnings — Plex-UI code clean)
```

```text
$ npm run build:tizen
[✓] Package created: Moonfin_Tizen_Regular_2.4.0.wgt (3.87 MB)
══════════════════════════════════════════════════
  Build Complete! (v2.4.0)
══════════════════════════════════════════════════
```

```text
$ npm run build:tizen:legacy
[✓] Package created: Moonfin_Tizen_Legacy_2.4.0.wgt (3.86 MB)
══════════════════════════════════════════════════
  Build Complete! (v2.4.0)
══════════════════════════════════════════════════
```

**Verified (legacy-envelope grep audit, plex-ui directories only):**

```text
$ grep -rn "transition: all" packages/app/src/{components,views,styles}/plex-ui | grep -v "//"
packages/app/src/views/plex-ui/README.md:72: ...no `transition: all`. See ADR-003...   (documentation only)

$ grep -rn "backdrop-filter" packages/app/src/{components,views,styles}/plex-ui | grep -v "//"
packages/app/src/views/plex-ui/README.md:71: ...no `backdrop-filter`, no flex `gap`... (documentation only)

$ grep -rn "aspect-ratio" packages/app/src/{components,views,styles}/plex-ui | grep -v "//"
packages/app/src/views/plex-ui/README.md:72: ...`aspect-ratio`... (documentation only)

$ grep -rn "rgba(124, 92, 252" packages/app/src/{components,views,styles}/plex-ui | grep -v "//"
(no matches — only commentary in tokens.less:18 explaining the constraint)

$ grep -rn "^[[:space:]]*gap:" packages/app/src/{components,views,styles}/plex-ui
(no matches — `grid-row-gap` / `grid-column-gap` only)
```

**Verified (Playwright):** `baseline-00-initial.png` at `/tmp/v0.1.1/baseline-00-initial.png` captures the dev server's pre-auth "Connect to Server" screen. The dev server requires a Jellyfin sign-in before any plex-ui surface (BrowsePlex / DetailsPlex / LibraryPlex / SettingsPlex) renders; no credentials are wired into this session, so Playwright cannot drive the affected screens. Per the prompt's bug #13 risk-note pattern, end-user visual verification of every plex-ui surface is therefore Q90R-pending. The grep audits and Tizen build gates above are the in-session evidence for code correctness; on-device QA against the .wgt files at the repo root is the next gate.

**Tag:** `plex-ui-v0.1.1` (created locally; push pending the final `git push` below).

**Allow-list adherence (ADR-002):** Upstream-side modifications this round: `packages/app/src/App/App.js`, `packages/app/src/context/SettingsContext.js`, `packages/app/src/views/Settings/Settings.js`. `package.json` untouched. All other code paths live under `packages/app/src/{components,views,styles}/plex-ui/` per ADR-001.

**Rollout summary:** v0.1.1 closes every functional bug from the Q90R QA pass — Play actually plays, Genres → Library populates, Folders libraries list items, the sidebar is one single outer instance with the SP mark, the filter chips open real menus, and switching accent preset propagates to every focus ring. Two items carry `[!]` for confirmation on the device: bug #13 (overscroll) because Chromium doesn't reproduce the rubber-band, and indirectly every visual fix (#3, #4, #6, #7, #8, #11, #12, #16) because Playwright cannot pass the Jellyfin sign-in gate in this session. The Q90R deploy is the deciding gate.

**Next:** Push `phase/7-v0.1.1-fixes`, push the `plex-ui-v0.1.1` tag, then human Q90R deploy + visual QA of the .wgt artefacts.

## 2026-05-21 15:46 — Plex-UI v0.1.1 — Playwright QA pass

**Scope:** End-to-end QA against the live dev server using `MumDad@192.168.0.2:8096`. Drove every Verification step from `tickets/prompt-0.1.1.md` and fixed every regression surfaced.

**Tasks (per-step status, drove each via Playwright):**
- [x] Step 1 — Sign in. Server `192.168.0.2:8096` → "Who's watching?" profile picker → MumDad → BrowsePlex lands. Evidence: `/tmp/v0.1.1/v1-step1-after-signin.png`.
- [x] Step 2 — Default landing is left-sidebar Browse, SP brand mark visible, no purple in the active theme. Evidence: `/tmp/v0.1.1/v2-step2-browseplex.png`.
- [x] Step 3 — FeaturedHero "Play" button routed to PANELS.PLAYER. Player rendered "AVPlay not available" (expected — Tizen-only API on Chromium). The routing is the bug-fix gate, and it fired. Evidence: `/tmp/v0.1.1/v3-step3-after-play.png`.
- [x] Step 4 — Continue Watching card → PANELS.PLAYER with resume; the second card click was a Petersfield concert which routed straight to playback. Evidence: `/tmp/v0.1.1/v5-resume.yml`.
- [!→x] Step 5 — Genres → Thriller. Initially showed "0 items" on first walkthrough. **Root cause:** the v0.1.0 client-side filter `result.filter(it => it.Genres.includes(genreFilter))` zapped every row because `Fields` did not request `Genres`, so the API returned items without a `Genres` array. **Fix:** added `Genres` to `Fields`; dropped the now-redundant client-side filter; also made the synthetic-library flow (library === null, or library.Id null) work by dropping `ParentId` from the request and falling the title back to the `genreFilter` prop. Post-fix: Thriller → 200 items (Limit capped). Evidence: `/tmp/v0.1.1/v13-thriller-200.png`. Commit `3fd1551`.
- [x] Step 6 — Sidebar → Folders → 9 items rendered. Evidence: `/tmp/v0.1.1/v14-folders-page.png`.
- [x] Step 7 — Library header search button reads "Search"; clicking opens global Search. Evidence: snapshot `/tmp/v0.1.1/v14-folders.yml`.
- [!→x] Step 8 — FilterMenu popovers. Initially the menus did not open: React threw `Cannot set properties of undefined (setting 'top')` inside `<FilterMenu>` because `SpotlightContainerDecorator` does not forward refs to its DOM node, so `ref.current.style` was undefined. **Fix:** menu now takes `anchorRect` (a plain DOMRect-shaped object) computed by the caller at click time, and positions itself via inline style — no imperative DOM mutation. Post-fix: All Genres on Films → 20-row menu, Crime selection → 44 films; Year menu → descending years 2026→…; Rating menu populated. Evidence: `/tmp/v0.1.1/v17-films-menu.png`, `/tmp/v0.1.1/v19-year-menu.yml`, `/tmp/v0.1.1/v18-after-crime.yml`. Commit `3fd1551`.
- [x] Step 9 — No grid/list toggle in LibraryPlex. Confirmed via filter-row snapshot — only the six filter chips, no ViewToggle.
- [x] Step 10 — PosterCard title `line-height: 15.6001px` (13 × 1.2) and subtitle `margin-top: 4.00008px` measured via getComputedStyle. Title/year cluster tight as designed.
- [x] Step 11 — DetailsPlex (`Unlocked` opened via FeaturedHero "More info"). MetadataPill measured `line-height: 13.0001px`, `height: 22px`, `vertical-align: middle` — the label sits centred. Outer sidebar visible to the left; no gap. Evidence: `/tmp/v0.1.1/v22-detailsplex.png`.
- [!] Step 12 — Scroll bounce: not reproducible in Chromium. Speculative fix (`overscroll-behavior-y: contain` + `contain: layout style`) is in place from the initial round. Still `[!] verified on dev server only, awaiting Q90R re-test`.
- [x] Step 13 — Settings → Personalization → Navigation: no "Navbar Position" row. → General Style: no "Card Focus Expansion" row. Confirmed via snapshot grep.
- [x] Step 14 — Settings → Personalization → Appearance → Plex Gamboge. CSS vars on `:root` switch atomically: `--accent: #E5A00D`, `--accent-2: #F2C66B`, `--pill-bg: rgba(229, 160, 13, 0.18)`, `--accent-glow: rgba(229, 160, 13, 0.4)`, `--accent-glow-strong: rgba(229, 160, 13, 0.6)`. Reverting to Moonfin Purple restored `#7C5CFC`. Evidence: `/tmp/v0.1.1/v28-gamboge-active.png`.
- [x] Step 15 — Both Tizen builds re-ran clean after the QA fixes:
  - `Moonfin_Tizen_Regular_2.4.0.wgt` (3.87 MB, built 13:46)
  - `Moonfin_Tizen_Legacy_2.4.0.wgt` (3.86 MB, built 13:46)

**Commits added this pass:**
- `3fd1551` fix(plex-ui): drive genre flow + FilterMenu positioning [#5] [#9]

**Files changed:** `packages/app/src/views/plex-ui/LibraryPlex/LibraryPlex.js`, `packages/app/src/components/plex-ui/FilterMenu/FilterMenu.js`. No upstream-allow-list files touched in this pass.

**Verified by:** Playwright headless against `http://localhost:8080` while signed in as MumDad@192.168.0.2:8096, plus `getComputedStyle` measurements for spacing/centring claims and `getPropertyValue('--*')` for accent token propagation.

**Tag status:** `plex-ui-v0.1.1` on `origin` still points at `728ddb2`, which predates `3fd1551`. The branch is now ahead of the tag by one commit (the QA hotfix). Recommend the human re-tag — either delete + push `plex-ui-v0.1.1` (destructive on the tag only; the .wgt artefacts have been rebuilt) or tag a follow-up `plex-ui-v0.1.1.1`. Not done autonomously because re-tagging is a force-push variant and the project CLAUDE.md rules out destructive git ops without explicit ask.

**Next:** Decide on the tag (re-tag v0.1.1 vs. follow-up tag) and human Q90R deploy of the rebuilt .wgt files.
