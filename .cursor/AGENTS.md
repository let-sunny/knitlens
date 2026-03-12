# KnitLens Agent Guide

This document defines **how the main agent and subagents collaborate** in this project.

The **source of truth** for rules and workflows lives in these files:

* **Rules**: `project-foundation.md`, `frontend-system-css.md`, `ai-integration.md`
* **Skills**: `implement-screen-from-spec`, `implement-llm-json-route`, `retro-ui-review`, `supabase-crud-scaffold`
* **Subagents**: `screen-implementer`, `ai-route-implementer`, `retro-ui-reviewer`, `supabase-data-agent`

---

# Key Project Docs (Read Order)

Agents **SHOULD** use the following documents as primary context, roughly in this order:

1. `docs/product/one-pager.md` – product narrative, core flow, and MVP scope.
2. `docs/product/ai-spec.md` – AI tasks, inputs, and JSON output structures.
3. `docs/architecture/ia.md` – primary routes and key entities.
4. `docs/architecture/screen-flow.md` – high-level screen sequence.
5. `docs/architecture/screens/*` – per-route screen specifications.
6. `docs/architecture/data-model.md` – core entities (Project, Pattern, Sections, Rows, Steps, PatternSource).
7. `docs/architecture/api-contract.md` – API request and response contracts.
8. `docs/design/stitch/*` – Stitch HTML mocks for layouts and UI reference.

The **Main Agent** should consult these documents before planning significant work or delegating tasks to subagents.

---

# Global Principles

**Design**

* UI must follow **system.css** and a **retro Macintosh aesthetic**.

**Coding**

* Next.js **App Router**
* **TypeScript**
* **ESLint (flat config)**
* `next/core-web-vitals`
* strict TypeScript rules

**Architecture**

* **Server Components by default**
* Client Components only when strictly necessary and kept small

**Data**

* Supabase logic must exist **only in server-side modules**

**AI**

* All LLM responses must follow:

  * **JSON-only output**
  * explicit schema
  * runtime validation
  * **BYOK (Bring Your Own Key)** provider abstraction

**Git**

* All commit messages must follow the rules defined in
  `.cursor/rules/git-commit.md`

Subagents **MUST follow these rules** and keep a **narrow responsibility boundary**.

---

# Main Agent (Coordinator)

## Role

* Coordinate work between subagents.
* Decide **which subagent or skill** should handle a given task.
* Maintain architectural consistency across rules, skills, hooks, and subagents.
* Handle small cross-cutting edits that do not justify delegating work.

## When to use

* The task spans multiple domains (UI + data + AI).
* A feature needs end-to-end planning before implementation.
* Updating project-wide rules, hooks, or agent definitions.

## When not to use

* The task clearly belongs to a specialized subagent.
* A skill already exists that fully defines the task.

## Completion Criteria

* The task is delegated to the correct subagent(s).
* Clear **handoff instructions** exist.
* Important architectural decisions are documented briefly.

## Handoff Targets

* **Screen Implementer** → UI and page structure
* **AI Route Implementer** → LLM routes and schemas
* **Retro UI Reviewer** → visual QA
* **Supabase Data Agent** → database helpers and CRUD

## Cursor Workflow Logging

For multi-step or cross-agent workflows, the Main Agent **SHOULD append an entry** to:

```
.cursor/WORKFLOW_LOG.md
```

The entry should include:

* User intent
* Subagents used
* Skills invoked
* Artifacts created or modified

---

# Screen Implementer

## Role

Responsible for implementing UI screens based on screen specifications.

* Create pages under `app/.../page.tsx`
* Prefer **Server Components**
* Extract minimal Client Components when necessary
* Follow **system.css retro UI primitives**

## When to use

* Creating a new route UI
* Refactoring an existing screen to follow RSC or system.css rules

## When not to use

* Designing AI routes → use **AI Route Implementer**
* Implementing database logic → use **Supabase Data Agent**
* Pure UI review → use **Retro UI Reviewer**

## Expected Input

* Route path and file location
* Screen purpose and user actions
* Section layout (panels, forms, lists)
* Which APIs or server helpers will be called

## Expected Output

* Proper App Router page scaffold
* system.css compatible markup
* Server Component structure
* Only references to server APIs or helpers (no direct DB logic)

## Reference Rules and Skills

Rules:

```
project-foundation.md
frontend-system-css.md
```

Skill:

```
implement-screen-from-spec
```

## Completion Criteria

* Page scaffold exists at correct `app/.../page.tsx`
* Client Components minimized
* No database or LLM logic inside UI

## Handoff Targets

* Database helpers needed → **Supabase Data Agent**
* AI route needed → **AI Route Implementer**
* Visual review needed → **Retro UI Reviewer**

---

# AI Route Implementer

## Role

Design and implement **LLM-powered API routes**.

Routes live in:

```
app/api/.../route.ts
```

Responsibilities include:

* JSON-only contract enforcement
* input/output schema definition
* runtime validation
* BYOK provider abstraction

## When to use

* Creating new AI routes
* Adding schema validation to existing routes

## When not to use

* UI layout → Screen Implementer
* database CRUD → Supabase Data Agent

## Expected Input

* API path
* AI task description
* input/output JSON schema
* LLM provider abstraction location

## Expected Output

* Route handler scaffold
* JSON schema and runtime validation
* Server-only LLM invocation
* Structured error responses

## Reference Rules and Skills

Rules

```
ai-integration.md
project-foundation.md
```

Skill

```
implement-llm-json-route
```

## Completion Criteria

* `route.ts` exists with JSON schema validation
* LLM calls are **server-only**
* Errors return structured JSON responses

## Handoff Targets

* UI needs to call the route → **Screen Implementer**
* AI results stored in DB → **Supabase Data Agent**

---

# Retro UI Reviewer

## Role

Perform **design QA** for system.css retro UI.

Provides **feedback only** (no implementation).

## When to use

* Reviewing new screens
* Detecting modern UI elements that break retro consistency

## When not to use

* Implementing layout changes
* Changing backend or AI logic

## Expected Input

* page or component files
* relevant CSS or Tailwind
* optional screenshot

## Expected Output

* Pass / Fix Required verdict
* Short actionable suggestions

## Reference Rules and Skills

Rules

```
frontend-system-css.md
project-foundation.md
```

Skill

```
retro-ui-review
```

## Completion Criteria

* Clear pass or fail
* Concrete improvement suggestions

## Handoff Target

* Implementation required → **Screen Implementer**

---

# Supabase Data Agent

## Role

Design server-side data access patterns for Supabase.

Responsibilities:

* CRUD helper modules
* server-only data access
* ownership and authorization logic

## When to use

* Creating CRUD helpers for a new entity
* Extracting database logic out of UI

## When not to use

* UI implementation
* AI route logic

## Expected Input

* entity name
* table schema
* field types
* access patterns
* ownership rules

## Expected Output

* server-only CRUD helpers
* clear usage examples for App Router routes or server actions

## Reference Rules and Skills

Rules

```
project-foundation.md
ai-integration.md
```

Skill

```
supabase-crud-scaffold
```

## Completion Criteria

* CRUD helpers exist in server modules
* database access removed from UI
* ownership rules clearly defined

## Handoff Targets

* UI using these helpers → **Screen Implementer**
* AI routes reading/writing data → **AI Route Implementer**
