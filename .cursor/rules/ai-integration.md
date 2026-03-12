## Reference docs

AI routes and integrations **MUST** remain consistent with the following documents:

- `docs/product/ai-spec.md` – AI tasks, inputs, and JSON output structure.
- `docs/architecture/api-contract.md` – API request/response contracts for pattern analysis, clarification, and compilation.
- `docs/architecture/data-model.md` – how AI outputs map onto core entities (e.g., Project, Pattern, Steps).

---

description: All LLM integrations must be server-side, JSON-only, schema-validated, BYOK-friendly, and preserve raw source text.
globs: app/api/**/route.ts,lib/**/llm/**.ts,lib/**/ai/\*\*.ts
alwaysApply: false

---

# AI Integration Rules

These rules are **always on** for any LLM integration.

## JSON-only responses

- All LLM responses used by the app **MUST** be JSON-only:
  - No prose, markdown, or mixed content.
  - Prompts and tooling **MUST** enforce structured JSON output.
- Free-form text responses **MUST NOT** be used directly for logic, rendering, or storage.

Example: A classification endpoint returns `{ "label": "todo", "confidence": 0.92 }`, not a paragraph.

## Schema validation

- Every LLM interaction that affects UI, storage, or downstream logic **MUST**:
  - Define explicit **input** and **output** schemas (TypeScript + runtime validator).
  - Validate the LLM’s JSON output **before** saving, rendering, or forwarding it.
- On validation failure:
  - The result **MUST** be treated as an error.
  - The app **MUST NOT** silently coerce or partially accept invalid structures.

## Raw text preservation

- When transforming user or external text via an LLM, the **raw source text MUST be preserved** alongside structured results.
- The system **MUST** be able to:
  - Re-run transformations.
  - Compare raw vs structured content if needed.

## Server-only LLM calls

- LLM providers **MUST** only be called from server code:
  - Route handlers under `app/api/.../route.ts`.
  - Server actions or backend helpers.
- Client Components **MUST NOT** call LLM providers directly.
- Client code **MAY** call internal JSON APIs that wrap server-side LLM calls.

## BYOK-friendly structure

- Integration code **MUST** assume a Bring Your Own Key (BYOK) model:
  - No provider keys in source files.
  - Configuration read from environment variables or a provider abstraction.
- The design **MUST** allow swapping providers via a single abstraction layer so that:
  - Prompting and schema logic are not tied to one vendor SDK.
