# Plex-UI variant

A Plex-inspired UI for Moonfin on Tizen Smart TVs. Compiled from the same
source as the upstream UI; toggle via Settings → Personalization →
Appearance.

## Screenshots

The three views (matching `design/mockups/*.png` at the repo root):

| Home | Details | Library |
|---|---|---|
| `design/mockups/moonfin_01_home.png` | `design/mockups/moonfin_02_details.png` | `design/mockups/moonfin_03_library.png` |

## How to toggle back to the original UI

1. From any view, navigate to **Settings → Personalization → Appearance**.
2. Change **UI Theme** from `Plex` to `Original`.
3. The change applies immediately — no app restart needed.

The Plex variant rendering is gated on `settings.uiTheme === 'plex'` in
`App.js`. Setting it to `'original'` falls back to the upstream Sidebar,
Browse, Details, and Library views. The upstream views remain fully
functional; the Plex variant is purely additive.

## Accent presets

Pick from **Settings → Personalization → Appearance → Accent**:

- **Moonfin Purple** (default) — `#7C5CFC` / `#B89AFF`
- **Plex Gamboge** — `#E5A00D` / `#F2C66B`
- **Jellyfin Indigo** — `#00A4DC` / `#4DC3F0`
- **Custom** — reuses the hex value from the existing
  **Personalization → General Style → Focus Border Color** option

Selecting a named preset also writes through to `focusColor` so the
upstream UI (when toggled back to Original) shares the chosen accent.

## Files

```
packages/app/src/
  styles/plex-ui/          # tokens.less, base.less, index.less (ADR-003)
  components/plex-ui/
    SidebarPlex/           # ADR-001 sibling to upstream Sidebar
    FeaturedHero/
    PosterCard/            # generic; variants: 'continue' | 'poster'
    MetadataPill/          # variants: 'good' | 'warn' | 'accent' | 'neutral'
    CrewStrip/
    CastRow/
    FilterChip/            # three-state focus (ADR-004)
    PosterGrid/            # 7-col 2:3 padding-bottom layout
    ViewToggle/
    AccentPicker/          # preset row (ADR-005)
  views/plex-ui/
    BrowsePlex/
    DetailsPlex/
    LibraryPlex/
```

## Deploying to a Samsung Smart TV

This fork is built with `npm run build:tizen:legacy` for older Tizen 2.4 /
WebKit r152340 hardware (e.g. 2019 Q-series) and `npm run build:tizen` for
modern Tizen. The output `.wgt` files are sideloaded via the
[Jellyfin 2 Samsung](https://github.com/jeppevinkel/jellyfin-tizen-builds)
loader; see that project's instructions for installation.

## Constraints

- Tizen 2.4 / WebKit r152340 — no `backdrop-filter`, no flex `gap`, no
  `aspect-ratio`, no `transition: all`. See ADR-003 for the full list.
- Two-state focus (active + focused) per ADR-004 on every interactive
  element.
- UK English in all docs, comments, and commit messages.

## ADRs

The full decision trail lives in `decisions/` at the repo root:

- ADR-0001 — Component isolation via new-file-only
- ADR-0002 — Upstream rebase strategy / named allow-list
- ADR-0003 — Design token system
- ADR-0004 — Focus state model
- ADR-0005 — Accent theme presets
