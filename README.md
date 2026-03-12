# KnitLens

KnitLens is an AI-assisted knitting pattern interpreter for human knitters.

It converts messy knitting pattern PDFs into structured, trackable steps so that knitters can follow complex patterns more easily.

---

## Problem

Many knitting patterns are distributed as PDFs that are difficult to read and follow.

Common issues include:

- inconsistent formatting  
- multiple sizes mixed into one instruction  
- ambiguous pattern instructions  
- long condensed text blocks  

These patterns are often hard to track while knitting, especially for beginners.

---

## Solution

KnitLens converts knitting pattern PDFs into structured, step-by-step instructions.

The system:

1. extracts text from a knitting pattern PDF  
2. analyzes the pattern using AI  
3. asks clarification questions if needed  
4. compiles a clean structured pattern  
5. provides a row-by-row project tracker  

---

## Core Features

### Pattern PDF Upload

Upload a knitting pattern PDF to start a new project.

### AI Pattern Analysis

AI analyzes the pattern text and extracts:

- sections  
- rows  
- instructions  

### Clarification Loop

If the pattern contains ambiguity, KnitLens asks questions such as:

- Which size are you knitting?  
- Which yarn weight should be used?  

User answers help the AI generate a more accurate pattern structure.

### Pattern Compilation

The final pattern is compiled into a structured format:

```text
Section → Rows → Steps
```

### Project Tracker

Knitters can track progress row by row while working on the project.

---

## Architecture

High-level pipeline:

```text
PDF Upload
↓
Text Extraction
↓
Pattern Analysis (AI)
↓
Clarification (optional)
↓
Pattern Compilation
↓
Project Tracker
```

---

## Tech Stack

### Frontend

- Next.js (App Router)  
- TypeScript  
- system.css (retro Macintosh-style UI)  

### Backend

- Next.js Route Handlers  
- Supabase  

### AI

- LLM provider (BYOK)  
- JSON-only responses  
- runtime schema validation  

---

## Project Structure

```text
app/
  projects/
  api/

docs/
  product/
  architecture/
  design/

.cursor/
  rules/
  skills/
  subagents/
```

---

## Development Guide

Important project documentation:

```text
docs/product/one-pager.md
docs/product/ai-spec.md

docs/architecture/ia.md
docs/architecture/screen-flow.md
docs/architecture/data-model.md
docs/architecture/api-contract.md
```

Design references:

```text
docs/design/stitch/
```

AI agents operate according to rules defined in:

```text
.cursor/rules/
.cursor/skills/
.cursor/subagents/
```

---

## Roadmap

### MVP

- PDF upload  
- AI pattern analysis  
- clarification questions  
- structured pattern generation  
- row-by-row tracker  

### Future

- multiple project management  
- pattern sharing  
- mobile companion app  

