# Keyframe

Use the `keyframe` skill (`.claude/skills/keyframe/SKILL.md`) for any work here: it holds the
house style, the frame rule, the kit map, sound and rendering. Never add a video framework
dependency; the engine is ours. Never use an em dash in copy, comments or docs. Check stills with
`npm run render`, passing `<Id> --still <frame>`, and look at them before calling a video done.

## Code

- `npm run lint` (tsc and Biome) passes before anything is called done; `npm run format` fixes
  formatting and import order. Suppress a Biome rule only with a `biome-ignore` comment that says why.
- Never invent a value that already exists. Colours come from `kit/palette.ts`, corners from
  `RADIUS`, product names from `PRODUCTS`, beats from the video's `T`. A string literal naming one of
  these is a missing import.
- Derive types from their source: `LogoVariant`, `VideoMeta & {...}`, `keyof typeof MAP`.
- Reach for a config map over a chain of ternaries or `if/else` (see `PLACEMENT` in `kit/Bumper.tsx`).
- Helpers take values and return values; the component owns the state.
- Third copy means extract: a third copy of a style or block becomes a kit helper (`rise()`,
  `TitleBar`).
- Handle the empty case: no steps, no rows, no product are states, not crashes.
- Blank line before every `return`. Comment the why, never the what. No `console.log`, no
  commented-out code, no `TODO` without a named follow-up.
