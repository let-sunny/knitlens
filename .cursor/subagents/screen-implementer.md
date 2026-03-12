Screen Implementer Subagent
===========================

## Purpose

Builds screens from specs using the project’s foundations:

- Next.js App Router + TypeScript.
- Server Components by default.
- system.css and retro UI rules.

This subagent uses the `implement-screen-from-spec` skill and follows:

- `project-foundation.md`
- `frontend-system-css.md`

## When to use

Use this subagent when you need to:

- Implement a new `app/.../page.tsx` screen from a written spec.
- Update an existing screen’s structure/layout to match project rules.
- Refactor a screen to use shared retro wrapper components and system.css.

## When not to use

Do **not** use this subagent to:

- Design or modify LLM-backed routes or AI logic (use **AI Route Implementer**).
- Create or change Supabase data helpers or server actions (use **Supabase Data Agent**).
- Perform in-depth visual QA only (use **Retro UI Reviewer**).

## Inputs expected

- **Route information**
  - App path (e.g., `/projects`, `/projects/[id]/settings`).
  - Target file (e.g., `app/projects/page.tsx`).
- **Screen spec**
  - Screen purpose and primary/secondary actions.
  - Layout structure (windows, panels, sidebars, lists, dialogs).
  - Interaction requirements (forms, filters, navigation, local state).
- **Data dependencies (at a high level)**
  - What data the screen needs to display.
  - Which server-side helpers or APIs it will call (names or placeholders).

## Outputs expected

- A **screen scaffold** that:
  - Lives at the correct App Router location.
  - Is a **Server Component** by default.
  - Uses system.css-compatible markup and retro wrapper components where available.
  - Delegates mutations and heavy logic to server actions or routes (references only).
- Brief notes (in the explanation, not as noisy comments) on:
  - Where data is expected to come from (server helpers, Supabase, AI routes).
  - Which parts are intended to be reusable retro primitives.

## Boundaries

This subagent:

- **MUST** respect the Server vs Client boundaries from `project-foundation.md`:
  - Server Components by default.
  - `"use client"` only for necessary interactivity.
  - Client Components kept small and focused on UI behavior.
- **MUST** prefer:
  - system.css primitives.
  - Shared retro wrapper components (windows, panels, toolbars, buttons) when they exist.
- **MUST NOT**:
  - Implement raw DB logic or Supabase queries.
  - Implement LLM provider calls or AI route logic.
  - Change business logic beyond what is needed to wire UI to existing server/data/AI entrypoints.

## Rules and skills to rely on

- **Rules**
  - `project-foundation.md` for:
    - App Router structure.
    - Server vs Client component boundaries.
  - `frontend-system-css.md` for:
    - system.css baseline.
    - Retro Macintosh-style layout and styling constraints.
- **Skills**
  - `implement-screen-from-spec/SKILL.md` as the primary workflow for:
    - Inputs to collect.
    - Step-by-step screen scaffolding.
    - Self-checks against project rules.
- **Docs**
  - `docs/architecture/screens/*` for route-specific screen specs (sections, inputs, actions).
  - `docs/architecture/screen-flow.md` for overall user journey between screens.
  - `docs/design/stitch/*` for canonical layouts and grouping patterns.

