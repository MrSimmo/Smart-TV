Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/` (especially `0001`, `0002`, `0004`). Print the session-start confirmation line.

You are implementing ticket TKT-02. Read `tickets/TKT-02-sidebar.md` in full.

Then:

1. `view` `design/mockups/moonfin_01_home.png` carefully — the focus-state distinction is the highest-importance visual gate of the entire project. Confirm you can see both states (active = current route pill, focused = solid accent fill + scale) before writing CSS.
2. Inspect the existing `packages/app/src/components/Sidebar/Sidebar.jsx` (and `.module.less`) to understand: which Jellyfin endpoint feeds the library counts, what Sandstone Spotlight wrapping is used, what props Sidebar receives from `App.js`.
3. Inspect the call site in `packages/app/src/App/App.js` (the `showNavBar && settings.navbarPosition === 'left'` block, around lines 781–810) to plan the additive branch.
4. Implement the ticket:
   - Create `SidebarPlex.jsx`, `.module.less`, and `index.js` under `packages/app/src/components/plex-ui/SidebarPlex/`.
   - Use Sandstone's `Spottable` HOC on each nav row; wrap the whole list in `SpotlightContainerDecorator`.
   - Reuse the library-count fetch from upstream Sidebar — do not recreate.
   - Support a `collapsed` prop (default `false`). When `true`, render the 88px icon-only rail.
5. Add the `App/App.js` branch: `settings.uiTheme === 'plex' ? <SidebarPlex .../> : <Sidebar .../>` inside the existing left-position conditional. Single additive change. No other modifications to `App.js`.
6. Run `npm run lint`. Fix issues.
7. Run `npm run build:tizen` and `npm run build:tizen:legacy`. Both must be clean.
8. Update `PROGRESS.md`. Tick TKT-02.
9. Commit: `feat(plex-ui): add SidebarPlex with two-state focus (TKT-02)`.

Constraints:
- New files only, plus the one allow-listed branch in `App/App.js`. No other upstream modifications.
- Two distinct focus states (active + focused) per ADR-004. Don't collapse them.
- No `transition: all`, no `backdrop-filter`, no flex `gap`. `will-change: transform` only on the focused row.
- UK English in comments and commit messages.
- Do not modify the upstream Sidebar component.

If a blocker arises, write it to the ticket under `## Blocked` and stop. Especially: if you can't find the library-count fetch in the upstream Sidebar, stop and ask — do not invent a new endpoint.

Verify by running the build commands and pasting output. Mark `Status: ✅` only when every box ticks AND you have manually toggled `settings.uiTheme` between `'plex'` and `'original'` (in dev tools or via direct mutation) and confirmed both Sidebars render correctly.
