# 0001. Component Isolation via New-File-Only

Date: 2026-05-21
Status: Accepted

## Context

This fork ships a Plex-inspired UI variant of `Moonfin-Client/Smart-TV`. The upstream maintainer pushes weekly-ish; every modified upstream file is a potential rebase conflict. Without a strict isolation rule, the fork degrades to a multi-day rebase chore on every upstream release.

## Decision

**All new UI code lives in net-new files under `packages/app/src/{components,views,styles}/plex-ui/`.**

When a Plex variant of an upstream component is needed, create a new file alongside it (`SidebarPlex.jsx` next to `Sidebar.jsx`) rather than modifying the upstream component. The variant is a fresh implementation, not a delegating wrapper — "wrap" in this fork's language means "add a sibling, not a parent."

The single, named allow-list of upstream files that may be modified is in ADR-002.

## Alternatives Considered

- **Fork-and-modify (no isolation).** Rejected — every upstream rebase becomes a full review of every changed file.
- **Theming via Sandstone theme overrides only.** Rejected — the UI changes are structural (different sidebar nav, hero, library layouts) not just visual.
- **A runtime adapter layer that composes Plex pieces on top of upstream components.** Rejected — adds an indirection that makes Spotlight focus behaviour and Sandstone HOC composition hard to reason about. The cost (a few duplicated component shells) is less than the cost of the adapter.

## Consequences

**Positive**
- Upstream rebases conflict only on the small allow-list. Most rebases are trivial.
- Plex variants can iterate independently; experiments don't risk regressing the upstream UI.
- The toggle (`uiTheme`) makes A/B comparison and rollback one-click for the user.

**Negative**
- Some code is duplicated (button styles, list patterns). We accept this — Sandstone primitives + the shared design tokens keep the duplication thin.
- Two UI surfaces means two QA passes for any cross-cutting change (search, settings, server switching). Mitigated by the allow-list keeping shared touchpoints small.

**Neutral**
- The `decisions/` directory is the fork's ADR home, deviating from the user-level CLAUDE.md `docs/adr/` convention. This is intentional and recorded in the project CLAUDE.md.
