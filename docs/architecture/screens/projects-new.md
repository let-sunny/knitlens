# Screen: /projects/new

## Purpose

Create a new knitting project from an uploaded PDF pattern.

This screen maps to the first step in the screen flow:

Create Project
→ Pattern Analysis
→ Clarification (optional)
→ Pattern Compilation
→ Project Tracker

## Inputs

- project title
- pattern PDF file
- optional size selection

## Sections

- page title
- project title input
- pattern PDF upload control (file picker or dropzone)
- optional size selector
- primary action button

## Primary Actions

- Analyze Pattern

## Action Behavior

### Analyze Pattern

1. create or initialize a project
2. upload and store the PDF pattern file
3. extract narrative pattern text from the PDF
4. send extracted text to pattern analysis
5. determine whether clarification is needed

## API Dependencies

- `POST /api/pattern/analyze`

## Success Paths

### If no clarification is needed

redirect to:

- `/projects/[id]`

### If clarification is needed

redirect to:

- `/projects/[id]/clarify`

## Error States

- missing or invalid PDF file
- invalid request
- text extraction failure
- pattern analysis failure
- AI response validation failure

## Notes

- This screen is input-focused.
- It should not display compiled knitting steps.
- UI implementation should follow system.css and retro wrapper components.