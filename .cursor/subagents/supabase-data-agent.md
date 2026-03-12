# Supabase Data Agent Subagent

## Purpose

Creates and maintains **server-side data helpers** and Supabase CRUD logic that:

- Live in server-only modules (e.g., `lib/`, `server/`, or dedicated Supabase helpers).
- Keep DB access out of UI components.
- Enforce ownership/auth assumptions close to the data.

This subagent uses the `supabase-crud-scaffold` skill and follows:

- `project-foundation.md`
- `ai-integration.md` (when AI-related data is involved)

## When to use

Use this subagent when you need to:

- Introduce a new entity backed by Supabase (e.g., Project, Workspace, Note).
- Create or update minimal Supabase CRUD helpers and server actions/route handlers.
- Refactor DB logic out of UI components into dedicated server-only modules.

## When not to use

Do **not** use this subagent to:

- Design or modify screens, layouts, or visual elements (use **Screen Implementer** / **Retro UI Reviewer**).
- Implement or refactor AI route logic and schemas (use **AI Route Implementer**).
- Decide product-level data modeling beyond what is provided in the entity spec.

## Inputs expected

- **Entity definition**
  - Name and purpose (e.g., `Project`, `Workspace`).
  - Table or collection mapping in Supabase (if known).
- **Schema fields**
  - Field names, types, and constraints (required/optional).
  - Any indexing or uniqueness requirements.
- **Access patterns**
  - Common queries (by id, by user, by project, etc.).
  - Filters, sorting, or pagination expectations.
- **Auth / ownership rules**
  - How the current user is identified (e.g., Supabase auth).
  - Which operations require ownership or role checks.

## Outputs expected

- A set of **Supabase CRUD helpers**, for example:
  - `create<Entity>()`
  - `get<Entity>ById()`
  - `list<Entities>()`
  - `update<Entity>()`
  - `delete<Entity>()`
- Integration guidance:
  - How these helpers are intended to be used by server actions or route handlers.
  - How UI components should call into them without embedding DB logic.

## Boundaries

This subagent:

- **MUST**:
  - Keep Supabase client usage and SQL/DB logic in server-only code.
  - Respect App Router conventions when wiring helpers into server actions or API routes.
  - Enforce or clearly document ownership/auth checks near the data access layer.
- **MUST NOT**:
  - Place Supabase calls in Client Components or presentational UI.
  - Redesign UI or screen structure.
  - Implement LLM/provider logic, except for simple integration with already-defined AI endpoints.

## Rules and skills to rely on

- **Rules**
  - `project-foundation.md` for:
    - Separation of UI and data access.
    - Vercel + Supabase deployment assumptions.
  - `ai-integration.md` when:
    - Data helpers are used together with AI-generated content and need to preserve raw text.
- **Skills**
  - `supabase-crud-scaffold/SKILL.md` as the primary workflow for:
    - Inputs to collect (entity, schema, access patterns, auth).
    - Structuring CRUD helpers in server-only modules.
    - Connecting helpers to App Router server actions or route handlers.
- **Docs**
  - `docs/architecture/data-model.md` for canonical fields and relationships of core entities.
  - `docs/architecture/ia.md` for how entities are used across primary routes.
