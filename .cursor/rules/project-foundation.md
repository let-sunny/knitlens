---
description: Fixed stack and routing rules for a Next.js App Router + TypeScript app deployed on Vercel with Supabase, including Server vs Client boundaries.
alwaysApply: true
---

# Project Foundation Rules

These rules are **always on** for the whole project.

## Fixed stack

- **Framework**: Next.js App Router (React Server Components by default).
- **Language**: TypeScript only (no `.js` files).
- **Linting**: ESLint flat config including `next/core-web-vitals` and TypeScript rules.
- **Styling**: system.css as the baseline (details in `frontend-system-css.md`).
- **Runtime**: Vercel app + Supabase (database, auth, storage).

All code and config **MUST** be compatible with a Vercel + Supabase deployment target.

## App Router structure

- The app **MUST** use an `app/` directory.
- Route files **MUST** follow:
  - Pages: `app/<segment>/page.tsx`.
  - Layouts (if needed): `app/<segment>/layout.tsx`.
  - API routes: `app/api/<name>/route.ts`.
- Shared UI **MUST** live under a single chosen location and stay consistent:
  - E.g. `components/` **or** `app/(components)/` (pick one and reuse).
- Data access code **MUST NOT** live in UI files:
  - No raw SQL in `page.tsx`, `layout.tsx`, or presentational components.
  - Supabase helpers live in server-only modules (e.g. `lib/` or `server/`).

Example: A projects index page lives at `app/projects/page.tsx` and imports data from a server helper in `lib/projects.ts`.

## Server vs Client components

- Pages and components **MUST** be Server Components by default.
- `"use client"` **MAY** be used **only** when:
  - The component needs browser APIs or local interactive state.
  - The component handles user events (click, input, drag, etc.) that cannot be pushed to the server.
- `"use client"` **MUST NOT** be added just to:
  - Wrap static or read-only content.
  - Use basic props/state that can run on the server.
- When a Client Component is required:
  - It **MUST** be as small and focused as possible.
  - Data fetching and heavy logic **MUST** stay on the server.

Example: A filter sidebar as a tiny Client Component; the main list page remains a Server Component.

## Lint, typecheck, and build (command placeholders)

Until `package.json` scripts are defined, assume:

- **Lint**: `pnpm lint` (or `npm run lint` / `yarn lint`).
- **Typecheck**: `pnpm typecheck` (or `npm run typecheck` / `yarn typecheck`).
- **Build**: `pnpm build` (or `npm run build` / `yarn build`).

References to checks/CI **MUST** use these concepts (lint, typecheck, build) and be updated to the actual scripts once known.

## Deployment and environment

- Hosting **MUST** target Vercel’s supported runtimes (Edge or Node, as appropriate).
- Supabase **MUST** be the default database/auth/storage stack.
- Secrets **MUST** come from environment variables; keys **MUST NOT** be hardcoded.
- Code **MUST NOT** rely on Node-only APIs unless explicitly needed and compatible with the chosen runtime.

Patterns and helpers **MUST NOT** prevent later use of Vercel functions, Edge routes, or Supabase client/server helpers.

## Documentation context

Agents **MUST** treat the following documents as canonical product and architecture context:

- `docs/product/one-pager.md` – product narrative, core flow, and MVP scope.
- `docs/architecture/ia.md` – primary routes and key entities.
- `docs/architecture/screen-flow.md` – high-level screen sequence for the main user journey.

The Main Agent **SHOULD** consult these docs before planning or delegating significant work.
