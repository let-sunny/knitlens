Implement LLM JSON Route
=========================

## Purpose

Provide a repeatable workflow to create a **Next.js App Router route handler** that:

- Calls an LLM on the server.
- Enforces JSON-only responses.
- Validates output against explicit schemas.
- Respects AI integration and BYOK rules.

## When to use this skill

Use this skill to:

- Create or update `app/api/.../route.ts` routes that call an LLM.
- Add new JSON-only AI endpoints for the frontend.
- Refactor existing AI routes to add validation and a provider abstraction.

## Required inputs

Before scaffolding, clarify:

- **Route purpose**: What the endpoint does and whether it mutates state.
- **Input schema**: Request fields, types, required vs optional.
- **Output schema**: Exact JSON shape to return (fields, enums, limits).
- **Provider abstraction**: Which provider(s) may be used and where the abstraction lives (e.g., `lib/llm/client`).

If something is unknown, define a minimal schema and leave room to extend.

## Workflow

1. **Pick the route file**
   - Map the purpose to `app/api/<name>/route.ts`, following existing naming.

2. **Define schemas**
   - Add TypeScript types for `RequestPayload` and `ResponsePayload`.
   - Add runtime validation for:
     - Incoming requests.
     - LLM JSON output.

3. **Use a provider abstraction**
   - Implement or call a provider-agnostic LLM client that:
     - Reads keys/config from env or injected config.
     - Hides vendor-specific SDK details.
   - The route should call this client with prompt/context + typed input data.

4. **Enforce JSON-only responses**
   - Prompt/configure the LLM to return pure JSON (no prose/markdown).
   - Treat malformed JSON as an error path.

5. **Validate and respond**
   - Parse LLM output as JSON and validate against the output schema.
   - On failure:
     - Return a JSON error object.
     - Do not persist or render invalid data.

6. **Handle errors cleanly**
   - Distinguish:
     - Invalid input (400).
     - Provider/network issues (5xx).
     - Schema validation failures.
   - Keep all responses JSON with a predictable error shape.

7. **Deployment checks**
   - No secrets hardcoded; env vars only.
   - Route is safe to call from the client (no provider keys exposed).

## Expected outputs

- A route handler scaffold in `app/api/.../route.ts` that:
  - Calls the LLM only on the server.
  - Uses a BYOK-friendly provider abstraction.
  - Exposes a clear JSON contract.
- A validation scaffold:
  - Types for input and output.
  - Runtime validators for request and response.

## Reference docs

When designing AI routes, agents **SHOULD** align with:

- `docs/product/ai-spec.md` – AI tasks, inputs, and expected JSON output shapes.
- `docs/architecture/api-contract.md` – API request/response contracts for pattern analysis, clarification, and compilation.
- `docs/architecture/data-model.md` – how AI outputs are stored on core entities (Project, Pattern, Steps).

