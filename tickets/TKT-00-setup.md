# TKT-00 — Setup, scaffolding, and `uiTheme` flag

## Objective

Lay the groundwork for the Plex-UI variant. After this ticket: directory skeletons exist, the `uiTheme` runtime flag is wired in `SettingsContext` (default `'plex'`), the routing touchpoint in `App/App.js` is ready to branch on the flag (even though there are no Plex views yet to switch to), and `package.json` is marked as the fork. No UI changes are visible yet.

## Phase

00 • **Upstream conflict risk:** LOW

## Prerequisites

- `design/mockups/moonfin_01_home.png`, `moonfin_02_details.png`, `moonfin_03_library.png` exist on disk.
- `upstream` remote configured (already done — verify only).

## Design reference

- `view` `design/mockups/moonfin_01_home.png` to confirm the design language the future phases will target. No code in this ticket consumes the mockup directly.

## Files this ticket creates

- `packages/app/src/views/plex-ui/.gitkeep`
- `packages/app/src/components/plex-ui/.gitkeep`
- `packages/app/src/styles/plex-ui/.gitkeep`

## Files this ticket modifies

- `packages/app/src/context/SettingsContext.js` — add `uiTheme` key (default `'plex'`), wire persist/hydrate.
- `package.json` — update `description` to mention the Plex variant; add a top-of-file `// fork` marker comment.

`App/App.js` is **not** modified in this ticket — there are no Plex views yet to switch to. The routing branch is added in TKT-02.

## Acceptance criteria

- [ ] Three empty directories with `.gitkeep` files exist under `packages/app/src/{views,components,styles}/plex-ui/`.
- [ ] `settings.uiTheme` defaults to `'plex'` and persists across app restarts.
- [ ] `settings.uiTheme` can be set to `'original'` and persists across app restarts.
- [ ] Changing `settings.uiTheme` does NOT yet visually change the UI (no consumers yet — that's TKT-02).
- [ ] `package.json` description references "Plex-inspired UI" and includes a `// fork` marker.
- [ ] `npm run lint` clean.
- [ ] `npm run build:tizen` clean.
- [ ] `npm run build:tizen:legacy` clean.
- [ ] PROGRESS.md updated with TKT-00 ticked and a one-line summary.

## Technical notes

- The existing `SettingsContext.js` already persists keys like `navbarPosition` and `focusColor`. Follow the same pattern for `uiTheme` — default value in initial state, hydrate from storage on mount, write on change.
- Type: `'plex' | 'original'`. Default: `'plex'`.
- The brief uses the term "config flag"; in this codebase that's the `SettingsContext` key, not an env var or build-time constant.
- `package.json` is a JSON file, so the `// fork` marker has to be added in a way that doesn't break parsing. Use a sibling JSON key like `"_fork": "Plex-inspired UI variant of Moonfin-Client/Smart-TV"` rather than a literal `//` comment.

## Out of scope

- Any UI rendering using the new directories — that lands in TKT-01 and TKT-02.
- Touching `App/App.js` — that lands in TKT-02 once there's a Sidebar variant to switch to.
- Adding an "Appearance" section to Settings — that lands in TKT-06.

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

I will deploy and visually verify on Samsung Q90R hardware (no visible change expected at this phase).

## Status: ✅
