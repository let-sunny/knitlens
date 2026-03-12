# KnitLens Development Playbook

This document explains how agents should approach feature implementation in this repository.

## Recommended reading order

1. `docs/product/one-pager.md`
2. `docs/product/ai-spec.md`
3. `docs/architecture/ia.md`
4. `docs/architecture/screen-flow.md`
5. `docs/architecture/screens/*`
6. `docs/architecture/data-model.md`
7. `docs/architecture/api-contract.md`
8. `docs/design/stitch/*`

## Step 1 — Understand product intent

Read:

- docs/product/one-pager.md
- docs/product/ai-spec.md

This defines:
- the product goal
- the AI behavior
- the overall user flow.

---

## Step 2 — Understand navigation and flow

Read:

- docs/architecture/ia.md
- docs/architecture/screen-flow.md

This defines:

- the primary routes
- how the user moves through the application.

---

## Step 3 — Understand the specific screen

Read:

- docs/architecture/screens/<screen>.md

Also consult visual references:

- docs/design/stitch/*

This defines:

- the screen purpose
- sections
- user actions
- API dependencies.

---

## Step 4 — Understand data structures

Read:

- docs/architecture/data-model.md

This defines:

- core entities
- relationships
- persistence expectations.

---

## Step 5 — Understand API behavior

Read:

- docs/architecture/api-contract.md

This defines:

- route paths
- request shape
- response shape.

---

## Step 6 — Implement

Follow project rules:

- Server Components first
- system.css UI
- JSON-only AI contracts
- Supabase server-only data access