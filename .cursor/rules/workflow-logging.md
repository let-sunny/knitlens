Workflow Logging Rules
======================

These rules define **when and how** agents must create workflow log entries for this project.

All workflow logs are generated via:

- `.cursor/last-workflow.json` (structured input)
- `.cursor/hooks.json` (Cursor hook configuration)
- `.cursor/hooks/append-workflow-log.js` (append script)
- `.cursor/WORKFLOW_LOG.md` (Markdown log)

Agents **MUST NOT** edit `WORKFLOW_LOG.md` directly.

## A) When to create `.cursor/last-workflow.json`

The Main Agent **MUST** create `.cursor/last-workflow.json` when **any** of the following are true:

- A task **spans multiple subagents**, for example:
  - Supabase Data Agent + Screen Implementer.
  - AI Route Implementer + Screen Implementer + Retro UI Reviewer.
- A **new rule, skill, hook, or subagent** is introduced.
- A **meaningful architectural decision** is made, such as:
  - Choosing canonical directories for shared UI, Supabase helpers, or LLM provider abstractions.
  - Changing how Server vs Client boundaries are applied across the project.
- A **multi-file feature scaffold** is generated, such as:
  - A new route with multiple supporting components.
  - A new entity with Supabase CRUD helpers and related server actions.

The Main Agent **MUST NOT** create workflow logs for:

- Trivial edits (e.g., copy changes, small type fixes).
- Small, localized refactors that do not change architecture or contracts.
- Pure formatting changes (lint fixes, prettifying, whitespace-only edits).

If in doubt, prefer **not** logging trivial work; workflow logs are for **meaningful, multi-step activities**.

## B) Who writes the JSON

- The **Main Agent** is solely responsible for writing `.cursor/last-workflow.json`.
- Subagents:
  - **MAY** produce structured metadata (e.g., which files they touched, which skills they used).
  - **MUST NOT** write or append to `.cursor/WORKFLOW_LOG.md` directly.
  - **SHOULD NOT** overwrite `.cursor/last-workflow.json` on their own unless explicitly delegated by the Main Agent.
- The Main Agent:
  - **Collects** metadata from subagents.
  - **Composes** it into a single `.cursor/last-workflow.json` object that represents the entire workflow.

## C) JSON schema for `.cursor/last-workflow.json`

The JSON file **MUST** follow this shape:

```json
{
  "title": "Short workflow title",
  "intent": "User intent one-liner",
  "summary": "Main agent approach summary",
  "subagents": {
    "screen-implementer": "yes/no + short note",
    "ai-route-implementer": "yes/no + short note",
    "retro-ui-reviewer": "yes/no + short note",
    "supabase-data-agent": "yes/no + short note"
  },
  "skills": [],
  "artifacts": {
    "rules": [],
    "skills": [],
    "hooks": [],
    "subagents": [],
    "codeScaffolds": []
  },
  "followUp": []
}
```

Field semantics:

- **`title`**: Short, human-readable workflow title (used as the log entry heading).
- **`intent`**: One-line description of the original user intent.
- **`summary`**: 1–2 sentence summary of the Main Agent’s approach.
- **`subagents`**:
  - Keys:
    - `screen-implementer`
    - `ai-route-implementer`
    - `retro-ui-reviewer`
    - `supabase-data-agent`
  - Values: `"yes - <short note>"` or `"no"`.
- **`skills`**:
  - List of skill identifiers used during the workflow (e.g., `implement-screen-from-spec`).
- **`artifacts`**:
  - `rules`: Names or paths of rule files created/updated.
  - `skills`: Names or paths of skill files created/updated.
  - `hooks`: Hook-related files created/updated (e.g., `hooks.json`, hook scripts).
  - `subagents`: Subagent definition files created/updated.
  - `codeScaffolds`: High-level code scaffolds (paths only; no code content).
- **`followUp`**:
  - Array of open questions or follow-up tasks as short strings.

The append script (`append-workflow-log.js`) is responsible for translating this JSON into Markdown.

## D) Completion condition

`.cursor/last-workflow.json` **MUST ONLY** be written when the workflow is considered **complete** from the Main Agent’s perspective:

- All intended subagent work for this workflow is finished.
- There is a stable summary of:
  - What was requested.
  - What was done.
  - Which artifacts now exist.
  - What remains as follow-up.

Once the JSON is written:

- The Cursor hooks (`sessionEnd` / `subagentStop`) will:
  - Run `node .cursor/hooks/append-workflow-log.js`.
  - Append a new entry to `.cursor/WORKFLOW_LOG.md`.
  - Remove `.cursor/last-workflow.json`.

Agents **MUST NOT** rely on partially written JSON; always write a complete object in one shot.

## E) Constraints

- At any time, there should be **at most one** `.cursor/last-workflow.json` file.
- If a new workflow begins before the previous one has been logged:
  - The Main Agent **SHOULD** wait to write JSON until the first workflow is complete, or
  - Overwrite the existing JSON with the final state before ending the session.
- Agents **MUST**:
  - Overwrite the JSON file rather than appending to it.
  - Leave Markdown formatting and entry creation to the append script.

## Agent Workflow Logging Procedure

To keep logging consistent, agents **SHOULD** follow this procedure:

1. **Execute workflow tasks**  
   - Plan and run the workflow, possibly involving multiple subagents and skills.

2. **Main Agent summarizes the workflow**  
   - Decide whether this workflow is log-worthy (see section A).
   - If yes, prepare:
     - `title`, `intent`, `summary`
     - `subagents` map
     - `skills` list
     - `artifacts` and `followUp` lists

3. **Write `.cursor/last-workflow.json`**  
   - Serialize the data into the schema described in section C.
   - Overwrite any existing `.cursor/last-workflow.json`.

4. **Allow Cursor hooks to append the log automatically**  
   - When the session or subagent run ends, Cursor hooks will:
     - Invoke `append-workflow-log.js`.
     - Append the formatted entry to `WORKFLOW_LOG.md`.
     - Clean up `.cursor/last-workflow.json`.

This procedure ensures that workflow logs remain **consistent, structured, and generated automatically** without manual edits to the Markdown log.

