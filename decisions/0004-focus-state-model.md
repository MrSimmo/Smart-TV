# 0004. Focus State Model — Two Distinct States, GPU-Friendly

Date: 2026-05-21
Status: Accepted

## Context

The Plex UI needs two visually distinct focus-related states (visible in `design/mockups/moonfin_01_home.png`):

- **active** — the current route or selected filter. A "you are here" indicator.
- **focused** — the Spotlight d-pad cursor. A "where the remote will act" indicator.

If these states collapse into one, users lose orientation: they can't tell whether they're hovering over their current row or have wandered off it. Plex itself maintains this distinction; the Moonfin upstream Sidebar shows only one (focus/hover), which is the most cited usability gap in upstream issues.

Animation choices also matter: the target hardware (2019 Samsung Q90R class, plus older Tizen 2.4 sets) thrashes GPU VRAM when too many elements have `will-change` set or when non-GPU-friendly properties animate.

## Decision

### Visual model

| State | Background | Text/Icon | Transform | Shadow |
|---|---|---|---|---|
| default | transparent | `--text-dim` | none | none |
| active  | `--pill-bg` (accent-tinted) | `--accent-2` | none | none |
| focused | solid `--accent` | white | `scale(1.04)` | accent drop shadow (`0 0 24px rgba(124,92,252,0.4)`) |
| active + focused | solid `--accent` | white | `scale(1.04)` | accent drop shadow (focused wins visually) |

Focused state always trumps active for the visual indicator — the d-pad cursor is the user's primary attention anchor.

### Implementation

- Every interactive element uses Sandstone's `Spottable` HOC (or `SpotlightContainerDecorator` for containers).
- Focused styles are applied via the `:focus` pseudo-class (matches existing repo convention — see `AddToPlaylistModal.module.less:62`).
- Active styles are applied via a Plex-owned `.plex-active` class set by the parent component based on route/state.
- Both states share a mixin (`.plex-focusable` in `styles/plex-ui/base.less`) that wires the transitions and `will-change`.

### Animation rules (legacy-WebKit safe)

- **Allowed:** `transform`, `opacity` only. Duration 150–200ms. Easing `ease` or `ease-out`.
- **Forbidden:** `transition: all`, `width`, `height`, `padding`, `margin`, `background-size`, `filter`, `backdrop-filter`.
- **`will-change`:** set only on the currently-focused element and its immediate adjacent siblings (next/previous in the spatial nav direction). Apply via a parent component setting `data-near-focus` and a selector `[data-near-focus="true"] { will-change: transform; }`. Never apply to every card in a row — GPU VRAM thrashes on Q90R.

### Spotlight contract

- Every interactive element is `Spottable`. No exceptions.
- Focus must reach every CTA, every card, every chip. The mockup is the focus-coverage spec.
- Focus restoration on back-navigation uses Sandstone's default `SpotlightContainerDecorator` behaviour with `restrict="self-only"` where the design calls for trapped focus (modals, dialogs).
- D-pad traversal order matches reading order. Spatial nav (Spotlight's default geometry-based picker) gets us most of the way; per-component `data-spotlight-id` is used to override edge cases.

## Alternatives Considered

- **Single combined focus state.** Rejected — collapses orientation. Active and focused serve different cognitive purposes.
- **CSS-only focus animation (no `will-change` at all).** Rejected — on the Q90R, focused-card transitions stutter without `will-change`. Targeted use is the right cost/benefit.
- **`outline` instead of `box-shadow` for the accent glow.** Rejected — Tizen 2.4 WebKit renders `outline` poorly with `border-radius`; `box-shadow` is the safe path.

## Consequences

**Positive**
- Users always know where they are AND where they'll act next.
- GPU stays cool because `will-change` is scoped, and the only transitioning properties are GPU-friendly.

**Negative**
- Slightly more complex per-component CSS — two classes plus `:focus` plus `data-near-focus`. Documented in `styles/plex-ui/base.less` mixin.

**Neutral**
- The mixin approach means a single edit to the focus model rolls out everywhere. If we need to add a third state (e.g. "pressed"), it's a mixin extension.
