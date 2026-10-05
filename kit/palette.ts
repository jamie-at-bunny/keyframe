// bunny.net brand palette: the single source for brand colour in new work.
//
// Six hues, eight steps each, in a light and a dark set. Index 0..7 is step
// 1..8 on the brand sheet. Light runs lightest to darkest; dark runs darkest to
// lightest, so step 6 (index 5) is the main colour in both sets.
//
// Use LIGHT on light stages and DARK accents on dark stages; the dark set is
// tuned to stay legible on a dark background. `ON_DARK` below maps the palette
// onto the roles a navy video stage needs.

type Scale = readonly [string, string, string, string, string, string, string, string];

export const LIGHT = {
  green: ["#F2FAF5", "#E5F5EC", "#C8EAD6", "#A5DEBF", "#7AD2A4", "#2FC584", "#198053", "#115538"],
  orange: ["#FFF5F3", "#FFEAE7", "#FFD4CD", "#FFBAAE", "#FF9D89", "#FF7854", "#A0421E", "#652811"],
  yellow: ["#FDF8EF", "#FCF0DC", "#FCE9C8", "#FDD899", "#FFC453", "#FFAF48", "#E58810", "#9D5B05"],
  red: ["#FAEFEC", "#F9E6E2", "#F7D5CD", "#F6BFB1", "#F6A791", "#DE3E25", "#C42924", "#841815"],
  blue: ["#EEF4FE", "#BACEFA", "#91B7FC", "#63A1FB", "#1870C6", "#183D6D", "#122F54", "#0E233F"],
  grey: ["#F3F4F5", "#E6E9EC", "#CDD3D8", "#B4BDC5", "#9BA7B2", "#687A8B", "#364E65", "#243342"],
} as const satisfies Record<string, Scale>;

export const DARK = {
  green: ["#0C1F1A", "#14412F", "#1A5D44", "#238C65", "#29B880", "#33DA98", "#57E3B0", "#7EECB8"],
  orange: ["#2D1A13", "#4A2519", "#75311D", "#B74A24", "#E96335", "#FF784D", "#FF9770", "#FFB393"],
  yellow: ["#2B2310", "#46361A", "#7A5325", "#A87030", "#D5973C", "#FFB949", "#FFD270", "#FFDF96"],
  red: ["#2D1B19", "#492723", "#6E3935", "#9E514C", "#CC675F", "#E9776A", "#F59588", "#FFB1A3"],
  // step 4 reads "3C5BA" on the sheet, a digit short; #3C5BBA sits between its neighbours
  blue: ["#131F33", "#1F2D50", "#2F4580", "#3C5BBA", "#567DD0", "#6798F3", "#86B3FF", "#A3C9FF"],
  grey: ["#262830", "#2E313A", "#3F444F", "#525A6B", "#6A738A", "#939BAD", "#BFC6D0", "#E2E5E9"],
} as const satisfies Record<string, Scale>;

export type Hue = keyof typeof LIGHT;
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Look a colour up by its sheet step: shade(DARK, "orange", 6).
export const shade = (set: typeof LIGHT | typeof DARK, hue: Hue, step: Step): string => set[hue][step - 1];

// Main colour (step 6) of each hue.
export const MAIN = {
  light: Object.fromEntries(Object.entries(LIGHT).map(([h, s]) => [h, s[5]])) as Record<Hue, string>,
  dark: Object.fromEntries(Object.entries(DARK).map(([h, s]) => [h, s[5]])) as Record<Hue, string>,
};

// "#RRGGBB" + alpha -> "rgba(r,g,b,a)", for glows and translucency.
export const withAlpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);

  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// Roles for a dark (navy) video stage, built only from the palette.
export const ON_DARK = {
  bg: LIGHT.blue[7], // #0E233F, the deepest brand navy
  surface: LIGHT.blue[6], // #122F54, cards and panels
  raised: LIGHT.blue[5], // #183D6D, brand navy, for a lifted or active surface
  text: LIGHT.blue[0], // #EEF4FE, pale blue ink for type and hairlines
  muted: DARK.grey[6], // #BFC6D0, secondary type
  brand: DARK.orange[5], // #FF784D, bunny orange
  green: DARK.green[5], // #33DA98
  blue: DARK.blue[5], // #6798F3
  yellow: DARK.yellow[5], // #FFB949
  red: DARK.red[5], // #E9776A
  // Shadows are always darker than the stage, never coloured: a coloured or
  // lighter shadow reads as a glow. This is a deep navy, below `bg`.
  shadow: "rgba(4,12,26,0.6)",
} as const;
