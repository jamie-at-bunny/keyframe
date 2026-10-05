// bunny.net design tokens for Keyframe videos. palette.ts and shape.ts are the
// single source of brand colour and corners.
// Stage roles below match the Burrow kit, the house look on a navy stage.
import { ON_DARK, withAlpha } from "./palette";

export { FONT, MONO } from "./fonts";
export { DARK, type Hue, LIGHT, MAIN, ON_DARK, type Step, shade, withAlpha } from "./palette";
export { RADIUS } from "./shape";

// The standard stage: 1920x1080 at 30fps. Render at 3K with --scale 1.5.
export const STAGE = { width: 1920, height: 1080, fps: 30 } as const;

export const BG = ON_DARK.bg;
export const SURFACE = ON_DARK.surface; // cards and panels
export const RAISED = ON_DARK.raised; // chips, title bars, an active surface
export const INK = ON_DARK.text;
export const BRAND = ON_DARK.brand;
// Lift for cards and tiles: darker than the stage, never a glow.
export const SHADOW = `0 18px 40px ${ON_DARK.shadow}`;

export const inkA = (a: number) => withAlpha(INK, a);
export const brandA = (a: number) => withAlpha(BRAND, a);
export const MUTED = inkA(0.66); // secondary type
export const FAINT = inkA(0.4); // tertiary type, ticks
export const RAIL = inkA(0.18); // hairline rails and dividers
