# Plex-UI v0.1.1 — On-device bug-fix round

## Version & scope

Patch release on top of `plex-ui-v0.1.0`. Sixteen on-device bugs reported after Samsung Q90R QA. Three of those (content hidden under sidebar, broken playback dispatch, Genres → empty Library) are functionality-breaking; the rest are visual / Settings / UX-polish. This ticket is the long-lived spec for the round; the executable instructions live in `prompt-0.1.1.md`.

Branch: `phase/7-v0.1.1-fixes` from `plex-ui`.
Tag at completion: `plex-ui-v0.1.1`.
Verification gate: dev-server + Playwright + `npm run lint` + `npm run build:tizen` + `npm run build:tizen:legacy`.

## Background

`plex-ui-v0.1.0` shipped via the one-shot prompt (`prompts/ONESHOT-execute-all.md`). All seven TKT-NN tickets were closed with lint+tizen build verification; end-user verification was deferred to the human's Q90R deploy. Q90R QA uncovered the bugs listed below. None are caused by upstream-allow-list violations; the fixes stay inside the existing allow-list (App.js, SettingsContext.js, Settings.js, package.json) plus the `plex-ui/` namespaced directories.

ADR-001/-002 layout decisions are amended by a new ADR (**ADR-006: single outer sidebar**) which supersedes the per-view inline-sidebar pattern introduced in TKT-04 and TKT-05.

## Goals

For each numbered bug below, ship a verified fix. Verification means: reproduced in the dev server via Playwright before the fix, fixed, re-verified post-fix, build gates clean.

1. **Content offset.** With the left sidebar always open, main content must not be hidden behind it. Total layout width must not introduce right-edge cut-off.
2. **Default sidebar = left.** `SettingsContext.defaultSettings.navbarPosition` flips from `'top'` to `'left'`.
3. **Accent matches preset.** The active-pill and focus-glow colours in SidebarPlex (and any other plex-ui module) must derive from the current accent token, not from a hard-coded `rgba(124, 92, 252, …)` literal.
4. **Library search label.** The header search button reads `Search` (not "Search Downloads" / "Search [Library]"). Behaviour unchanged — it opens the global Search.
5. **Filter chips work.** All Genres, Year, Rating chips open functional popover dropdowns. Selecting a value applies the filter to the current Library view's items.
6. **Remove ViewToggle.** The grid/list toggle and the "List view — coming soon" branch are removed from LibraryPlex.
7. **Year-under-title spacing.** Title and year in the grid PosterCard cluster as one block — title `line-height: 1.2`, subtitle `margin-top` adjusted to ~4 px.
8. **MetadataPill vertical centre.** Pills used in DetailsPlex facts row are visually centred — `line-height: 1` (or matching `height`).
9. **Genres → Library filters correctly.** Selecting a genre from the Genres view yields a populated Library page. `LibraryPlex` passes `Genres: genreFilter` to `api.getItems`.
10. **Folders library works.** Selecting the "Folders" entry in the Sidebar lists the folder's items. `itemTypeForLibrary` handles `CollectionType === 'folders'` correctly.
11. **Play actually plays.** Pressing Play on the FeaturedHero starts the Player for the featured item. Pressing a Continue Watching card resumes its playback directly (`onPlay(item, resume=true)`). No more random-Hobbit detour.
12. **Image-9 sidebar gap.** Same root cause as #1 — fixed by ADR-006.
13. **No reverse-scroll on grid.** Diagnose the bounce; fix via `overscroll-behavior` or equivalent; document the chosen approach.
14. **Remove Navbar Position from Settings.** Delete the row from `views/Settings/Settings.js`.
15. **Remove Card Focus Expansion from Settings.** Delete the row only; keep the `cardFocusZoom` key in `SettingsContext.defaultSettings` to avoid disturbing persisted user state.
16. **Brand mark = "SP".** Replace the SVG diamond + `Moonfin` text in `SidebarPlex` with the plain text mark `SP`. Style appropriately.

