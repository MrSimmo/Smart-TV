Read `CLAUDE.md`, `ARCHITECTURE.md`, and all files under `decisions/` (especially `0005-accent-theme-presets.md`). Print the session-start confirmation line.

You are implementing ticket TKT-06. Read `tickets/TKT-06-polish-qa.md` in full.

Then:

1. `view` all three mockups: `moonfin_01_home.png`, `moonfin_02_details.png`, `moonfin_03_library.png`.
2. Inspect `packages/app/src/views/Settings/*` to find: where sections/rows are declared, how to add a new section additively. This is part of the ADR-002 allow-list (additive only — do not move, rename, or reorder existing sections).
3. Inspect the existing accent picker mechanism at `packages/app/src/App/App.js:179` and wherever `settings.focusColor` is consumed. The Plex preset must keep `focusColor` in sync so the upstream UI still works when `uiTheme === 'original'`.
4. Implement the ticket:
   - Create `AccentPicker.jsx`, `.module.less`, `index.js` under `components/plex-ui/AccentPicker/`.
   - Add `uiThemePreset` key to `SettingsContext` (default `'moonfin-purple'`).
   - Add the "Appearance" section to Settings — one new section, two rows (UI theme toggle, AccentPicker).
   - Wire preset selection to update both `--accent`/`--accent-2` (on `:root`) and `settings.focusColor`.
   - Create `views/plex-ui/README.md` with the screenshot strip, theme-toggle note, and accent-preset list.
5. Run the visual QA pass on all three Plex views:
   - Walk each view with d-pad. Note any dead zones, missing focus rings, or reading-order violations.
   - Switch between accent presets and verify all components pick up the change.
6. Run the performance grep audit per the ticket's Verification section.
7. Run `npm run lint`. Fix issues.
8. Run `npm run build:tizen` and `npm run build:tizen:legacy`. Both clean.
9. Update `PROGRESS.md`. Tick TKT-06. Also update all six previous tickets' `Status: ⬜` to `Status: ✅`.
10. Commit: `feat(plex-ui): add accent presets, Settings integration, and visual QA polish (TKT-06)`. Then tag: `plex-ui-phase-6`.

Constraints:
- The Settings view addition is the only MEDIUM-risk upstream touchpoint. Additive only — do not modify existing sections.
- New files for AccentPicker and the README; existing-file edits limited to the ADR-002 allow-list.
- UK English in comments, commit messages, and the README.

If a blocker arises (especially: the Settings view structure doesn't support clean additive insertion), write to the ticket under `## Blocked` and stop. Discuss before widening the allow-list.

Verify by running the build commands, running the grep audit (all three forbidden patterns return zero matches), and by manually exercising the AccentPicker across all four options against all three Plex views. Mark `Status: ✅` only when every acceptance criterion ticks.
