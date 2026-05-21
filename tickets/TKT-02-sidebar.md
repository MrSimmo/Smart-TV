# TKT-02 — SidebarPlex

## Objective

Implement the Plex-inspired left navigation. After this ticket: `SidebarPlex` renders when `settings.uiTheme === 'plex'`, falling back to upstream `Sidebar` otherwise. Section labels (DISCOVER / LIBRARIES / MORE), 52px nav rows with icon column + label + optional badge, two distinct focus states (active vs focused per ADR-004), and a server/profile footer. 280px expanded width by default; the `collapsed` prop yields the 88px rail used on the Details page (TKT-04 wires that).

## Phase

02 • **Upstream conflict risk:** LOW for new files; the only upstream edit is the `App/App.js` Sidebar selection conditional, which lives in the allow-list.

## Prerequisites

- TKT-00 (uiTheme flag) and TKT-01 (tokens + mixins) done.
- `decisions/0001-component-isolation.md`, `0002-upstream-rebase-strategy.md`, `0004-focus-state-model.md` read.

## Design reference

- `view` `design/mockups/moonfin_01_home.png`. Specific regions to match:
  - Section labels: 11px, uppercase, `--text-mute`, 0.12em letter-spacing.
  - Nav row: 52px tall, 22px icon column, label, optional badge.
  - Active state: `--pill-bg` background, `--accent-2` icon colour.
  - Focused state: solid `--accent` fill, white text, `scale(1.04)`, accent drop shadow.
  - Server/profile footer row: avatar + name + server hostname + switcher chevron.
- Confirm the focus-state distinction visually before writing CSS — this is the highest-importance visual gate of the whole project.

## Files this ticket creates

- `packages/app/src/components/plex-ui/SidebarPlex/SidebarPlex.jsx`
- `packages/app/src/components/plex-ui/SidebarPlex/SidebarPlex.module.less`
- `packages/app/src/components/plex-ui/SidebarPlex/index.js` — re-export.

## Files this ticket modifies

- `packages/app/src/App/App.js` — add the `SidebarPlex` import + the `settings.uiTheme === 'plex' ? <SidebarPlex .../> : <Sidebar .../>` branch inside the existing `showNavBar && settings.navbarPosition === 'left'` conditional. Single additive change. This is the routing touchpoint promised by ADR-002.

## Acceptance criteria

- [ ] `SidebarPlex` renders in the same slot as upstream `Sidebar` when `uiTheme === 'plex'` and `navbarPosition === 'left'`.
- [ ] Upstream `Sidebar` still renders correctly when `uiTheme === 'original'`. Toggle via Settings and verify both paths.
- [ ] Section labels match the mockup (DISCOVER, LIBRARIES, MORE) at 11px uppercase `--text-mute` with 0.12em letter-spacing.
- [ ] Nav rows are 52px tall with the icon/label layout from the mockup.
- [ ] **Active state** matches mockup (current-route pill: `--pill-bg`, `--accent-2` icon, no scale).
- [ ] **Focused state** matches mockup (Spotlight cursor: solid `--accent`, white text, `scale(1.04)`, accent drop shadow). Cannot collapse into the active state.
- [ ] Library counts come from the same Jellyfin endpoint upstream Sidebar uses — **find and reuse**, do not recreate. (Likely `api.getViews()` or similar from `services/jellyfinApi.js`.)
- [ ] Server/profile footer renders avatar + display name + server hostname + chevron.
- [ ] Sidebar accepts a `collapsed` prop. When `true`, renders the 88px rail (icon-only). When `false`, renders the 280px expanded version. Default `false`.
- [ ] Spotlight nav: d-pad up/down moves between rows; d-pad right exits to the main content area; d-pad left from the main area returns focus to the previously focused row.
- [ ] No `transition: all`, no `backdrop-filter`, no flex `gap`. `will-change: transform` only on the focused row.
- [ ] `npm run lint` clean.
- [ ] `npm run build:tizen` and `npm run build:tizen:legacy` both clean.
- [ ] PROGRESS.md updated.

## Technical notes

- Use Sandstone's `Spottable` HOC on the row container. The label, icon, and badge live inside that container — the whole row is one focusable element.
- Wrap the rows list in `SpotlightContainerDecorator` so spatial nav inside the sidebar behaves predictably.
- Reuse the existing library-count fetch from the upstream Sidebar — `services/jellyfinApi.js` exposes `api.getItems(...)` and similar; the upstream Sidebar already calls one of these. Locate the call site and reuse the same hook/data flow.
- Server hostname is in `SettingsContext` (existing `serverUrl` or equivalent). Display the hostname portion only (strip protocol + path).
- Plex accent preset (`#E5A00D`) is NOT this ticket's concern — accent tokens come from ADR-003 and are wired here as-is; preset switching is TKT-06.

## Out of scope

- The collapsed rail rendering in the Details view — the prop exists; the consumer is TKT-04.
- Any change to the upstream Sidebar component.
- Library-list reordering or filter UI — that's the Library view's concern.

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

I will deploy to the Samsung Q90R and verify by toggling `uiTheme` in Settings, then walking the sidebar with the remote to confirm both focus states and the route-switching behaviour.

## Status: ✅
