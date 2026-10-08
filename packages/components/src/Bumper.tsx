// The bumper: the bunny.net wordmark dead centre, the product name at the
// foot, and an optional product logo beside or above the name. Make one with
// bumper() below, or override any prop at render time with --props.
import { asset, Img } from "@keyframe/engine/assets";
import { cue } from "@keyframe/engine/audio";
import { defineVideo, useFrame, type Video } from "@keyframe/engine/time";
import type { ProductName } from "@keyframe/kit";
import { BG, enter, FONT, INK, LIGHT, pop, rise, STAGE } from "@keyframe/kit";
import { REVEAL } from "@keyframe/kit/sfx";
import { BunnyLogo, type LogoVariant } from "./brand";
import { Stage } from "./Stage";

export type BumperTheme = "navy" | "light" | "green";

export type BumperProps = {
  product?: ProductName; // PRODUCTS.stream etc.; leave out for the wordmark alone
  productLogo?: string; // a file in public/, e.g. "products/stream.svg"
  logoPlacement?: keyof typeof PLACEMENT; // beside the name, or stacked above it
  productLogoSize?: number; // height in px of the product logo
  theme?: BumperTheme;
};

// navy is the house stage; light for light edits; green is a chroma key for
// keying the card over footage (not a brand colour, so it lives only here).
const THEMES: Record<BumperTheme, { bg: string; text: string; logo: LogoVariant }> = {
  navy: { bg: BG, text: INK, logo: "light" },
  light: { bg: LIGHT.blue[0], text: LIGHT.blue[7], logo: "dark" },
  green: { bg: "#00B140", text: LIGHT.blue[7], logo: "dark" },
};

// How the product lockup sits for each logo placement.
const PLACEMENT = {
  before: { direction: "row", gap: 24, bottom: 112, logoSize: 76 },
  above: { direction: "column", gap: 26, bottom: 96, logoSize: 120 },
} as const;

// Beats, in frames.
// `lands` is when the wordmark's spring first reaches full size (it then
// overshoots a touch and settles by frame 28).
export const BUMPER = { logo: 4, lands: 14, productLogo: 16, product: 20, end: 150 } as const;

export const Bumper: React.FC<BumperProps> = ({
  product,
  productLogo,
  logoPlacement = "before",
  productLogoSize,
  theme = "navy",
}) => {
  const frame = useFrame();
  const t = THEMES[theme];
  const place = PLACEMENT[logoPlacement];
  const hasFoot = Boolean(product || productLogo);

  return (
    <Stage background={t.bg}>
      {/* the wordmark, dead centre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...rise(pop(frame, BUMPER.logo)),
        }}
      >
        <BunnyLogo variant={t.logo} width={560} />
      </div>

      {/* the product lockup at the foot */}
      {hasFoot && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: place.bottom,
            display: "flex",
            flexDirection: place.direction,
            alignItems: "center",
            justifyContent: "center",
            gap: place.gap,
            fontFamily: FONT,
          }}
        >
          {productLogo && (
            <div style={enter(frame, BUMPER.productLogo, 16)}>
              <Img
                src={asset(productLogo)}
                style={{ height: productLogoSize ?? place.logoSize, width: "auto", maxWidth: "none" }}
              />
            </div>
          )}
          {product && (
            <div
              style={{
                color: t.text,
                fontSize: 56,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                ...enter(frame, BUMPER.product, 16),
              }}
            >
              {product}
            </div>
          )}
        </div>
      )}
    </Stage>
  );
};

// A bumper as a ready video, with one sound: a swell of air that peaks as the
// wordmark lands. The product arrives in silence. Pass `sound: false` for a
// silent card.
export const bumper = ({
  id,
  durationInFrames = BUMPER.end,
  sound = true,
  ...props
}: BumperProps & { id: string; durationInFrames?: number; sound?: boolean }): Video =>
  defineVideo({
    id,
    ...STAGE,
    durationInFrames,
    background: THEMES[props.theme ?? "navy"].bg,
    Component: Bumper as React.FC,
    props,
    // REVEAL peaks 12 frames (0.4s) after it starts; start it so the peak
    // lands with the wordmark.
    sound: sound ? [cue(BUMPER.lands - 12, REVEAL, 0.34)] : [],
  });
