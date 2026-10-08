// Illustrations and device frames. <Illustration> draws the art alone;
// <Device> draws a frame with live content in its screen, so a terminal, a site
// or a player can sit inside a laptop and move with it.
import { Img } from "@keyframe/engine/assets";
import type { CSSProperties, ReactNode } from "react";
import { ILLUSTRATIONS, type Screen } from "./catalogue";

export type IllustrationName = keyof typeof ILLUSTRATIONS;
export type DeviceName = {
  [K in IllustrationName]: (typeof ILLUSTRATIONS)[K] extends { screen: Screen } ? K : never;
}[IllustrationName];

type Props = { name: IllustrationName; width: number; style?: CSSProperties };

export const illustrationHeight = (name: IllustrationName, width: number) => {
  const art = ILLUSTRATIONS[name];

  return (width * art.height) / art.width;
};

// The screen in px at a given frame width, for laying out what goes inside.
export const screenBox = (name: DeviceName, width: number) => {
  const art = ILLUSTRATIONS[name];
  const k = width / art.width;

  return { x: art.screen.x * k, y: art.screen.y * k, width: art.screen.w * k, height: art.screen.h * k };
};

export const Illustration: React.FC<Props> = ({ name, width, style }) => (
  <Img
    src={ILLUSTRATIONS[name].src}
    style={{ display: "block", width, height: illustrationHeight(name, width), ...style }}
  />
);

// Screens run half a unit under the bezel, so anti-aliasing at the measured
// edge never lets the drawn glass show through.
const BLEED = 0.5;

const bled = (s: Screen): Screen =>
  s.d ? s : { ...s, x: s.x - BLEED, y: s.y - BLEED, w: s.w + 2 * BLEED, h: s.h + 2 * BLEED };

// The clip for a screen, in viewBox units on a layer the size of the art.
const clip = (s: Screen, w: number, h: number) =>
  s.d ? `path("${s.d}")` : `inset(${s.y}px ${w - s.x - s.w}px ${h - s.y - s.h}px ${s.x}px round ${s.r ?? 0}px)`;

export const Device: React.FC<Props & { name: DeviceName; screenBackground?: string; children?: ReactNode }> = ({
  name,
  width,
  style,
  screenBackground,
  children,
}) => {
  const art = ILLUSTRATIONS[name];
  const s = bled(art.screen);
  const k = width / art.width;

  // The art and the clip are laid out in viewBox units and scaled as one, so
  // the clip outline always matches the drawn glass. The content box undoes
  // the scale, so children lay out in real px at the screen's size.
  return (
    <div style={{ position: "relative", width, height: art.height * k, ...style }}>
      <div
        style={{
          position: "absolute",
          width: art.width,
          height: art.height,
          transform: `scale(${k})`,
          transformOrigin: "0 0",
        }}
      >
        <Img src={art.src} style={{ display: "block", width: art.width, height: art.height }} />
        <div style={{ position: "absolute", inset: 0, clipPath: clip(s, art.width, art.height) }}>
          <div
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w * k,
              height: s.h * k,
              transform: `scale(${1 / k})`,
              transformOrigin: "0 0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: screenBackground,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
