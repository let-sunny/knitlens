#!/usr/bin/env node

/**
 * Cursor hook: run typecheck and lint.
 * Triggered by sessionEnd / subagentStop (configured in hooks.json).
 * Exits 0 if both pass, non-zero otherwise.
 */

const { spawnSync } = require("child_process");

const r = spawnSync("pnpm run typecheck && pnpm run lint", {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
