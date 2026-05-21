# TKT-01 — Design tokens and base styles

## Objective

Create the LESS tokens file and base mixins that every Plex component will consume. After this ticket: `packages/app/src/styles/plex-ui/tokens.less` exposes the full token table (ADR-003), `packages/app/src/styles/plex-ui/base.less` exposes the `.plex-focusable` mixin (ADR-004) and typography ramp, both are imported into the app's stylesheet entry after Sandstone defaults so the cascade naturally favours Plex tokens. No components consume the tokens yet.

## Phase

01 • **Upstream conflict risk:** LOW

## Prerequisites

- TKT-00 done.
- `decisions/0003-design-token-system.md` and `decisions/0004-focus-state-model.md` read.

## Design reference

- `view` `design/mockups/moonfin_01_home.png` — sample any colour by eye against the token table to sanity-check the values.
- `view` `design/mockups/moonfin_02_details.png` and `moonfin_03_library.png` for spacing/typography sanity.

## Files this ticket creates

- `packages/app/src/styles/plex-ui/tokens.less`
- `packages/app/src/styles/plex-ui/base.less`
- `packages/app/src/styles/plex-ui/index.less` — single import target that brings both in.

## Files this ticket modifies

- The app's top-level LESS entry (likely `packages/app/src/index.less` or imported into `packages/app/src/App/App.js`) — add one `@import` line for `styles/plex-ui/index.less` placed **after** all Sandstone imports.

## Acceptance criteria

- [ ] `tokens.less` declares all CSS custom properties from the ADR-003 token table on `:root`.
- [ ] `tokens.less` declares the typography LESS variables (`@font-display`, `@text-11`, `@text-13`, `@text-16`, `@text-24`, `@text-36`, plus the `@text-60-160` display range as `@text-display-min` and `@text-display-max`).
- [ ] `tokens.less` declares the spacing LESS variables (`@s-2` through `@s-16` per ADR-003).
- [ ] `base.less` defines `.plex-focusable` mixin: applies the transitions, the `:focus` styles, and the active-class styles per ADR-004.
- [ ] `base.less` defines the font stack and a `.plex-display` class for the hero typographic fallback.
- [ ] No `backdrop-filter`, no flex `gap`, no `aspect-ratio`, no `transition: all` anywhere in either file.
- [ ] Import order: Sandstone → `plex-ui/index.less`. Plex selectors win cascade ties without `!important`.
- [ ] `npm run lint` clean.
- [ ] `npm run build:tizen` clean.
- [ ] `npm run build:tizen:legacy` clean.
- [ ] PROGRESS.md updated.

## Technical notes

- The existing `packages/app/src/styles/variables.less` is upstream-owned. **Do not modify it.** Tokens live in the new `plex-ui/` directory and may shadow/override upstream values via cascade, never via in-place edit.
- The existing `--accent-color` custom property is set imperatively at `App/App.js:179`. **Do not interfere with it.** The Plex tokens introduce `--accent` and `--accent-2` as separate channels.
- The legacy bundle is the verification gate. Use `grid-gap` not `gap`, padding-bottom for any aspect-ratio needs.

## Out of scope

- Wiring any component to the tokens — that starts in TKT-02.
- The accent preset picker UI — that's TKT-06.
- Modifying upstream `variables.less` — never.

## Verification

```bash
npm run lint
npm run build:tizen
npm run build:tizen:legacy
```

## Status: ⬜
