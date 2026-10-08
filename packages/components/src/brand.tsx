import { asset, Img } from "@keyframe/engine/assets";

// Brand artwork in public/, named in one place.
// light = white wordmark for dark stages, dark = navy wordmark for light ones.
const LOGO = { light: "bunny-logo.svg", dark: "bunny-logo-dark.svg" } as const;
export type LogoVariant = keyof typeof LOGO;

export const BunnyLogo: React.FC<{ variant?: LogoVariant; width?: number; style?: React.CSSProperties }> = ({
  variant = "light",
  width = 220,
  style,
}) => <Img src={asset(LOGO[variant])} style={{ width, display: "block", ...style }} />;

export const MASCOT_RATIO = 470 / 552;

// Pass whichever dimension anchors the layout; the other follows the artwork.
export const ShieldMascot: React.FC<{ width?: number; height?: number; style?: React.CSSProperties }> = ({
  width,
  height,
  style,
}) => {
  const w = width ?? (height ?? 0) * MASCOT_RATIO;
  const h = height ?? (width ?? 0) / MASCOT_RATIO;

  return <Img src={asset("shield-mascot.svg")} style={{ width: w, height: h, ...style }} />;
};
