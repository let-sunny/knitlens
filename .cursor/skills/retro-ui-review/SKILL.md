Retro UI Review
===============

## Purpose

Provide a structured checklist to review whether a screen or component:

- Adheres to the **system.css** baseline.
- Preserves the **classic Macintosh-inspired** aesthetic.
- Avoids modern, glossy, or over-animated UI patterns.
- Uses reusable retro primitives instead of scattered custom styling.

## When to use this skill

Use this skill when:

- Reviewing a new screen or layout implementation.
- Refactoring UI to align with project rules.
- Performing design QA before merging a UI-heavy change.

## Review inputs

Gather:

- The relevant `page.tsx` and any associated components.
- Any custom CSS / Tailwind classes used by that screen.
- Screenshots or a running instance if available (for visual judgment).

## Review checklist

1. **System.css usage**
   - Is system.css used as the primary styling source?
   - Are system.css primitives (windows, panels, buttons, inputs) used where applicable?
   - Are there obvious places where system.css could replace ad-hoc styles?

2. **Excessive custom styling**
   - Are there many custom classes or large bespoke CSS blocks?
   - Is Tailwind being used heavily where system.css primitives would suffice?
   - Can repeated patterns be moved into reusable retro wrapper components?

3. **Modern card aesthetics**
   - Are there large, soft, card-like containers that resemble modern dashboards?
   - Do components rely on deep shadows, large border radii, or gradient backdrops?
   - If cards are necessary, do they still feel aligned with classic Mac windowing (flat, bordered, restrained)?

4. **Animation and motion**
   - Are there noticeable animations, transitions, or parallax effects?
   - Are hover or focus effects subtle and consistent, or flashy and modern?
   - Could interactions be simplified to instant or very minimal transitions?

5. **Spacing and density**
   - Is spacing consistent and grid-like, appropriate for a retro desktop UI?
   - Is the screen overly sparse, with marketing-site levels of whitespace?
   - Are related controls and content grouped in a compact, window-like layout?

6. **Reusable primitives**
   - Does the screen leverage shared retro components (windows, toolbars, panels, buttons)?
   - Are there repeated patterns that suggest new primitives should be extracted?
   - Does the component API (props) encourage reuse across screens?

## Output of a review

The review should produce:

- A short summary of whether the screen **passes** or **needs changes** relative to:
  - `frontend-system-css.md`
  - `project-foundation.md` (where relevant to structure)
- A concise list of actionable items, such as:
  - Replace ad-hoc panels with a shared window primitive.
  - Remove or tone down specific animations or shadows.
  - Consolidate repeated Tailwind utilities into a retro-styled wrapper.

The goal is to **converge on a consistent retro system.css UI**, not to enforce pixel-perfect design.

## Reference docs

When reviewing UI against retro rules, agents **SHOULD** refer to:

- `docs/design/stitch/*` – Stitch HTML mocks that represent the intended layouts and visual language for key screens.

