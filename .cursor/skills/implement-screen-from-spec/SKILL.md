# Implement Screen from Spec

## Purpose

Provide a repeatable workflow to implement a screen from a spec while following:

- Next.js App Router + TypeScript.
- Server-first component design.
- system.css and retro UI rules (see `frontend-system-css.md`).

## When to use this skill

Use this skill when you need to:

- Implement or update a `app/.../page.tsx` route from a spec.
- Build a composite screen from a wireframe or description.
- Refactor a screen to align with project rules.

## Required inputs

Before generating code, identify:

- **Route**: App path (e.g., `/projects`) and target file (e.g., `app/projects/page.tsx`).
- **Screen purpose**: Primary user goal and key actions.
- **Components**: Main sections and primitives (windows, sidebars, lists, forms, dialogs).
- **Interactions**: What needs real interactivity vs static display.
- **Data dependencies**: Read/write needs and likely sources (server helpers, Supabase, route handlers).

If a detail is missing, choose the simplest assumption and keep the scaffold easy to extend.

## Workflow

1. **Place the route**
   - Map the route to the correct `app/.../page.tsx` file and existing layouts.

2. **Choose Server vs Client**
   - Make the page a Server Component by default.
   - Extract **small Client Components** only for:
     - Local, interactive UI (e.g., controlled inputs, drag/drop).
     - Browser-only APIs.

3. **Design with system.css**
   - Compose the layout from system.css primitives and any existing retro wrappers.
   - Note any repeated patterns that should become shared retro components.

4. **Scaffold the page**
   - In `page.tsx`:
     - Fetch data via server helpers or server actions.
     - Pass only the necessary props into Client Components.
   - Create local or shared components where it clearly improves reuse.

5. **Wire interactions**
   - Prefer server actions or API routes for mutations.
   - Keep client state minimal and focused on UX.

6. **Quick self-check**
   - Screen fits App Router structure.
   - No unnecessary `"use client"`.
   - system.css and retro UI rules are respected.

## Expected outputs

- A screen scaffold that:
  - Lives in the correct `app/...` location.
  - Uses Server Components by default and small Client Components for interaction.
  - Uses system.css-friendly structure ready for real data wiring.

## Reference docs

When implementing or updating screens, agents **SHOULD** consult:

- `docs/architecture/screens/` – route-specific screen specs (structure, inputs, actions).
- `docs/architecture/screen-flow.md` – overall user journey across screens.
- `docs/design/stitch/*` – Stitch HTML mocks for layout, grouping, and visual hierarchy.
