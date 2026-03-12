# Screen: /projects/[id]

## Purpose

Display the compiled knitting project and allow the user to track progress step by step.

This screen maps to the final stage in the screen flow:

Create Project
→ Pattern Analysis
→ Clarification (optional)
→ Pattern Compilation
→ Project Tracker

## Inputs

- compiled project data
- section list
- step list
- current progress state

## Sections

- page title
- project summary
- progress indicator
- section list
- step list
- step action controls

## Primary Actions

- mark step complete
- update repeat progress
- navigate between sections
- open clarification again if needed later

## Action Behavior

### Mark Step Complete

1. update current project progress
2. persist progress state
3. refresh visible tracker state

### Update Repeat Progress

1. increment or update repeat count
2. persist repeat progress
3. refresh tracker state

## API Dependencies

- `GET /api/projects/[id]`
- `POST /api/projects/[id]/progress`

## Success Paths

- tracker reflects current project state
- user can leave and return later without losing progress

## Error States

- project not found
- compiled project missing
- progress update failure
- inconsistent step state

## Notes

- This is the main working screen for the user.
- It should prioritize clarity of sections, steps, and current position.
- It should not re-run pattern analysis directly from this screen.
- UI should remain compact and information-dense.