# Plex-UI v0.1.1 — execution prompt

## Parent ticket

`tickets/ticket-0.1.1.md`. **Read it first.** It defines goals, non-goals, constraints, and acceptance criteria. This prompt is the executable instruction set; the ticket is the contract.

You also MUST read, in order, before editing anything:

1. `CLAUDE.md` (project)
2. `~/.claude/CLAUDE.md` (user-level)
3. `PROGRESS.md`
4. `ARCHITECTURE.md`
5. `UPSTREAM_SYNC.md`
6. All ADRs under `decisions/`
7. `tickets/ticket-0.1.1.md` (this round's parent)

Print the session-start confirmation line (per user-level CLAUDE.md §9) before any tool calls beyond reading.

## Objective

Land sixteen verified bug-fixes for `plex-ui-v0.1.0`, drive each via Playwright in a running dev server, add ADR-0006, and tag `plex-ui-v0.1.1`.

## Context

Repo root: `/Users/andy/Vibe Coded Stuff/Moonfin_Fork_Tizen`.

Key files (paths are anchors; line numbers from v0.1.0 — re-grep if drift):

- Layout & routing: `packages/app/src/App/App.js` (showNavBar at ~789; BrowsePlex props at ~859; DetailsPlex props at ~882; LibraryPlex props at ~920).
- Settings persistence: `packages/app/src/context/SettingsContext.js` (`navbarPosition` at 65; `cardFocusZoom` at 72; `uiTheme` at 98; `uiThemePreset` at 100).
- Settings view: `packages/app/src/views/Settings/Settings.js` (Card Focus Expansion row at 757; Navbar Position row at 770; Appearance subcategory ~805).
- Sidebar: `packages/app/src/components/plex-ui/SidebarPlex/SidebarPlex.{js,module.less}` (brand at 175–180).
- Accent runtime: `packages/app/src/components/plex-ui/AccentPicker/AccentPicker.js` (`applyAccentPreset` at 30–42).
- Browse: `packages/app/src/views/plex-ui/BrowsePlex/BrowsePlex.js` (`handlePlay` at 66; FeaturedHero at 85; Continue Watching at 94–102).
- Details: `packages/app/src/views/plex-ui/DetailsPlex/DetailsPlex.{js,module.less}` (inline sidebars at 101–105 and 136–150; `.content` margin in the LESS).
- Library: `packages/app/src/views/plex-ui/LibraryPlex/LibraryPlex.{js,module.less}` (`itemTypeForLibrary` at 30–39; `api.getItems` params at 82–91; client-side genre filter at 94–95; inline sidebar at 130–143; placeholder chips at 158–162; ViewToggle at 164–166).
- PosterCard: `packages/app/src/components/plex-ui/PosterCard/PosterCard.module.less` (`.title` at 109; `.subtitle` at 118; `.unwatchedDot` glow at 149).
- MetadataPill: `packages/app/src/components/plex-ui/MetadataPill/MetadataPill.module.less`.
- PosterGrid: `packages/app/src/components/plex-ui/PosterGrid/PosterGrid.module.less` (scroll-fix surface).

Upstream comparison anchors (read-only; do NOT modify):

- `packages/app/src/views/Library/Library.js` — line 247 shows the canonical genre-param shape: `params.Genres = genreFilter`.
- `packages/app/src/services/jellyfinApi.js` — `getItems` signature at 140 / 482; `getGenres` at 223; genre-items helper at 235.

## Task

Work in this order. Do not batch — commit per fix (or per tightly-coupled bundle, e.g. all CSS hex-literal sweeps in one commit).

### Phase A — Read & set up

1. Read all docs listed under **Parent ticket** above. Print the CLAUDE.md confirmation line.
2. `git checkout plex-ui && git pull && git checkout -b phase/7-v0.1.1-fixes`.
3. `npm install` if needed.
4. Start the dev server in the background (whichever script `package.json` exposes — usually `npm start` or `npm run serve`). Capture the URL it prints. If the project lacks a dev script, fall back to running the build in watch mode and serving `dist/` via `npx serve`; record the choice in PROGRESS.md.
5. Confirm the `/playwright-cli` skill is installed (`Skill` tool, `playwright-cli`). Headless mode is the default and the most reliable choice.

### Phase B — ADR-0006

Write `decisions/0006-single-outer-sidebar.md` (status: Accepted, dated today, supersedes the inline-sidebar pattern from TKT-04/TKT-05). Use the ADR template from user-level CLAUDE.md §2. Body must explain:

- Context: navbarPosition default flipped to 'left'; inline sidebars in DetailsPlex/LibraryPlex now double-render against App.js's outer SidebarPlex.
- Decision: SidebarPlex rendered once at the App level for the entire Plex UI surface. Inline `<SidebarPlex>` removed from DetailsPlex and LibraryPlex. App.js's `showNavBar` extended to keep the sidebar visible across all Plex panels (BROWSE, DETAILS, LIBRARY, SEARCH, GENRES, FAVORITES, SETTINGS).
- Alternatives: keep inline sidebars and hide App.js's outer one for DETAILS/LIBRARY (rejected: double-conditional in App.js, harder to reason about); collapse the App.js sidebar to 88 px on DETAILS only (rejected: design call from the user that the always-expanded sidebar is the new norm).
- Consequences: layout offsets simplify to `margin-left: 280px` on plex-ui view roots. Collapsed-rail mockup retired.

### Phase C — Per-bug fixes

For each numbered item below: (1) load the affected screen in Playwright, (2) take a `before` screenshot to `/tmp/v0.1.1/<bug-N>-before.png`, (3) implement the fix, (4) take an `after` screenshot, (5) commit with `fix(plex-ui): <summary> [#N]`, (6) record both screenshot paths plus the commit SHA in PROGRESS.md.

**#2 — Default sidebar = left.** `SettingsContext.js:65` → `navbarPosition: 'left'`. Confirm a fresh sign-in lands on the left-sidebar layout.

**#14 — Remove Navbar Position row from Settings.** Delete `Settings.js:770`. Confirm the row no longer renders in Personalization. The `getNavPositionOptions` helper may stay (used nowhere else now, but pruning it is out of scope — leave it).

**#15 — Remove Card Focus Expansion row.** Delete `Settings.js:757`. Leave `cardFocusZoom` in `SettingsContext.defaultSettings`.

**#1 + #12 — Single outer sidebar (ADR-006).**
- In `App.js`, extend `showNavBar` so the sidebar renders across all Plex panels. Suggested shape: when `settings.uiTheme === 'plex'`, force `showNavBar = true` for PANELS.BROWSE, DETAILS, LIBRARY, SEARCH, GENRES, FAVORITES, SETTINGS (anything except LOGIN, PLAYER, ADD_SERVER, ADD_USER).
- Delete the inline `<SidebarPlex collapsed>` blocks in `DetailsPlex.js` (lines 101–105 and 136–150).
- Delete the inline `<SidebarPlex>` block in `LibraryPlex.js` (lines 130–143).
- Remove the now-unused sidebar prop props (`libraries`, `activeView`, `onHome`, `onSearch`, `onShuffle`, `onGenres`, `onFavorites`, `onDiscover`, `onSettings`, `onSelectLibrary`, `onUserMenu`, `onSyncPlay`) from DetailsPlex and LibraryPlex signatures AND from their call sites in App.js.
- In `DetailsPlex.module.less`, set `.content { margin-left: 280px }`. Make sure the backdrop wrap accounts for the same offset (or extend the backdrop full-bleed and let the sidebar overlay it).
- In `LibraryPlex.module.less`, keep `.content { margin-left: 280px }`.
- In `BrowsePlex.module.less`, keep `.view { margin-left: 280px }` (already correct).

**#11 — Play handler.**
- In `App.js`, add `onPlay={handlePlay}` to the BrowsePlex render at ~859.
- In `BrowsePlex.js`, accept `onPlay` in the props destructure (around line 30); change `handlePlay` (line 66) to `(item) => onPlay?.(item)`.
- For Continue Watching: change `handleSelect` for resume-row cards to `(item) => onPlay?.(item, true)`. (Decision #3.)
- Verify in Playwright: from a fresh BROWSE panel, press the FeaturedHero Play button → expect PLAYER panel; click a Continue Watching card → expect PLAYER panel with `resume=true`.

**#9 — Genres filter.** In `LibraryPlex.js`, add `Genres: genreFilter || undefined` to the `api.getItems` params object at line 82–91. Keep the client-side filter (line 94–95) as defence-in-depth, OR drop it; document the choice. Verify in Playwright: from the Genres view, click a genre → Library page renders that genre's items (>0).

**#10 — Folders library.** In `LibraryPlex.js`, update `itemTypeForLibrary` (line 30–39): add `case 'folders': return '';` (or omit `IncludeItemTypes` entirely when the library is a folders collection). Verify Playwright can select Folders from the sidebar and see items.

**#3 + accent-cleanup sweep.**
- `applyAccentPreset` already writes `--accent`, `--accent-2`, `--pill-bg`. Verify both `Plex Gamboge` and `Jellyfin Indigo` presets show their colour in the sidebar's active pill and focus glow (use Playwright + Settings panel to switch presets).
- `grep -rn "rgba(124, 92, 252" packages/app/src/components/plex-ui packages/app/src/views/plex-ui packages/app/src/styles/plex-ui` — every match in production CSS must be replaced. Options:
  - Use a runtime CSS custom property `--accent-glow` set by `applyAccentPreset` (e.g. `accent + '66'` for ~40 % alpha), then reference `var(--accent-glow)` in box-shadows.
  - Or drop the coloured glow entirely on focus and use a neutral white ring.
  - Document the choice in the ADR-0006 body or the commit message.

**#16 — Brand mark "SP".** In `SidebarPlex.js:175–180`, replace the `<svg className={css.brandMark}>…</svg>` + `Moonfin` text with a single `<span className={css.brandText}>SP</span>` (or two stacked spans if the design needs a styled "SP" mark). In `SidebarPlex.module.less`, restyle `.brand` so the mark sits where the diamond used to — typography ramp from ADR-003 (`@font-display`, ~24–28 px).

**#4 — Library search label.** `LibraryPlex.js:153` → `<span>{$L('Search')}</span>`. No behaviour change.

**#6 — Remove ViewToggle.** Delete the import (line 23), the `viewMode` state (line 72), the `<span className={css.viewToggleWrap}><ViewToggle …/></span>` JSX (lines 164–166), and the `viewMode === 'list'` branch (lines 173–175). Also drop `css.viewToggleWrap` from the LESS file. Leave `components/plex-ui/ViewToggle/` files in place (out of scope to delete).

**#5 — Filter chip popovers.** This is the chunkiest item.
- Create `packages/app/src/components/plex-ui/FilterMenu/{FilterMenu.js,FilterMenu.module.less,index.js}`. The component takes `anchorEl`, `items`, `selectedValue`, `onSelect`, `onClose`. It renders a small surface (≤320 × ≤360 px), absolutely positioned beneath the anchor's bounding box. Spotlight-trapped via `SpotlightContainerDecorator` with `restrict: 'self-only'`. ESC and d-pad LEFT close the menu (return focus to the anchor chip).
- Wire `FilterChip` to fire `onActivate` (existing `onClick` for active toggles is preserved; `hasMore` chips now route through `onActivate`).
- In `LibraryPlex`, replace the three placeholder chips:
  - All Genres → opens a FilterMenu with distinct genre strings from the fetched items (or, ideally, `api.getGenres(library.Id)`). Selecting a value sets local `genresFilter` (this is a NEW state, distinct from App.js's `genreFilter` which comes from the Genres view). Apply via the existing `if (genreFilter) {…}` client-side filter or by re-fetching with the API param.
  - Year → distinct ProductionYear buckets (descending). Selecting filters client-side.
  - Rating → buckets (≥9, ≥8, ≥7, ≥6, Any). Selecting filters client-side.
- All three menus must honour the legacy WebKit envelope (no backdrop-filter, no flex gap, etc.).
- Verify with Playwright: open the chip menu, walk it with the keyboard, select a value, confirm the grid shrinks/refilters.
- If popover focus-trapping turns out to be flaky on Tizen, ship static chips again and mark this `[!]` in PROGRESS.md with the reason. Do not block the rest of the round.

**#7 — Year/title spacing.** `PosterCard.module.less` → `.title { line-height: 1.2 }`, `.subtitle { margin-top: 4px }`. Verify in the grid view.

**#8 — MetadataPill vertical centring.** `MetadataPill.module.less` → add `line-height: 1` (or `line-height: 22px`) to `.pill`. Verify against the Details facts row.

**#13 — Reverse-scroll on grid.**
- Diagnose first: in Playwright, scroll the LibraryPlex grid to the top/bottom and use `browser_evaluate` to inspect transforms / scroll positions / overscroll events. Capture the symptom in a screencap if possible.
- Hypothesis (most likely): WebKit elastic overscroll + the `transform: scale(1.04)` focus state on PosterCards near the edge produces an inverted-feeling rubber-band. Fix candidates, in order of preference:
  1. `LibraryPlex.module.less` → `.content { overscroll-behavior-y: contain }` (and `-webkit-overflow-scrolling: touch` only where needed).
  2. PosterGrid `.grid { contain: layout style }` so a focused card's transform doesn't leak into the scroll container's layout.
  3. Pin `transform-origin: center` explicitly on the focused card.
- Apply the smallest fix that works on the dev server. Document the chosen approach in the commit and PROGRESS.md.
- If the bug doesn't reproduce in Chromium, apply candidate 1 speculatively and mark `[!] verified on dev server only, awaiting Q90R re-test` in PROGRESS.md.

### Phase D — Verification gates

1. `npm run lint` — paste verbatim tail into PROGRESS.md.
2. `npm run build:tizen` — confirm `Moonfin_Tizen_Regular_2.4.0.wgt` appears at repo root.
3. `npm run build:tizen:legacy` — confirm `Moonfin_Tizen_Legacy_2.4.0.wgt` appears at repo root.
4. Run the performance grep audit again (from TKT-06):
   - `grep -rn "transition: all" packages/app/src` — zero matches in plex-ui production CSS.
   - `grep -rn "backdrop-filter" packages/app/src` — zero matches in plex-ui production CSS.
   - `grep -rn "aspect-ratio" packages/app/src` — zero matches in plex-ui production CSS.
   - `grep -rn "rgba(124, 92, 252" packages/app/src` — zero matches outside ADR/commentary.
5. Take a final Playwright walkthrough: Browse → click Continue Watching → Player → back → Genres → pick a genre → Library populated → toggle a popover filter → open Settings → confirm rows removed → switch accent preset → see the sidebar pill change colour.

### Phase E — Land

1. Push the branch.
2. Tag `plex-ui-v0.1.1` and push the tag.
3. Update PROGRESS.md with the v0.1.1 entry (per user-level CLAUDE.md §12 format), including per-bug `[x] / [!] / [ ] / [~]` checklist, screenshot paths, commit SHAs, the tag, build outputs, and a one-paragraph rollout summary.
4. Print the final closing-message footer (per user-level CLAUDE.md §13) including `Verified by: Playwright headless against dev server + Tizen builds` and `PROGRESS.md: updated ✓`.

## Constraints

- Upstream allow-list (ADR-002) — do NOT touch upstream files outside `App.js`, `SettingsContext.js`, `views/Settings/Settings.js`, `package.json`. If a fix appears to require an out-of-allow-list edit, stop and surface it in PROGRESS.md.
- Legacy WebKit envelope (ADR-003) — re-state: no `backdrop-filter`, no flex `gap`, no grid `gap` (use `grid-gap`), no `aspect-ratio`, no `transition: all`. New popover component obeys these from the start.
- Two-state focus model (ADR-004) — popover items use the `.plex-focusable` mixin.
- UK English in docs/comments. User-facing strings remain `en-US`.
- One Conventional Commit per logical fix. Reference the bug number in the message.
- Never use `--no-verify`, never amend, never force-push. Pre-commit hook failures mean you fix the issue and create a new commit.
- If a fix takes >2 hours of diagnosis, mark `[!]` in PROGRESS.md with the reason and move on — don't block the round.

## Acceptance criteria

- All sixteen bugs reproduce → fixed → re-verified in Playwright with screenshot pairs in `/tmp/v0.1.1/`.
- `decisions/0006-single-outer-sidebar.md` exists, status Accepted, supersedes language present.
- `tag plex-ui-v0.1.1` exists locally AND on `origin`.
- PROGRESS.md updated with the v0.1.1 entry, per-bug status, screenshot paths, commit SHAs, build outputs, grep proofs.
- `npm run lint`, `npm run build:tizen`, `npm run build:tizen:legacy` all clean (browserslist-data warnings allowed).
- Zero matches for hard-coded purple (`rgba(124, 92, 252`) in production plex-ui CSS.
- Zero new violations of the legacy envelope.

## Out of scope

- No virtualisation (PosterGrid stays plain Grid; 200-item cap remains).
- No upstream component renames or refactors.
- No new ADRs beyond 0006.
- No light theme.
- No new locales.
- No webOS-side changes.
- No video pipeline changes.
- No deletion of `components/plex-ui/ViewToggle/` files (just remove its use in LibraryPlex).

## Verification (how to confirm end-to-end)

1. Dev server up; sign in fresh.
2. Default route lands on a left-sidebar Browse with the "SP" brand mark — no purple unless `moonfin-purple` preset is active.
3. FeaturedHero Play button → Player panel for the displayed item.
4. Continue Watching card click → Player panel (resume).
5. Sidebar → Genres → pick a genre → Library shows >0 matching items.
6. Sidebar → Folders → Library shows folder items.
7. Library header search reads `Search`; clicking it opens global Search.
8. Library filter chips: All Genres / Year / Rating each open a working popover; selecting a value updates the grid.
9. Library has no grid/list toggle, no "Coming soon" placeholder.
10. PosterCard title and year cluster tight; visual rhythm matches the mockups.
11. DetailsPlex page: facts-row pills are vertically centred, no sidebar gap, no content cut-off.
12. Scroll top/bottom in the grid: no reverse-bounce.
13. Settings → Personalization: no Navbar Position row, no Card Focus Expansion row. Appearance section's accent preset still works.
14. Switch accent preset to Plex Gamboge — sidebar active pill and focus glow show gold, not purple.
15. Both Tizen builds clean.
