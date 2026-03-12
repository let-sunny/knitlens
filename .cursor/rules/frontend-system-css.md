---
description: Frontend UI must use system.css with a classic Macintosh-inspired retro look; bans modern glossy, glassy, or heavily animated designs.
globs: app/**/*.tsx,components/**/*.tsx,app/**/*.css
alwaysApply: false
---

Frontend System CSS Rules
=========================

These UI rules are **always on** for all frontend work.

## system.css as baseline

- All pages and components **MUST** use system.css as the primary visual baseline.
- system.css primitives (windows, buttons, lists, inputs, etc.) **SHOULD** be used wherever they fit.
- Introducing another design system (Tailwind UI kits, Material, Chakra, shadcn, etc.) as a default **IS NOT ALLOWED**.

Example: A form uses system.css buttons/inputs, not a custom button library.

## Custom styling

- Tailwind or custom CSS **MUST** be minimal and only used when system.css cannot reasonably express the pattern.
- Custom styling **MUST**:
  - Preserve a retro, pixel-aligned feel (no soft-glass, neon, or modern gradients).
  - Prefer small, local overrides over new global themes.

## Retro primitives

- Common retro primitives **SHOULD** be exposed as reusable wrapper components, such as:
  - Windows, toolbars, menus.
  - Panels, lists, table-like content.
  - Buttons and form controls.
- These wrappers **MUST**:
  - Live in a shared UI area (`components/` or `app/(components)/`, chosen once).
  - Wrap system.css primitives instead of re-implementing them.

## Macintosh-inspired style

- The UI **MUST** evoke a classic Macintosh-style interface:
  - Flat, windowed layout.
  - Clear borders and separations.
  - Conservative color usage and simple iconography.
- The UI **MUST NOT** use:
  - Large drop-shadow card stacks.
  - Rounded, glassy, or gradient-heavy surfaces that feel modern.

## Motion and layout

- The following are **banned by default**:
  - Glassmorphism and strong blur effects.
  - Overly glossy or neon gradients.
  - Heavy motion or parallax animations.
  - Large soft cards as the primary layout primitive.
- Animations, if present, **MUST** be subtle and rare; instant, snappy changes are preferred.
- Layout and spacing **SHOULD**:
  - Follow system.css conventions.
  - Be compact and grid-like, not marketing-site spacious.

## Design references

For concrete layouts and grouping patterns, agents **SHOULD** refer to the Stitch design mocks under:

- `docs/design/stitch/*`

when deciding how to structure screens, while still applying system.css and retro rules.

