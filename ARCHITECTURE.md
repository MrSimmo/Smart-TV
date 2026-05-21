# Moonfin Plex-UI Fork — Architecture

## Purpose

This repository is a fork of [Moonfin-Client/Smart-TV](https://github.com/Moonfin-Client/Smart-TV) that ships a **Plex-inspired UI variant** for the Tizen target. The fork must continue to absorb upstream changes weekly with near-zero merge conflicts, so the architecture is shaped end-to-end by that constraint.

This document is the why-and-what. Detailed decisions live in `decisions/`. Execution-session conventions live in `CLAUDE.md`. Phase progress lives in `PROGRESS.md`. Rebase mechanics live in `UPSTREAM_SYNC.md`.

## Goals

1. Deliver a Plex-inspired UI on Tizen that matches the three mockups in `design/mockups/` with high fidelity.
2. Keep upstream rebases boring — the fork modifies a small, explicit allow-list of upstream files and adds everything else under `plex-ui/` namespaced directories.
3. Preserve every existing capability that upstream users rely on: theme music, screensaver, UI scale, sidebar library toggle (2.3.0+), home row backdrop toggle (2.2.0+), the existing accent picker.
4. Stay within the legacy WebKit r152340 / Tizen 2.4 capability envelope so a single CSS source compiles to both the modern (`build:tizen`) and legacy (`build:tizen:legacy`) bundles.

## Non-goals

- Changing the video pipeline (`platform-tizen/`, AVPlay integration).
- Changing webOS-specific code, configs, or build outputs. Shared `packages/app/` code paths must remain webOS-safe by inspection.
- Localising new strings beyond UK English in docs/comments. No new locale dirs.
- Replacing the existing accent picker; the Plex preset is added alongside the current Moonfin default.

## High-level structure

The fork adds three namespaced directories under `packages/app/src/`:

```
packages/app/src/
  components/plex-ui/        # New Plex components (Sidebar, FeaturedHero, posters, chips, ...)
  views/plex-ui/             # New Plex views (BrowsePlex, DetailsPlex, LibraryPlex)
  styles/plex-ui/            # New tokens.less, base.less — loaded after Sandstone
```

A single `uiTheme` runtime setting (persisted in `SettingsContext`, default `'plex'`) toggles between the upstream UI and the Plex UI. The toggle is read in `App/App.js` and selects which Sidebar/Browse/Details/Library component is rendered.

## Upstream allow-list (the only files we modify)

Listed in full in ADR-002. Summary:

1. `packages/app/src/App/App.js` — Plex-component imports + a single conditional block in the existing `showNavBar` branch (lines ~781–810).
2. `packages/app/src/context/SettingsContext.js` — one new `uiTheme` key with default + persist.
3. `packages/app/src/views/Settings/*` — one new "Appearance / UI theme" row (additive only).
4. `package.json` — description + a `// fork` marker.

Anything else is forbidden. ADR-001 explains why.

## Design tokens

CSS custom properties on `:root`, defined in `packages/app/src/styles/plex-ui/tokens.less`. The token table is the authoritative source for colour, focus, accent, spacing and is reproduced in ADR-003. The existing `--accent-color` custom property (set from `settings.focusColor` at `App/App.js:179`) is preserved; Plex tokens layer on top.

## Focus model

Two distinct states, both reproducible in `design/mockups/moonfin_01_home.png`:

- **active** — current route. Soft accent-tint background (`--pill-bg`), accent-2 icon, normal scale.
- **focused** — Spotlight d-pad cursor. Solid `--accent` fill, white text, `transform: scale(1.04)`, accent drop shadow.

Transitions limited to `transform` and `opacity`. ADR-004 has the full rationale.

## Legacy WebKit envelope

Target is the existing `--legacy` bundle (Tizen 2.4 / WebKit r152340). No `backdrop-filter`, no flex `gap`, no grid `gap` (use `grid-gap`), no `aspect-ratio` (use padding-bottom trick), no `Array.flat()` / `Object.fromEntries()` / `??` / optional chaining in legacy bundle. The codebase already gates these via `polyfills.js` and the `.legacy` HTML class set at lines 125–133. Plex components must satisfy these gates so the same source compiles to both bundles. ADR-003 lists the gates.

## Phases

Phase progress lives in `PROGRESS.md`. Phases run sequentially:

- **Phase 0 (TKT-00)** — Setup, scaffolding, `uiTheme` flag.
- **Phase 1 (TKT-01)** — Design tokens + base styles.
- **Phase 2 (TKT-02)** — SidebarPlex.
- **Phase 3 (TKT-03)** — BrowsePlex + FeaturedHero.
- **Phase 4 (TKT-04)** — DetailsPlex.
- **Phase 5 (TKT-05)** — LibraryPlex grid.
- **Phase 6 (TKT-06)** — Polish, accent preset, visual QA.

One execution session per phase. Conventional commits. Branch `phase/<n>-<slug>`. Tag at phase completion.
