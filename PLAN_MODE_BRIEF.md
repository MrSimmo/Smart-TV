# Moonfin Smart-TV Fork — Plex-Inspired UI Redesign

## Plan-Mode Brief for Claude Code (Opus 4.7, 1M ctx, ultrathink)

> **Mode:** Plan mode only. You are scaffolding tickets, prompts, ADRs, and runbooks — **do not edit application code, do not run builds, do not commit**. Everything you produce lands as new markdown files inside the repo.
>
> **Model expectation:** This brief is designed for Opus 4.7 with the 1M-token context window and extra-high thinking. Use the full context to read the entire repo before writing tickets — do not skim. Use long-form thinking to validate your file-path assumptions against the actual tree.
>
> **Output discipline:** Every deliverable goes to disk. Do not summarise back in chat. The handover to the next session is the files, nothing else.

---

## 1. Context

I'm a contributor to **Moonfin Smart-TV** (https://github.com/Moonfin-Client/Smart-TV) and I'm forking it to ship a **Plex-inspired UI** that I'll maintain alongside upstream. Specifics:

- **Repo:** my fork of `Moonfin-Client/Smart-TV` at `origin`. `upstream` remote points at the original.
- **Scope:** Tizen target only. Do not change webOS-specific code, configs, or build outputs except where the shared `packages/app/` codepath also runs on webOS — in which case the shared code must remain webOS-safe (test by inspection, not by running).
- **Framework:** React + Enact + Sandstone, Spotlight focus management, npm workspaces monorepo.
- **Base Tizen target:** 2.4 (WebKit r152340) — the codebase is already gated for legacy WebKit per the v2.2.x release notes.
- **My established workflow:** ARCHITECTURE.md + `tickets/` + `prompts/` + `decisions/` (ADR) + `PROGRESS.md` + `CLAUDE.md`. One phase per execution session. Conventional commits, `phase/<n>-<slug>` branches, tag at phase completion.
- **Upstream maintainer is active:** versions ship weekly-ish. The fork must absorb upstream changes via `git rebase upstream/main` with **near-zero conflicts**. That constraint shapes every architectural decision below.

---

## 2. Design reference — DO NOT DEVIATE

I have produced three 1920×1080 mockups that are the source of truth for visual fidelity. Before writing a single ticket, **`view` each one** and lift CSS variables, spacing, focus states, and component composition directly from them.

```
design/mockups/moonfin_01_home.png       # Home: sidebar + featured hero + Continue Watching row
design/mockups/moonfin_02_details.png    # Details: clear-logo, facts strip, genres, plot, CTA hierarchy, crew, cast
design/mockups/moonfin_03_library.png    # Library: sidebar context + filter chips + 7-col poster grid
```

Design tokens visible in the mockups (extract these literally into a CSS variables file in Phase 1):

| Token | Value | Purpose |
|---|---|---|
| `--bg`        | `#0E0F14` | App background |
| `--bg-2`      | `#15171F` | Slightly raised |
| `--surface`   | `#1B1E29` | Cards, surfaces |
| `--surface-2` | `#232735` | Inputs, chips |
| `--line`      | `#2A2F3F` | 1px borders |
| `--text`      | `#F4F5F8` | Primary text |
| `--text-dim`  | `rgba(244,245,248,0.72)` | Secondary text |
| `--text-mute` | `rgba(244,245,248,0.48)` | Tertiary / placeholder |
| `--accent`    | `#7C5CFC` | Default Moonfin accent |
| `--accent-2`  | `#B89AFF` | Accent hover / highlight |
| `--pill-bg`   | `rgba(124,92,252,0.18)` | Active route pill background |
| `--warn`      | `#F2A02E` | HDR badge, warnings |
| `--good`      | `#4ADE80` | Rating pill, success |

**Two distinct focus states** are non-negotiable (visible in mockup 01):

- `active` — current route. Soft accent-tint background (`--pill-bg`), accent-2 icon colour, normal scale.
- `focused` — Spotlight d-pad cursor. Solid `--accent` background, white text, `transform: scale(1.04)`, accent-coloured drop shadow. Transitions limited to `transform` and `opacity` only — never `width`, `height`, `padding`, `margin`, or `background-size`, per the existing legacy-WebKit gating.

