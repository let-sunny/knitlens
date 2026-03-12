KnitLens Cursor Hooks
=====================

This folder contains **quality gates** for KnitLens. The hooks are designed as a **scaffold**, not a final implementation. They encode the project rules you already defined:

- Next.js App Router + TypeScript + ESLint flat config (`next/core-web-vitals` + TS rules).
- system.css retro UI baseline.
- Server Components by default.
- Supabase DB logic in server-only modules.
- AI routes with JSON-only, schema-validated, BYOK-friendly contracts.

The actual Cursor hooks format may evolve. Treat `hooks.json` as a **best-effort starting point** with TODO markers.

## Hooks overview (by category)

### 1. Foundation / structure hooks

- **`foundation.app-router-structure`** (severity: **warn**)  
  - Purpose: When files under `app/` change, remind the agent to follow App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`) and flag suspicious placement.
  - Effect: Non-blocking warning. Helps avoid ad-hoc routing structures early.

- **`foundation.db-logic-in-ui`** (severity: **warn**)  
  - Purpose: Warn if DB logic or raw SQL appears inside UI components (`app/**/*.tsx`, `components/**/*.tsx`).
  - Effect: Non-blocking warning. Encourages moving DB access to server-only helpers.

- **`foundation.duplicate-shared-ui`** (severity: **warn**)  
  - Purpose: Heuristically spot duplicated UI that should become shared retro wrapper components.
  - Effect: Non-blocking warning. Nudge toward a clean primitive-based UI library.

### 2. Server vs Client hooks

- **`server-vs-client.new-use-client`** (severity: **warn**)  
  - Purpose: Detect new `\"use client\"` directives and require a brief justification nearby.
  - Effect: Non-blocking warning. Keeps Client Components intentional.

- **`server-vs-client.large-client-component`** (severity: **warn**)  
  - Purpose: Warn when very large components are client-side and might need splitting.
  - Effect: Non-blocking warning. Encourages server-first design and smaller client wrappers.

- **`server-vs-client.client-data-fetching`** (severity: **warn**)  
  - Purpose: Warn when data fetching is moved into client components without a clear reason.
  - Effect: Non-blocking warning. Reminds you to keep data fetching on the server where possible.

### 3. UI / retro design hooks

- **`ui-retro.disallowed-modern-effects`** (severity: **warn**)  
  - Purpose: Catch styling that breaks the retro system.css baseline: large shadows, glassmorphism, strong blur, oversized radius, heavy gradients, excessive animation.
  - Effect: Non-blocking warning. Helps maintain the classic Macintosh look.

- **`ui-retro.missing-system-css-wrappers`** (severity: **warn**)  
  - Purpose: Detect repeated UI patterns that should use shared system.css-based wrapper components.
  - Effect: Non-blocking warning. Encourages reuse of retro primitives.

### 4. AI / JSON integrity hooks

- **`ai-json.routes-require-schemas`** (severity: **block**)  
  - Purpose: For AI routes and handlers, require input/output schemas and runtime validation to exist.
  - Effect: Blocking by default. You can downgrade to `warn` if this proves too strict early on.

- **`ai-json.json-only-response-handling`** (severity: **block**)  
  - Purpose: Ensure responses are JSON-only and not free-form text or markdown.
  - Effect: Blocking by default. Enforces the core AI rule for JSON-only contracts.

- **`ai-json.raw-text-preservation`** (severity: **warn**)  
  - Purpose: Warn if raw source text is not preserved alongside structured LLM results.
  - Effect: Non-blocking warning. Helpful guardrail for later analysis and replays.

- **`ai-json.provider-in-client-code`** (severity: **block**)  
  - Purpose: Prevent LLM provider calls from appearing in client-side code.
  - Effect: Blocking. Enforces server-only AI calls.

### 5. Supabase / data hooks

- **`supabase.client-in-client-component`** (severity: **block**)  
  - Purpose: Prevent Supabase client usage inside Client Components.
  - Effect: Blocking. DB logic must stay in server-only modules.

- **`supabase.db-logic-in-ui`** (severity: **warn**)  
  - Purpose: Warn when DB access logic is mixed into presentational UI.
  - Effect: Non-blocking warning. Encourages cleaner separation.

- **`supabase.encourage-server-helpers`** (severity: **warn**)  
  - Purpose: Nudge toward centralized Supabase CRUD helpers and server actions/route handlers.
  - Effect: Non-blocking warning. Helps converge on consistent data patterns.

## Warnings vs blockers

- **Blockers (stricter gates)**:
  - `ai-json.routes-require-schemas`
  - `ai-json.json-only-response-handling`
  - `ai-json.provider-in-client-code`
  - `supabase.client-in-client-component`

- **Warnings (non-blocking nudges)**:
  - All other hooks in `foundation`, `serverVsClient`, `uiRetro`, and `supabaseData`.

You can turn a hook from **block** to **warn** simply by changing its `severity` in `hooks.json` once the actual hook engine is wired up.

## Manual adjustments needed

- **Hook engine format**:  
  `hooks.json` is a **format-agnostic scaffold**. You need to map:
  - `categories` / `hooks` / `triggers` / `checks` / `severity`
  - into whatever mechanism Cursor exposes for hooks once documentation is available.

- **Checks implementation**:  
  Each `checks` array currently contains `TODO` descriptions of what the check should do. These need to be implemented using:
  - Whatever script or rule language Cursor hooks eventually support, or
  - External tooling wired into your workflow (e.g., custom linters, scripts, or CI jobs).

- **Globs and events**:  
  The `globs` and `events` fields are descriptive. Confirm:
  - Which file patterns should actually be watched in your repo.
  - Which events (`fileCreated`, `fileModified`, etc.) your hook system can observe.

Once Cursor publishes an official hooks schema, you can translate this scaffold directly into the supported format without rethinking the underlying quality gates.

