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
