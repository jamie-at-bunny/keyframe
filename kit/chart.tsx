// The bunny.net dashboard chart look: a white card with a soft shadow, a title,
// a hairline divider, a row of stat blocks, light gridlines and 2px lines.
// Colours come from the light brand palette. Sizes are for a 1920x1080 stage
// (the dashboard's own sizes scaled by ~1.7 so they read at half size).
import { FONT, LIGHT, ON_DARK, RADIUS } from "./tokens";

export const CHART = {
  card: "#FFFFFF",
  shadow: `0 1px 3px rgba(12,12,12,0.10), 0 1px 2px -1px rgba(12,12,12,0.10), 0 28px 70px ${ON_DARK.shadow}`,
  pad: 52,
  title: LIGHT.blue[7], // #0E233F
  divider: LIGHT.grey[1], // #E6E9EC
  grid: LIGHT.grey[1], // #E6E9EC
  axis: LIGHT.grey[5], // #687A8B, tick labels
  label: LIGHT.grey[6], // #364E65, stat labels and values
  line: 3, // series stroke width
  // Default series order, as on the dashboard.
  series: [LIGHT.blue[4], LIGHT.green[5], LIGHT.grey[2]],
  // Tag pills: neutral, up (good), down (bad).
  tag: {
    neutral: { bg: LIGHT.grey[0], fg: LIGHT.grey[5] },
    up: { bg: LIGHT.green[0], fg: LIGHT.green[5] },
    down: { bg: LIGHT.red[0], fg: LIGHT.red[5] },
  },
} as const;

// White chart card at an absolute position on the stage.
export const ChartCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, w, h, title, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: CHART.card,
      borderRadius: RADIUS.md,
      boxShadow: CHART.shadow,
      overflow: "hidden",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: CHART.pad, top: 40, color: CHART.title, fontSize: 32, fontWeight: 600 }}>
      {title}
    </div>
    <div
      style={{
        position: "absolute",
        left: CHART.pad,
        right: CHART.pad,
        top: 104,
        height: 2,
        background: CHART.divider,
      }}
    />
    {children}
  </div>
);

// Small rounded tag beside a stat value.
export const ChartTag: React.FC<{ tone?: keyof typeof CHART.tag; children: React.ReactNode }> = ({
  tone = "neutral",
  children,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: 34,
      padding: "0 12px",
      borderRadius: RADIUS.sm,
      background: CHART.tag[tone].bg,
      color: CHART.tag[tone].fg,
      fontSize: 22,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

// A stat block: coloured key, label, then a big value with an optional tag.
// `ring` draws the key as an outline, for point markers rather than lines.
export const ChartStat: React.FC<{
  color: string;
  label: string;
  value: string;
  tag?: React.ReactNode;
  ring?: boolean;
  style?: React.CSSProperties;
}> = ({ color, label, value, tag, ring, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          width: 14,
          height: 14,
          boxSizing: "border-box",
          borderRadius: 999,
          background: ring ? "transparent" : color,
          border: ring ? `3px solid ${color}` : undefined,
        }}
      />
      <span style={{ color: CHART.label, fontSize: 24, fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span
        style={{
          color: CHART.label,
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      {tag}
    </div>
  </div>
);
