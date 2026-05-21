Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/` before starting. Print the session-start confirmation line per user-level `~/.claude/CLAUDE.md` section 9.

You are implementing ticket TKT-00. Read `tickets/TKT-00-setup.md` in full.

Then:

1. `view` `design/mockups/moonfin_01_home.png` to absorb the design language. No code in this ticket consumes the mockup directly.
2. Inspect the existing `packages/app/src/context/SettingsContext.js` to understand the persist/hydrate pattern used for keys like `navbarPosition` and `focusColor`. Match that pattern exactly for `uiTheme`.
3. Inspect `package.json` at the repo root to find a clean place to add a `"_fork"` marker key.
4. Implement the ticket:
   - Create `.gitkeep` files in `packages/app/src/{views,components,styles}/plex-ui/`.
   - Add `uiTheme` key to `SettingsContext` with default `'plex'` and full persist/hydrate.
   - Update `package.json` `description` and add `"_fork": "Plex-inspired UI variant of Moonfin-Client/Smart-TV"` near the top of the JSON.
5. Run `npm run lint`. Fix issues.
6. Run `npm run build:tizen`. Verify clean build.
7. Run `npm run build:tizen:legacy`. Verify clean build.
8. Update `PROGRESS.md` per user-level CLAUDE.md section 12. Tick TKT-00.
9. Commit with a conventional-commits message: `chore(plex-ui): scaffold directories and uiTheme flag (TKT-00)`.

Constraints:
- New files only, except the two allow-listed files (`SettingsContext.js`, `package.json`). No other upstream files may be modified.
- UK English in comments and commit messages.
- No `transition: all`, no `backdrop-filter`, no flex `gap` (no styling work in this ticket, but the rules apply going forward).
- Do not touch `App/App.js` in this ticket. The routing branch is added in TKT-02 once SidebarPlex exists.

If you hit a blocker, stop and write the blocker to `tickets/TKT-00-setup.md` under a `## Blocked` heading. Do not improvise. Do not silently widen the allow-list.

Verify completion by running the three commands in the ticket's Verification section and pasting the verbatim output back. Mark the ticket `Status: ✅` only after every acceptance criterion is ticked.
