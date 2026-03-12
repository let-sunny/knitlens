Supabase CRUD Scaffold
======================

## Purpose

Provide a repeatable workflow to generate **minimal Supabase CRUD and server-action helpers** for a given entity, while:

- Following **Next.js App Router** conventions.
- Keeping database logic **separate from UI components**.
- Remaining compatible with a Vercel + Supabase deployment.

## When to use this skill

Use this skill when:

- Adding a new entity that requires basic CRUD operations (create, read, update, delete).
- Refactoring inline database calls out of UI components.
- Introducing server actions or route handlers backed by Supabase.

## Required inputs

Collect or infer:

- **Entity name and purpose**:
  - e.g., `Project`, `Workspace`, `Note`.
  - What the entity represents in the product.
- **Schema fields**:
  - Field names, types, and constraints.
  - Which fields are required on create vs update.
- **Access patterns**:
  - Common queries (by id, by user, by project).
  - Any filters, sorting, or pagination needs.
- **Auth / ownership rules**:
  - How the current user is determined.
  - Which operations require ownership checks.

## Workflow

1. **Choose helper locations**
   - Place Supabase-specific helpers and CRUD functions in a **server-side module**, such as:
     - `lib/supabase/<entity>.ts`
     - or a similar `server/` or `app/(server)/` folder, following project conventions.
   - Ensure these helpers are only imported from server contexts (server actions, route handlers, Server Components).

2. **Define minimal CRUD helpers**

   For the given entity, create functions such as:

   - `create<Entity>()`
   - `get<Entity>ById()`
   - `list<Entities>()`
   - `update<Entity>()`
   - `delete<Entity>()`

   Each helper should:

   - Accept well-typed parameters (TypeScript).
   - Interact with Supabase using the official client.
   - Handle common error cases explicitly (null results, permission issues).

3. **Integrate with App Router**

   - Expose CRUD operations to the UI via:
     - Server actions attached to forms or buttons in Server/Client components.
     - Route handlers under `app/api/.../route.ts` when appropriate.
   - Keep UI files focused on:
     - Invoking server actions.
     - Rendering data passed in as props.
   - Ensure route paths and server action file locations match established project conventions.

4. **Separate DB logic from UI components**

   - Do not:
     - Instantiate Supabase clients directly inside Client Components.
     - Embed SQL or table-specific logic in `page.tsx` or presentational components.
   - Do:
     - Call dedicated CRUD helpers from server actions, route handlers, or Server Components.
     - Pass only the necessary data and callbacks into Client Components.

5. **Auth and multi-tenant considerations**

   - Assume Supabase auth is the source of truth for the current user.
   - Enforce ownership or access rules in the **server-side CRUD helpers**, not the UI.
   - Design helpers to take a `userId` or similar identifier when appropriate.

6. **Deployment alignment**

   - Ensure all Supabase usage is compatible with Vercel:
     - Use environment variables for Supabase URL and anon/service keys.
     - Avoid long-lived connections; rely on HTTP-based client calls.

## Expected outputs

- A **set of Supabase CRUD helpers** for the entity:
  - Located in a server-only file or module.
  - Using clear, typed function signatures.
- **Integration points**:
  - Suggested or scaffolded server actions and/or route handlers that call the helpers.
- Notes for the implementer on:
  - Where to plug in concrete schema details.
  - How to connect UI components to these helpers without leaking DB logic.

## Reference docs

When defining entities and CRUD helpers, agents **SHOULD** use:

- `docs/architecture/data-model.md` – canonical fields, relations, and statuses for core entities.
- `docs/architecture/ia.md` – how entities map onto primary routes and information architecture.

