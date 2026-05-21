# 0005. Accent Theme Presets — Moonfin Default + Switchable Presets

Date: 2026-05-21
Status: Accepted

## Context

The existing accent picker (set from `settings.focusColor` and applied via `--accent-color` on `:root` at `App/App.js:179`) supports arbitrary hex colours. The Plex UI's mockups show a Plex-themed accent (gamboge `#e5a00d` on charcoal `#282a2d`) as one option alongside the Moonfin purple default. Users want one-click presets, not just a hex picker.

## Decision

Add a **preset row** to the existing accent setting, defaulting to the Moonfin purple. Presets:

| Preset | Accent | Accent-2 | Background tint | Notes |
|---|---|---|---|---|
| Moonfin Purple (default) | `#7C5CFC` | `#B89AFF` | unchanged | matches mockups |
| Plex Gamboge             | `#E5A00D` | `#F2C66B` | unchanged | mockup-shown alternative |
| Jellyfin Indigo          | `#00A4DC` | `#4DC3F0` | unchanged | matches upstream legacy default |
| Custom hex               | user input | derived | unchanged | uses existing `focusColor` mechanism |

Preset selection writes to `settings.uiThemePreset` (new key). The chosen preset's `--accent` and `--accent-2` are set as CSS custom properties on `:root` at app boot and whenever the preset changes. The existing `--accent-color` is also kept in sync (for upstream-UI compatibility when `uiTheme === 'original'`).

The "Custom hex" option reuses the existing hex input — no UI duplication.

## Alternatives Considered

- **Only presets, drop custom hex.** Rejected — the existing custom hex is in use; removing it is a regression for current users.
- **Plex preset as default.** Rejected — this is a Moonfin fork shipping a Plex-inspired UI, not a Plex clone. The brand should lead with Moonfin purple.
- **Per-view accent override.** Rejected — overcomplicated for the win. One accent across the app matches both the mockups and the upstream behaviour.

## Consequences

**Positive**
- One-click switching between three well-tuned presets covers the common case.
- Custom hex remains available for power users.
- Existing `focusColor` mechanism is reused, not duplicated.

**Negative**
- Two settings keys (`uiThemePreset` and `focusColor`) need to stay in sync. The Settings view enforces this by writing both whenever a preset is chosen.

**Neutral**
- Adding a new preset later is a one-line addition to the preset list + one new ADR if the preset reshapes the visual envelope (e.g. a light theme would).
