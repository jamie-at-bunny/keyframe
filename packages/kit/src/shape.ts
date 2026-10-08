// Corner radii for every bunny.net scene. Nothing goes above 10px, and 6px is
// the common case. Buttons, chips, pills and tags use `sm`, never a full pill.
// Dots and markers stay round.
export const RADIUS = {
  xs: 3, // accent bars, small square markers
  sm: 6, // chips, tags, pills, buttons: the default
  md: 10, // cards, tiles, panels: the maximum
} as const;
