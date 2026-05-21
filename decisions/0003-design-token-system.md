# 0003. Design Token System — Single LESS File + Custom Properties

Date: 2026-05-21
Status: Accepted

## Context

The Plex UI needs a consistent visual language across Sidebar, Browse, Details, and Library. The repo already has `packages/app/src/styles/variables.less` with upstream LESS variables and uses CSS custom properties on `:root` for accent colour. We need a tokens model that (a) doesn't clash with upstream, (b) compiles to both modern and legacy Tizen builds from a single source, and (c) supports runtime accent presets.

This ADR also stands in for the `DESIGN.md` that user-level CLAUDE.md would otherwise mandate — the project consolidates design-token authority here.

## Decision

Create `packages/app/src/styles/plex-ui/tokens.less` containing **CSS custom properties** on `:root` plus a small set of LESS variables for spacing and typography ramps. Tokens are imported from `App/App.js` after Sandstone defaults, so cascade order naturally lets Plex tokens win.

### Token table

| Token | Value | Purpose |
|---|---|---|
| `--bg`         | `#0E0F14` | App background |
| `--bg-2`       | `#15171F` | Slightly raised |
| `--surface`    | `#1B1E29` | Cards, surfaces |
| `--surface-2`  | `#232735` | Inputs, chips |
| `--line`       | `#2A2F3F` | 1px borders |
| `--text`       | `#F4F5F8` | Primary text |
| `--text-dim`   | `rgba(244,245,248,0.72)` | Secondary text |
| `--text-mute`  | `rgba(244,245,248,0.48)` | Tertiary / placeholder |
| `--accent`     | `#7C5CFC` | Default Moonfin accent (Plex preset overrides) |
| `--accent-2`   | `#B89AFF` | Accent hover / highlight |
| `--pill-bg`    | `rgba(124,92,252,0.18)` | Active route pill background |
| `--warn`       | `#F2A02E` | HDR badge, warnings |
| `--good`       | `#4ADE80` | Rating pill, success |

The existing `--accent-color` (set from `settings.focusColor` at `App/App.js:179`) is preserved unchanged. The Plex tokens add `--accent` and `--accent-2` as a separate channel, leaving the upstream accent untouched.

### Typography ramp (LESS variables in tokens.less)

| Variable | Value |
|---|---|
| `@font-display` | `'Bebas Neue', Impact, 'Arial Black', sans-serif` |
| `@font-body`    | inherits Sandstone default |
| `@text-11`      | `11px` / `0.12em letter-spacing` (section labels) |
| `@text-13`      | `13px` (chip labels) |
| `@text-16`      | `16px` (item meta) |
| `@text-24`      | `24px` (section titles) |
| `@text-36`      | `36px` (page titles) |
| `@text-60-160`  | display range for hero titles when no clear-logo is available |

### Spacing

8-point base. `@s-2: 8px`, `@s-3: 12px`, `@s-4: 16px`, `@s-6: 24px`, `@s-8: 32px`, `@s-12: 48px`, `@s-16: 64px`. Components use these via LESS variable references in `.module.less` files.

### Legacy WebKit gates (rules every Plex stylesheet must obey)

- No `backdrop-filter`.
- No flex `gap`. Use margins or wrapper-element spacing.
- No grid `gap`. Use `grid-gap` (with the standard fallback).
- No `aspect-ratio`. Use the padding-bottom trick (e.g. `padding-bottom: 150%` for a 2:3 poster).
- No `transition: all`. Only `transition: transform 200ms ease, opacity 200ms ease` (or equivalent named properties).
- `will-change: transform` only on the focused item and its immediate neighbours, never on a whole row of cards.

## Alternatives Considered

- **JS theme object (Sandstone ThemeDecorator).** Rejected — runtime theme switching works, but CSS custom properties give us smaller bundles and let the legacy build use the same source.
- **Inline tokens in every component's `.module.less`.** Rejected — would create drift; a single accent change would require N edits.
- **Tailwind / utility-first.** Rejected — would add a dependency, and the Plex UI is not utility-shaped (it's component-shaped with distinct focused/active states).

## Consequences

**Positive**
- One file (`tokens.less`) defines every visual constant. Accent preset switching is a single CSS custom property override on `:root`.
- Cascade order lets the Plex tokens win over Sandstone defaults without `!important`.
- Same source compiles to modern and legacy bundles; no per-bundle CSS branching.

**Negative**
- LESS variables and CSS custom properties live side by side, which can confuse new contributors. Mitigated by a comment block at the top of `tokens.less` explaining the split (LESS variables for spacing/type scale because they're build-time; custom properties for colour because they need runtime theming).

**Neutral**
- This ADR is the de facto `DESIGN.md`. If the design grows beyond what fits in one ADR + one LESS file, split out a `DESIGN.md` and supersede this ADR.
