import { useFrame } from "@keyframe/engine/time";
import {
  BG,
  BRAND,
  brandA,
  enter,
  FONT,
  INK,
  inkA,
  MUTED,
  RADIUS,
  RAISED,
  SHADOW,
  SURFACE,
  withAlpha,
} from "@keyframe/kit";

// Steel card with an accent bar, centred on (cx, cy), springing in at `at`.
// `active` (0..1) fades the border to the accent for a highlighted card.
export const Card: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  accent: string;
  label: string;
  sub?: string;
  at: number;
  size?: number;
  active?: number;
}> = ({ cx, cy, w, h, accent, label, sub, at, size = 34, active = 0 }) => {
  const frame = useFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        boxSizing: "border-box",
        borderRadius: RADIUS.md,
        // opaque, so rails running into a card stop at its edge
        background: SURFACE,
        border: `1.5px solid ${active ? withAlpha(accent, 0.2 + 0.6 * active) : inkA(0.14)}`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        gap: 18,
        boxShadow: SHADOW,
        fontFamily: FONT,
        ...enter(frame, at),
      }}
    >
      <div style={{ width: 10, height: h - 36, borderRadius: RADIUS.xs, background: accent }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: INK, fontSize: size, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
          {label}
        </span>
        {sub && <span style={{ color: MUTED, fontSize: 24, fontWeight: 400 }}>{sub}</span>}
      </div>
    </div>
  );
};

// Small orange label, centred on cx.
export const Pill: React.FC<{ cx: number; top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  cx,
  top,
  style,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: cx - 300,
      top,
      width: 600,
      display: "flex",
      justifyContent: "center",
      ...style,
    }}
  >
    <span
      style={{
        color: BRAND,
        fontFamily: FONT,
        fontSize: 26,
        fontWeight: 600,
        background: `linear-gradient(${brandA(0.12)}, ${brandA(0.12)}), ${BG}`,
        border: `1px solid ${brandA(0.45)}`,
        borderRadius: RADIUS.sm,
        padding: "4px 18px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  </div>
);

// Legend or count chip with a dot (or a ring, for point markers), centred on (cx, cy).
export const Chip: React.FC<{
  cx: number;
  cy: number;
  accent: string;
  ring?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ cx, cy, accent, ring, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: cx - 600,
      top: cy - 30,
      width: 1200,
      height: 60,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "11px 24px",
        borderRadius: RADIUS.sm,
        background: withAlpha(RAISED, 0.8),
        border: `1px solid ${inkA(0.16)}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: ring ? 14 : 12,
          height: ring ? 14 : 12,
          boxSizing: "border-box",
          borderRadius: 999,
          background: ring ? "transparent" : accent,
          border: ring ? `2.5px solid ${accent}` : undefined,
        }}
      />
      <span style={{ color: INK, fontSize: 26, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{children}</span>
    </div>
  </div>
);
