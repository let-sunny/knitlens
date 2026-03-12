#!/usr/bin/env node

/**
 * append-workflow-log.js
 *
 * Command hook script for Cursor.
 *
 * - Triggered by hooks configured in `.cursor/hooks.json` (e.g., `sessionEnd`, `subagentStop`).
 * - Reads `.cursor/last-workflow.json` if it exists.
 * - Appends a formatted entry to `.cursor/WORKFLOW_LOG.md` using the agreed template.
 * - Deletes `.cursor/last-workflow.json` after successful append to avoid duplicate logs.
 *
 * If `.cursor/last-workflow.json` is missing or invalid, this script is a no-op and exits 0.
 */

const fs = require("fs");
const path = require("path");

function safeParseJSON(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function joinOrNone(value) {
  if (!Array.isArray(value) || value.length === 0) return "none";
  return value.join(", ");
}

function buildLogEntry(data) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const title = data.title || "Untitled workflow";
  const intent = data.intent || "N/A";
  const summary = data.summary || "N/A";

  const sub = data.subagents || {};
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const artifacts = data.artifacts || {};
  const followUp = Array.isArray(data.followUp) ? data.followUp : [];

  const lines = [];
  lines.push(`## ${dateStr} – ${title}`);
  lines.push("");
  lines.push(`- **User intent**: ${intent}`);
  lines.push(`- **Main Agent summary**: ${summary}`);
  lines.push(`- **Subagents involved**:`);
  lines.push(`  - Screen Implementer: ${sub["screen-implementer"] || "no"}`);
  lines.push(
    `  - AI Route Implementer: ${sub["ai-route-implementer"] || "no"}`
  );
  lines.push(`  - Retro UI Reviewer: ${sub["retro-ui-reviewer"] || "no"}`);
  lines.push(`  - Supabase Data Agent: ${sub["supabase-data-agent"] || "no"}`);
  lines.push(`- **Skills used**: ${joinOrNone(skills)}`);
  lines.push(`- **Key artifacts**:`);
  lines.push(`  - Rules: ${joinOrNone(artifacts.rules)}`);
  lines.push(`  - Skills: ${joinOrNone(artifacts.skills)}`);
  lines.push(`  - Hooks: ${joinOrNone(artifacts.hooks)}`);
  lines.push(`  - Subagents: ${joinOrNone(artifacts.subagents)}`);
  lines.push(`  - Code scaffolds: ${joinOrNone(artifacts.codeScaffolds)}`);
  lines.push(
    `- **Open questions / follow-ups**: ${
      followUp.length ? followUp.join(" | ") : "None"
    }`
  );
  lines.push("");

  return lines.join("\n");
}

async function main() {
  // Consume stdin (hook input) so the process doesn't hang, but we don't need it for now.
  await new Promise((resolve) => {
    let resolved = false;
    process.stdin.on("data", () => {
      // ignore
    });
    process.stdin.on("end", () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    });
    // Safety timeout in case there's no stdin
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 10);
  });

  const root = process.cwd();
  const statePath = path.join(root, ".cursor", "last-workflow.json");
  const logPath = path.join(root, ".cursor", "WORKFLOW_LOG.md");

  if (!fs.existsSync(statePath)) {
    // Nothing to log; return empty JSON to satisfy hook contract.
    console.log("{}");
    process.exit(0);
  }

  const raw = fs.readFileSync(statePath, "utf8");
  const data = safeParseJSON(raw);
  if (!data) {
    console.log("{}");
    process.exit(0);
  }

  const entry = buildLogEntry(data);

  let existing = "";
  try {
    existing = fs.readFileSync(logPath, "utf8");
  } catch (e) {
    // If WORKFLOW_LOG does not exist yet, start a new one.
    existing = "";
  }

  const needsNewline =
    existing.length > 0 && !existing.endsWith("\n") ? "\n\n" : "\n";
  const updated = existing + needsNewline + entry + "\n";

  fs.writeFileSync(logPath, updated, "utf8");

  // Best effort: remove the state file so the same workflow is not logged twice.
  try {
    fs.unlinkSync(statePath);
  } catch (e) {
    // ignore
  }

  // Minimal valid JSON output for the hook engine.
  console.log("{}");
  process.exit(0);
}

main().catch(() => {
  // Fail-open: do not block the agent if logging fails.
  console.log("{}");
  process.exit(0);
});
