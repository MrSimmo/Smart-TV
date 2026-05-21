# Plan complete — Plex-UI fork scaffolding

This planning session produced the following files. None of them touch application code; they are scaffolding for the seven execution sessions that follow.

## Files written

**Top level:**
- `ARCHITECTURE.md`
- `CLAUDE.md`
- `PROGRESS.md`
- `UPSTREAM_SYNC.md`

**`decisions/` (5 ADRs):**
- `0001-component-isolation.md`
- `0002-upstream-rebase-strategy.md`
- `0003-design-token-system.md`
- `0004-focus-state-model.md`
- `0005-accent-theme-presets.md`

**`tickets/` (7 tickets):**
- `TKT-00-setup.md`
- `TKT-01-design-tokens.md`
- `TKT-02-sidebar.md`
- `TKT-03-browse-hero.md`
- `TKT-04-details.md`
- `TKT-05-library-grid.md`
- `TKT-06-polish-qa.md`

**`prompts/` (8 prompts):**
- `TKT-00-setup.md`
- `TKT-01-design-tokens.md`
- `TKT-02-sidebar.md`
- `TKT-03-browse-hero.md`
- `TKT-04-details.md`
- `TKT-05-library-grid.md`
- `TKT-06-polish-qa.md`
- `ONESHOT-execute-all.md`

## Open questions for the human

None blocking — the three open questions surfaced during planning were resolved (UK English in docs/comments only; `BrowsePlex` matches upstream filename; both Tizen builds are the verification gate).

The following are FYI items worth confirming before kicking off TKT-00:

1. **Existing `focusColor` setting** — the AccentPicker in TKT-06 keeps `focusColor` in sync with the selected preset so the upstream UI continues to work when `uiTheme === 'original'`. If you'd prefer the two settings to be fully independent (so an "Original UI + Plex Gamboge accent" combination is reachable), revisit TKT-06's wiring.
2. **List-view mode for the library** — TKT-05 ships ViewToggle but treats the list mode as a "Coming soon" placeholder. If you want a fully implemented list mode in the same phase, the ticket grows; otherwise we defer it to a future TKT-07.
3. **Tag/branch convention** — phases use `phase/<n>-<slug>` branches and `plex-ui-phase-<n>` tags. The ONESHOT prompt produces a single `plex-ui-v0.1.0` tag at the end. Confirm this versioning.

## To kick off

Pipe `prompts/TKT-00-setup.md` to a fresh execution session:

```bash
cat prompts/TKT-00-setup.md | claude -p --model claude-opus-4-7 --dangerously-skip-permissions
```

Or run the full sweep:

```bash
cat prompts/ONESHOT-execute-all.md | claude -p --model claude-opus-4-7 --dangerously-skip-permissions
```
