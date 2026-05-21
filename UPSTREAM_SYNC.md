# Upstream sync runbook

This runbook describes how the fork stays current with `Moonfin-Client/Smart-TV` (the upstream). The architectural rule (ADR-001) keeps the conflict surface tiny; this runbook explains how to land an upstream rebase against that small surface.

## One-time setup

The remote is already configured. Verify:

```bash
git remote -v
# expected:
# origin    https://github.com/MrSimmo/Smart-TV.git (fetch+push)   # the fork
# upstream  https://github.com/Moonfin-Client/Smart-TV.git (fetch+push)   # the original
```

If `upstream` is missing:

```bash
git remote add upstream https://github.com/Moonfin-Client/Smart-TV.git
git fetch upstream --tags
```

## Owned files (the fork's territory — upstream never touches these)

All paths under `packages/app/src/` unless noted.

```
components/plex-ui/**          # All Plex components
views/plex-ui/**               # All Plex views
styles/plex-ui/**              # Plex tokens, base, mixins
```

Plus the repo-root meta:

```
ARCHITECTURE.md
CLAUDE.md
PROGRESS.md
UPSTREAM_SYNC.md
decisions/**
tickets/**
prompts/**
design/**
```

## Allow-list (the only upstream files we modify — these may conflict on rebase)

1. `packages/app/src/App/App.js` — adds Plex-component imports + a `uiTheme === 'plex'` branch in the existing `showNavBar` conditional and the panel render switch.
2. `packages/app/src/context/SettingsContext.js` — adds one `uiTheme` key with default `'plex'` and persist.
3. `packages/app/src/views/Settings/*` — adds one new "Appearance" section row for the UI theme toggle (additive).
4. `package.json` — description string + a `// fork` marker comment near the top of the file.

These are the *only* upstream files that should ever show conflict during rebase. If you see conflicts elsewhere, stop — something has been modified that shouldn't have been.

## Standard rebase flow (frequent — weekly-ish)

```bash
git checkout plex-ui                                # the fork's integration branch
git fetch upstream
git rebase upstream/main
```

**Expected conflict surface:** the four allow-list files only.

**Resolution recipe per file:**

- **`App/App.js`** — Take upstream's structural changes (new panels, new routing logic) and **re-apply** the Plex import block + the `uiTheme === 'plex'` conditional. The Plex branch should always wrap the upstream component selection, never replace it.
- **`SettingsContext.js`** — Take upstream's new keys; keep our `uiTheme` key alongside. Verify the default and persist behaviour still match what TKT-00 specified.
- **`views/Settings/*`** — Take upstream's structural changes; re-insert the Appearance / UI theme row in the same location it was added in TKT-06.
- **`package.json`** — Take upstream's version bump; keep our `description` string and `// fork` marker.

After resolution:

```bash
npm install                                         # in case lockfile moved
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

If both builds are clean, commit the resolved rebase (`git rebase --continue`) and push.

## Tagged upstream releases (e.g. `v2.4.0`)

```bash
git fetch upstream --tags
git checkout plex-ui
git rebase v2.4.0
# resolve the allow-list conflicts as above
npm install
npm run lint
npm run build:tizen
npm run build:tizen:legacy
# smoke-test the four owned views with uiTheme === 'plex'
git tag v2.4.0-plex.1
git push origin plex-ui --tags
```

## Smoke-test checklist (after every rebase)

- [ ] `npm run lint` clean.
- [ ] `npm run build:tizen` clean.
- [ ] `npm run build:tizen:legacy` clean.
- [ ] Toggle `uiTheme === 'plex'` and verify Sidebar/Browse/Details/Library render the Plex variants.
- [ ] Toggle back to `'original'` and verify the upstream UI still works.
- [ ] D-pad nav round-trip: from Sidebar → Browse hero CTA → Continue Watching row → back to Sidebar.
- [ ] Theme music, screensaver, UI scale setting, sidebar library toggle, home row backdrop toggle — all still functional under both `uiTheme` values.

## Dependency bumps

Enact / Sandstone version bumps from upstream should not affect us if we used stable Sandstone APIs only. If a Sandstone breaking change does affect a Plex component, treat it as a new ADR — fix the Plex variant, do not roll Sandstone back.

## Worst case: upstream rewrites the router

If upstream replaces the `Panels` state-machine routing with React Router or any other model, the entire `App/App.js` allow-list entry needs to be re-derived:

1. Identify the new routing primitives upstream chose.
2. Re-implement the `uiTheme === 'plex'` selection in the new model. The selection is purely a swap of which component renders at each panel/route — there is no business logic.
3. Record the migration as a new ADR (`decisions/0006-routing-migration.md` etc).
4. Update this runbook's "Standard rebase flow" with the new touchpoint.

If the rewrite collides with multiple files, the fix is still local to the allow-list. Do not extend the allow-list to absorb the migration — instead, push back upstream or wrap more aggressively.