The mockups also show a **Plex accent preset** (gamboge `#e5a00d` on charcoal `#282a2d`) as one option in the accent picker. Default ships as Moonfin purple `#7C5CFC`.

---

## 3. Hard constraints

1. **Tizen 2.4 baseline.** No `backdrop-filter`, no flex `gap`, no grid `gap` (use `grid-gap`), no `aspect-ratio` (use padding-bottom trick), no optional chaining in legacy bundle, no `Array.flat()` / `Object.fromEntries()` / `??`. The repo already has gating shims — use them.
2. **GPU-friendly animations only.** `transform` and `opacity`. Never `transition: all`. `will-change` only on the focused item + its immediate neighbours (NOT all cards — GPU VRAM thrashing on the 2019 Q90R-class hardware I test on).
3. **Spotlight contract.** Every interactive element must be `spottable`. Focus rings must show the `focused` state above. Don't break d-pad nav.
4. **No theme music regressions.** Theme music, screensaver, UI scale setting, sidebar library toggle (added in 2.3.0), home row backdrop toggle (added in 2.2.0) must all keep working.
5. **No video pipeline changes.** AVPlay integration and `platform-tizen/` are off limits for this work.
6. **UK English** in all strings, comments, ticket text, and documentation.

---

## 4. Upstream sync strategy — the architecture that makes rebases boring

The single most important architectural rule of this fork: **add new files, don't edit existing ones**, unless you absolutely must. The maintainer will push frequently; every file you've modified is a potential rebase conflict.

### 4.1 Component isolation principle

- All new UI lands under `packages/app/src/views/plex-ui/` and `packages/app/src/components/plex-ui/`. Treat these directories as the **fork's owned territory** — upstream will never touch them.
- Existing upstream components are **wrapped, not modified**. If you need to change `Sidebar.jsx`, you instead create `SidebarPlex.jsx` next to it.
- Style overrides live in a single new layer file loaded **after** Sandstone (so cascade order naturally wins). Don't edit existing LESS/CSS unless it's a single token swap.

### 4.2 The one allowed touchpoint

There is **exactly one place** where upstream code is modified: the top-level routing/shell in `packages/app/src/App/` (or wherever `<Router>` lives — verify in the source tree). That modification is a single feature-flag toggle:

```js
// Pseudocode — verify actual location and current routing pattern
import { uiTheme } from './config';
const Sidebar  = uiTheme === 'plex' ? SidebarPlex  : SidebarOriginal;
const Home     = uiTheme === 'plex' ? HomePlex     : HomeOriginal;
const Details  = uiTheme === 'plex' ? DetailsPlex  : DetailsOriginal;
const Library  = uiTheme === 'plex' ? LibraryPlex  : LibraryOriginal;
```

This touchpoint is what rebases against. Everything else is additive.

### 4.3 Rebase runbook

You must produce a runbook (`UPSTREAM_SYNC.md`) covering:

1. One-time setup: `git remote add upstream …`
2. Sync flow: fetch upstream, rebase fork branch onto `upstream/main`, expected conflict surface (the routing touchpoint only), resolution recipe.
3. The "owned files" list — explicit allow-list of paths the fork owns.
4. How to upgrade dependencies the upstream brings in (Enact/Sandstone version bumps shouldn't affect us if we're using stable APIs only).
5. Smoke-test checklist after each rebase: build for Tizen, verify focus nav on each new view, verify theme toggle still flips correctly.
6. The "what to do if upstream rewrites the router" escape hatch — a one-paragraph plan describing the worst case.

### 4.4 Patch-the-new-version workflow

When the maintainer ships a new tag (e.g. `v2.4.0`):

