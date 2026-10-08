// Burrow's colour roles, from the dark stage palette. Orange is bunny.net: the
// Burrow zone, the backbone, the probes. Blue is the plain public internet path
// the direct zone always takes. The two zone colours hold across all four
// scenes, so a viewer learns them once.
import { BRAND, brandA, ON_DARK, withAlpha } from "@keyframe/kit";

export const ZONE = {
  direct: ON_DARK.blue,
  burrow: BRAND,
} as const;
export const directA = (a: number) => withAlpha(ZONE.direct, a);
export const burrowA = brandA;

export const ORIGIN = ON_DARK.green;
export const originA = (a: number) => withAlpha(ORIGIN, a);

// Reroute markers are yellow, distinct from both zone lines.
export const REROUTE = ON_DARK.yellow;
export const rerouteA = (a: number) => withAlpha(REROUTE, a);
