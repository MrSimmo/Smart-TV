# 0002. Upstream Rebase Strategy — Named Allow-List

Date: 2026-05-21
Status: Accepted

## Context

ADR-001 establishes new-file-only isolation. But some upstream files must change to wire the Plex UI in. The fork needs a precise, named list of those files so that rebase conflicts are bounded and predictable.

The original brief says "exactly one place where upstream code is modified." The actual repo state requires more — there are four files that need additive modification.

## Decision

The fork modifies **exactly these upstream files, and no others**:

1. **`packages/app/src/App/App.js`**
   - Plex-component imports near the existing import block (lines ~18–19 in current upstream).
   - A `uiTheme === 'plex'` conditional in the `showNavBar` Sidebar/NavBar block (lines ~781–810 in current upstream).
   - A `uiTheme === 'plex'` conditional in the panel render switch where Browse/Details/Library are picked.

2. **`packages/app/src/context/SettingsContext.js`**
   - One new `uiTheme` key in the persisted settings shape. Default: `'plex'`. Type: `'plex' | 'original'`.
   - Update the persist/hydrate code to round-trip the new key.

3. **`packages/app/src/views/Settings/*`** (the existing Settings view)
   - One additive section titled "Appearance" (or matching upstream's section conventions) containing the UI theme toggle and the accent preset picker rows.
   - Additive only — no existing section is moved, renamed, or reordered.

4. **`package.json`** (the root one)
   - Update `description` to reflect the Plex variant.
   - Add a `// fork` marker comment near the top so any reader instantly knows this is the variant.

Any other upstream modification is **forbidden** and must be raised as a blocker in the active ticket.

## Alternatives Considered

- **Single touchpoint (App.js only).** Rejected — `SettingsContext` is the natural home for a persisted `uiTheme`, and burying it inside App.js would entangle routing with settings persistence.
- **Fork-internal feature flag via build-time env var.** Rejected — the user wants to toggle Plex UI at runtime via Settings; build-time only would require a rebuild per toggle.
- **Modify the Settings view via a wrapping HOC instead of an in-place section.** Rejected — Settings is structurally a list with section ordering and Spotlight focus order; an HOC wrap would need to re-implement the entire list to inject a row, which is more invasive than a single section addition.

## Consequences

**Positive**
- Rebase conflict surface is named and small.
- A reviewer can audit fork diff against upstream in seconds: "did anything outside the allow-list change?"
- UPSTREAM_SYNC.md can give literal `git diff` checks against the allow-list.

**Negative**
- Four files instead of one. Upstream churn in any of them produces a conflict. Mitigated by additive-only edits and clear per-file resolution recipes in UPSTREAM_SYNC.md.

**Neutral**
- `SettingsContext` and the Settings view are reasonably stable upstream files. The maintainer's recent activity shows churn concentrated in features (player, library toggle, theme music) rather than in settings plumbing.