## Non-goals

- No new ADRs beyond ADR-006.
- No virtualisation rework (PosterGrid stays plain CSS Grid; 200-item cap remains).
- No upstream-component renames or rewrites.
- No new locales (UK English in docs/comments only, per project CLAUDE.md).
- No light theme.
- No webOS-side changes.
- No video pipeline changes.

## Constraints

- Upstream allow-list (ADR-002): `App/App.js`, `context/SettingsContext.js`, `views/Settings/*` (additive only), `package.json`. Any other upstream edit must be flagged in PROGRESS.md and stopped before commit.
- Legacy WebKit envelope (ADR-003): no `backdrop-filter`, no flex `gap`, no grid `gap` (use `grid-gap`), no `aspect-ratio`, no `transition: all`. The popover component for #5 must obey these.
- Focus model (ADR-004): two-state focus preserved. New popover items use `.plex-focusable` mixin.
- New ADR-006 takes effect from this ticket. The new file lives at `decisions/0006-single-outer-sidebar.md` and references TKT-04/TKT-05 as the prior design it supersedes.
- UK English in docs and comments. User-facing strings remain on the upstream `en-US` default.
- One Conventional Commit per logical fix (bundling tightly-related styling fixes is acceptable). Commit messages reference the bug number, e.g. `fix(plex-ui): rewire BrowsePlex Play handler [#11]`.

## Acceptance criteria

A. **Per-bug functional gates.** Each numbered bug has a Playwright screenshot pair (before/after) saved under `/tmp/v0.1.1/` and referenced in the PROGRESS.md entry. The post-fix screenshot shows the bug resolved.

B. **Build gates (verbatim output in PROGRESS.md).**
   - `npm run lint` — no errors (browserslist-data warnings allowed).
   - `npm run build:tizen` — produces `Moonfin_Tizen_Regular_2.4.0.wgt` cleanly.
   - `npm run build:tizen:legacy` — produces `Moonfin_Tizen_Legacy_2.4.0.wgt` cleanly.

C. **No new legacy-envelope violations.** Grep proof in PROGRESS.md: zero matches for `backdrop-filter`, `aspect-ratio`, `transition: all`, flex `gap`, grid `gap` (only `grid-gap`), `??`, `Array.flat()`, `Object.fromEntries()` introduced by the new code.

D. **No hard-coded `rgba(124, 92, 252, *)` left in production plex-ui CSS.** Grep proof. Either replaced with `var(--accent)`-derived rgba (computed at runtime by `applyAccentPreset`) or with neutral non-coloured shadows.

E. **ADR-006 file exists**, status `Accepted`, supersedes language present for ADR-001 / TKT-04 / TKT-05 inline-sidebar pattern.

F. **PROGRESS.md updated** with the v0.1.1 entry, per-bug checklist (using `[x] [!] [ ] [~]` legend), per-bug screenshot paths, commit SHAs, the tag.

G. **Tag `plex-ui-v0.1.1` pushed** to `origin`.

## Open questions

None — resolved during planning (functional dropdown chips, keep `cardFocusZoom` key, Continue Watching click resumes).

## Risk notes

- The popover component for #5 is the largest scope item. If on-device QA reveals d-pad navigation problems with the popover, defer the dropdown wiring (revert to static chips) and ship the rest. Mark #5 `[!]` in PROGRESS.md with the reason.
- The reverse-scroll fix (#13) may not reproduce on Chromium/Playwright. If it doesn't, apply the speculative fix (`overscroll-behavior: contain`) and mark `[!] — verified on dev server only, awaiting Q90R confirmation` in PROGRESS.md.
- Removing the inline `<SidebarPlex collapsed>` from DetailsPlex permanently retires the collapsed-rail mockup from `design/mockups/moonfin_02_details.png`. ADR-006 records this consequence.