1. `git fetch upstream --tags`
2. `git checkout phase/main` (the fork's integration branch)
3. `git rebase v2.4.0`
4. Resolve the routing touchpoint conflict (the only expected one)
5. `npm install` to pick up new lockfile state
6. `npm run build:tizen` — verify .wgt builds
7. Smoke test the four owned views with the theme toggled on
8. Tag the fork: `v2.4.0-plex.1` and push

This must be documented in the runbook with literal commands.

---

## 5. Required deliverables

Your plan-mode output is exactly this file set, written to the repo working tree. Nothing else.

```
ARCHITECTURE.md                         # Top-level design doc — the why and what
CLAUDE.md                                # Conventions for execution sessions
PROGRESS.md                              # Phase tracker, initially all unchecked
UPSTREAM_SYNC.md                         # Rebase runbook (section 4.3, 4.4 fleshed out)
decisions/
  ADR-001-component-isolation.md         # Why we wrap, don't modify
  ADR-002-upstream-rebase-strategy.md    # The single-touchpoint approach
  ADR-003-design-token-system.md         # CSS vars, the table from section 2
  ADR-004-focus-state-model.md           # active vs focused, GPU-friendly transitions
  ADR-005-accent-theme-presets.md        # Moonfin default + Plex preset
tickets/
  TKT-00-setup.md
  TKT-01-design-tokens.md
  TKT-02-sidebar.md
  TKT-03-home-hero.md
  TKT-04-details.md
  TKT-05-library-grid.md
  TKT-06-polish-qa.md
prompts/
  TKT-00-setup.md                        # Headless prompt for ticket 00
  TKT-01-design-tokens.md
  TKT-02-sidebar.md
  TKT-03-home-hero.md
  TKT-04-details.md
  TKT-05-library-grid.md
  TKT-06-polish-qa.md
  ONESHOT-execute-all.md                 # The "one shot the whole build" prompt
```

**Plan mode produces this set in a single session.** Do not partial-write. If your context budget gets tight, prioritise tickets and prompts over ADRs (ADRs can be stubs with clear headings).

---

## 6. Phase breakdown

### Phase 0 — Setup (TKT-00)
- Add `upstream` remote
- Create `design/mockups/` and copy the three PNGs there (I'll do the copy manually; the ticket just verifies they exist before proceeding)
- Create the directory skeletons: `packages/app/src/views/plex-ui/`, `packages/app/src/components/plex-ui/`, `packages/app/src/styles/plex-ui/`
- Add the `uiTheme` config flag (default `'plex'`), document fallback to `'original'`
- Update `package.json` description + add a `// fork` marker so it's obvious this is the Plex variant when scanning the file
- No UI changes yet

**Upstream conflict risk:** LOW. Only `App/` routing touchpoint and `package.json`.

### Phase 1 — Design tokens & base styles (TKT-01)
- Create `packages/app/src/styles/plex-ui/tokens.less` with the table from section 2
- Create `packages/app/src/styles/plex-ui/base.less` with the focus-state mixins (`.plex-focused`, `.plex-active`), font stack, typography ramp
- Import order: Sandstone defaults first, then `plex-ui/base.less`, so our cascade wins
- Verify no Tizen 2.4 incompatibilities (no CSS custom property fallbacks needed — the legacy bundle already polyfills)
- Build for Tizen to confirm it compiles. Do not deploy.

**Upstream conflict risk:** LOW. New files only, single import line touched.

### Phase 2 — SidebarPlex (TKT-02) — reference mockup 01
- New component `components/plex-ui/SidebarPlex.jsx` + `.module.less`
- Section labels (DISCOVER / LIBRARIES / MORE) — 11px, uppercase, `--text-mute`, 0.12em letter-spacing
- 52px-tall nav rows with 22px icon column + label + optional badge
- Focus state: solid `--accent` fill, scale 1.04, accent shadow
- Active state: `--pill-bg` background, `--accent-2` icon
- Server/profile footer row with avatar + name + server hostname + switcher chevron
- Use Sandstone `Spottable` HOC for d-pad nav
- Library counts come from the same Jellyfin endpoint the existing sidebar uses — find and reuse, don't recreate
- 280px expanded width / 88px collapsed rail (collapsed used on Details page only — mockup 02)

**Upstream conflict risk:** LOW. New files only.

### Phase 3 — HomePlex + FeaturedHero (TKT-03) — reference mockup 01
- New view `views/plex-ui/HomePlex.jsx`
- New component `components/plex-ui/FeaturedHero.jsx`:
  - Uses Jellyfin `clearlogo` artwork when available (endpoint `/Items/{id}/Images/Logo`), falls back to typographic title with `Bebas Neue` / Impact stack
  - Left-heavy gradient scrim (the readability fix — see mockup)
  - Metadata strip grouped by kind: rating pill (green), Rotten Tomatoes %, certificate, year, runtime, tech flags, genres (accent pills)
  - Italic tagline in `--accent-2`
  - Plot capped at `max-width: 640px` (~60ch)
  - Primary CTA: white pill, scale 1.04, sub-label for runtime / "Resume from HH:MM" when applicable
- Continue Watching row reuses the existing watched-progress data source. Cards are 296×168, 12px radius, progress bar at the bottom edge, focused state scales 1.04 + 3px accent ring
- Top bar: search button (380px), settings + downloads icon buttons

**Upstream conflict risk:** LOW. New files only.

### Phase 4 — DetailsPlex (TKT-04) — reference mockup 02 — **biggest readability win**
- New view `views/plex-ui/DetailsPlex.jsx`
- Collapsed 88px sidebar rail variant (component reuses SidebarPlex with a `collapsed` prop)
- Breadcrumb at top (Movies › Genre › Title)
- Clear-logo title block (160px tall area, falls back to typographic when no logo)
- Three-tier metadata:
  1. Facts row: IMDB rating pill, Rotten Tomatoes %, certificate, year, runtime, neutral "In Library" status chip (NOT a red badge — see mockup carefully)
  2. Genre pills: accent-tint background, accent-2 text
  3. Tech badges: small uppercase, HDR variant gets warn-orange tint
- Tagline + plot (max 640px width)
- CTA hierarchy: primary "Play" pill with "Resume from H:MM:SS · Nh Nm left" sub-label when applicable; four equal-weight 60px circular icon buttons for mark-watched / favourite / playlist / more
- Crew strip: 2-column grid (label / value), label in `--text-mute` uppercase, values as underlined links
- Cast row at the bottom: circular 110px portraits, name + role, focused portrait gets 2px accent border + scale 1.06

**Upstream conflict risk:** LOW. New files only.

### Phase 5 — LibraryPlex grid (TKT-05) — reference mockup 03
- New view `views/plex-ui/LibraryPlex.jsx`
- Header: library title (36px, weight 700) + item count (16px muted) + search button (320px)
- Filter chip row: All Genres, Unwatched, 4K/HDR, Year, Rating, Sort. Three states: default, active (current filter), focused (d-pad). Active and focused are visually distinct — see mockup 03.
- 7-column poster grid, 2:3 aspect ratio (padding-bottom trick for Tizen 2.4 compat)
- Per-poster overlays: 4K/HDR/DV badges top-left, NEW badge top-right, unwatched dot when applicable, resume progress bar at the bottom edge
- Focused poster: scale 1.06, 3px accent ring, accent drop shadow
- Title + year/runtime label below each poster (centred, two lines max)
- View toggle (grid / list) at top-right of filter row

**Upstream conflict risk:** LOW. New files only.

### Phase 6 — Polish, accent presets, QA (TKT-06)
- Implement the accent picker presets in Settings: Moonfin Purple (default), Plex Gamboge, Jellyfin Indigo, Custom hex
- Accent picker writes a CSS custom property override on `:root`
- Visual QA pass: load each view, verify focus rings reach every interactive element, verify d-pad traversal order matches reading order
- Build for Tizen, generate `.wgt`, manual TV deployment instructions in the ticket (I deploy via Jellyfin 2 Samsung — link to that in the ticket)
- Performance check: no `transition: all`, no `will-change` on more than focused-item-plus-neighbours, no `backdrop-filter`
- Update README in `views/plex-ui/README.md` with a screenshot strip and a "how to toggle back to original UI" note

**Upstream conflict risk:** LOW for new files; MEDIUM for Settings integration (one new section in the existing Settings view — wrap, don't modify).

---

## 7. Per-ticket schema

Every `tickets/TKT-NN-*.md` must follow this exact structure. No deviations — execution sessions depend on the consistency.

```markdown
# TKT-NN — <Title>

## Objective
<One paragraph. What does "done" look like in user-facing terms.>

## Phase
<NN>  •  **Upstream conflict risk:** LOW | MEDIUM | HIGH

## Prerequisites
- TKT-NN (must be done first)
- design/mockups/<file>.png (must exist on disk)

## Design reference
- `view` design/mockups/<file>.png before writing any code
- Specific elements to match: <bullet list of named regions in the mockup>

## Files this ticket creates
- packages/app/src/<path>/<name>.jsx
- packages/app/src/<path>/<name>.module.less
- (continue)

## Files this ticket modifies (if any)
- packages/app/src/App/<file>.jsx — single line at <pattern> to add new route case
- (avoid — if this list is more than 2 items, redesign the ticket)

## Acceptance criteria
- [ ] <Concrete, testable. Refer to the mockup by region name.>
- [ ] Focus state matches mockup (solid accent, scale 1.04, accent shadow)
- [ ] Active state matches mockup (accent-tint pill background)
- [ ] No `transition: all`, no `backdrop-filter`, no flex `gap`
- [ ] `npm run lint` passes
- [ ] `npm run build:tizen` produces a .wgt without warnings related to this view
- [ ] PROGRESS.md updated with phase completion box ticked

## Technical notes
- <Spotlight container nesting, focus restoration on back navigation, etc.>
- <API endpoints to call — by name, e.g. `getItemsByUserId` from existing services/jellyfin.js>

## Out of scope
- <Anything tempting that should NOT be done in this ticket>

## Verification
\```bash
npm run lint
npm run build:tizen
\```
(I will deploy and visually verify on Samsung Q90R hardware.)

## Status: ⬜
```

---

## 8. Per-prompt schema (headless execution prompts)

Every `prompts/TKT-NN-*.md` is the headless prompt that gets piped:

```bash
cat prompts/TKT-NN-<slug>.md | claude -p --model claude-opus-4-7 --dangerously-skip-permissions
```

Structure:

```markdown
Read CLAUDE.md, ARCHITECTURE.md, and decisions/*.md before starting.

You are implementing ticket TKT-NN. Read tickets/TKT-NN-<slug>.md in full.

Then:
1. `view` the design reference at design/mockups/<file>.png
2. Inspect existing upstream components in <named files> to understand conventions (component shape, Sandstone import patterns, prop drilling vs context, LESS module conventions)
3. Implement the ticket. Match the mockup pixel-for-pixel where reasonable.
4. Run `npm run lint`. Fix issues.
5. Run `npm run build:tizen`. Verify clean build.
6. Update PROGRESS.md with the phase box ticked and a one-line summary.
7. Commit with a conventional-commits message: `feat(plex-ui): <subject>` or `refactor(plex-ui): <subject>`.

Constraints:
- New files only, except the single routing touchpoint listed in the ticket.
- UK English.
- No `transition: all`, no `backdrop-filter`, no flex `gap`.
- Two focus states: `active` (current route) and `focused` (Spotlight cursor) — both visible in design/mockups/moonfin_01_home.png.

If you hit a blocker, stop and write the blocker to tickets/TKT-NN-<slug>.md under a "Blocked" heading. Do not improvise.
```

---

## 9. The one-shot execution prompt

`prompts/ONESHOT-execute-all.md` is the single prompt I can pipe to a fresh 1M-context Opus 4.7 ultrathink session to build the entire fork in one go. It must:

1. Direct the model to read every ticket in order (TKT-00 through TKT-06)
2. Direct it to read every ADR before starting
3. Direct it to `view` all three mockups before writing code
4. Direct it to execute each ticket sequentially, committing between tickets
5. Direct it to update PROGRESS.md after each ticket
6. Direct it to halt and write a `BLOCKED.md` if any acceptance criterion can't be met

This prompt assumes the 1M context can hold the entire repo + mockups + tickets simultaneously. Build it that way — don't artificially partition.

---

## 10. Quality bar

A ticket is done when **all** of these are true:

1. Every acceptance-criteria box ticked
2. Mockup fidelity check passed (focus state, active state, spacing, typography, colour, focus shadow)
3. `npm run lint` clean
4. `npm run build:tizen` clean
5. PROGRESS.md updated
6. Conventional commit landed
7. No upstream files modified beyond the allow-list in the ADR
8. UK English throughout

If a ticket can't meet all eight, write a Blocker entry on the ticket and stop. Do not lower the bar.

---

## 11. Begin

You are in plan mode. Do not edit application code. Do not run builds. Read the repo thoroughly using the 1M context budget. Produce the complete deliverable set from section 5 in a single planning pass.

When you are finished, write a one-paragraph summary to `PLAN_COMPLETE.md` listing the files you created and any open questions for me to resolve before I kick off the first execution session.
