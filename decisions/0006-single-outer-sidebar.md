# 0006. Single Outer SidebarPlex for the Plex-UI Surface

Date: 2026-05-21
Status: Accepted
Supersedes: the inline `<SidebarPlex>` pattern introduced in TKT-04 (DetailsPlex)
and TKT-05 (LibraryPlex).

## Context

TKT-04 and TKT-05 each rendered their own inline `<SidebarPlex>` instance
(collapsed at 88 px in DetailsPlex, expanded at 280 px in LibraryPlex) on the
assumption that App.js's `showNavBar` gate excluded those panels. When v0.1.1
flipped `SettingsContext.defaultSettings.navbarPosition` from `'top'` to
`'left'` (bug #2), the App.js-level `<SidebarPlex>` started rendering for every
panel that satisfied `showNavBar`, while DetailsPlex and LibraryPlex continued
to render their own inline copies. The result on Q90R was:

- DetailsPlex: two stacked sidebars, content offset wrong, visible gap
  ("image 9 sidebar gap" — bug #12).
- LibraryPlex: two sidebars overlapping, hero/title clipped at the right edge
  (bug #1).

The inline-sidebar pattern was a TKT-04/TKT-05 implementation detail. The
outer App.js sidebar is the canonical Plex-UI navigation surface; duplicating
it per view was the bug.

## Decision

`SidebarPlex` is rendered **once** at the App level for the entire Plex-UI
surface. Inline `<SidebarPlex>` is removed from `DetailsPlex` and
`LibraryPlex`. App.js's `showNavBar` is extended so the sidebar stays visible
across every panel the Plex UI cares about: `BROWSE`, `DETAILS`, `LIBRARY`,
`SEARCH`, `GENRES`, `FAVORITES`, and `SETTINGS` (the panel that hosts the
in-app Settings view; the floating `SettingsPanel` overlay is unaffected). The
sidebar remains hidden for `LOGIN`, `PLAYER`, `ADD_SERVER`, and `ADD_USER`.

Sidebar-only props (`libraries`, `activeView`, `onHome`, `onSearch`,
`onShuffle`, `onGenres`, `onFavorites`, `onDiscover`, `onSettings`,
`onSelectLibrary`, `onUserMenu`, `onSyncPlay`) are dropped from the
`DetailsPlex` and `LibraryPlex` signatures and from their call sites in
`App.js`. Each view's `.content` root is offset by `margin-left: 280px` to
clear the outer sidebar; the collapsed-rail variant is no longer used by
production code.

## Alternatives Considered

- **Keep inline sidebars and hide App.js's outer sidebar for `DETAILS` /
  `LIBRARY`.** Rejected — `showNavBar` would need a double conditional that
  flips per Plex-UI panel; reasoning about which sidebar instance the user is
  focused on becomes hard, and Spotlight container ids would conflict between
  the inline and outer instances.
- **Collapse the App.js sidebar to 88 px on `DETAILS` only.** Rejected — the
  user's design direction is that the always-expanded 280 px sidebar is the
  v0.1.1 norm. Collapsed rails are retired from the production surface.
- **Render two sidebars and z-stack them.** Rejected on grounds of focus
  ambiguity and wasted layout cost.

## Consequences

**Positive**

- One render of `SidebarPlex` per session. No prop-drilling library lists or
  navigation handlers through `DetailsPlex` / `LibraryPlex`.
- `App.js` is the single source of truth for which routes show the sidebar.
- Layout offsets simplify to a flat `margin-left: 280px` on each Plex-UI view
  root. No per-view collapsed/expanded math.
- Spotlight focus history is unified — going Details → Library → back to
  Details lands on the same sidebar instance.

**Negative**

- The 88 px collapsed rail introduced for DetailsPlex in TKT-04 is retired
  from production. The `collapsed` prop on `SidebarPlex` remains available
  (it's a fork-internal API, not a public one) in case a future panel wants it
  back, but the mockup at `design/mockups/moonfin_02_details.png` showing the
  collapsed rail no longer matches the shipping UI.
- Settings panel rendered inside the `SETTINGS` panel inherits the 280 px
  offset; the upstream `Settings.js` view layout already absorbs a sidebar
  through its existing flexbox, so no new style is needed.

**Neutral**

- `components/plex-ui/SidebarPlex/` is unchanged. The component still accepts
  `collapsed`. Removing the inline call sites means the prop is unused at
  runtime — kept for future reuse, not for an immediate consumer.
- Files under the ADR-002 upstream allow-list that change as part of this ADR:
  `App/App.js` (extends `showNavBar`; drops sidebar props from the
  `DetailsPlex` / `LibraryPlex` render branches).

## Implementation note — accent glow runtime token

Bug #3 in the same round replaces every hard-coded `rgba(124, 92, 252, *)`
literal with `var(--accent-glow)` set at runtime by `applyAccentPreset`
(`AccentPicker.js`). This is mentioned here because the sweep affects the
same shadow declarations on the new `.content` margins; recording it in this
ADR keeps the rebase notes in one place.
