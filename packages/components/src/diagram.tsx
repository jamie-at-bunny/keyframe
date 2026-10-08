// Pieces for diagram scenes: a full-frame SVG layer for rails and marks,
// centred captions and labels, and the bunny.net edge node requests flow through.
import { asset, Img } from "@keyframe/engine/assets";
import { useFrame, useVideo } from "@keyframe/engine/time";
import { BG, BRAND, brandA, enter, FONT, INK, MUTED, pop, RADIUS, SHADOW } from "@keyframe/kit";
import { Pill } from "./Card";

// Full-frame SVG layer for rails, arcs and chart marks, in stage pixels.
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideo();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0 }}
      fontFamily={FONT}
    >
      {children}
    </svg>
  );
};

// Bold sentence caption, centred on the frame at `top`.
export const Headline: React.FC<{
  top: number;
  style: React.CSSProperties;
  size?: number;
  children: React.ReactNode;
}> = ({ top, style, size = 48, children }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      textAlign: "center",
      color: INK,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {children}
  </div>
);

// A highlighted run inside a Headline, usually the product in brand orange.
export const Hi: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ color }}>{children}</span>
);

// Plain text label centred on (x, y).
export const Label: React.FC<{
  x: number;
  y: number;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ x, y, style, size = 28, color = MUTED, children }) => (
  <div
    style={{
      position: "absolute",
      left: x - 600,
      top: y - size * 0.6,
      width: 1200,
      textAlign: "center",
      color,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.2,
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {children}
  </div>
);

// The bunny.net edge: the rabbit mark in an orange framed tile centred on
// (cx, cy), with a pill label beneath.
export const EdgeNode: React.FC<{
  cx: number;
  cy: number;
  at: number;
  size?: number;
  label?: string;
}> = ({ cx, cy, at, size = 150, label = "bunny.net edge" }) => {
  const frame = useFrame();
  const s = pop(frame, at);

  return (
    <>
      <div
        style={{
          opacity: Math.min(1, s * 1.4),
          transform: `scale(${0.7 + 0.3 * s})`,
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          boxSizing: "border-box",
          borderRadius: RADIUS.md,
          background: `linear-gradient(${brandA(0.1)}, ${brandA(0.1)}), ${BG}`,
          border: `1.5px solid ${BRAND}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: SHADOW,
        }}
      >
        <Img src={asset("bunny-rabbit.svg")} style={{ width: size * 0.57, height: size * 0.57 }} />
      </div>
      <Pill cx={cx} top={cy + size / 2 + 20} style={enter(frame, at + 6)}>
        {label}
      </Pill>
    </>
  );
};
