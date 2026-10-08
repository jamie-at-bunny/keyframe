import { Headline } from "@keyframe/components";
import { interpolateColors } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { enter, INK, inkA, MONO, MUTED, progress, RADIUS, SHADOW, SURFACE, withAlpha } from "@keyframe/kit";
import { AgentStage, type Chrome, HTML, MD } from "../kit";

// No Accept header? The Markdown lives at its own URL. The suffix depends on
// whether the page path ends with a slash.
const HOST = "https://acme.b-cdn.net";
const ROWS = [
  { path: "/docs/", suffix: "index.md", y: 510, at: 14, typeAt: 50 },
  { path: "/about", suffix: ".index.md", y: 670, at: 20, typeAt: 90 },
];
const TYPE_SPEED = 0.5; // characters per frame
const ROW = { x: 300, w: 1320, h: 112 };

const Tag: React.FC<{ label: string; color: string; style: React.CSSProperties }> = ({ label, color, style }) => (
  <span
    style={{
      position: "absolute",
      right: 28,
      top: "50%",
      marginTop: -22,
      height: 44,
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      borderRadius: RADIUS.sm,
      background: withAlpha(color, 0.14),
      border: `1px solid ${withAlpha(color, 0.5)}`,
      color,
      fontSize: 24,
      fontWeight: 600,
      ...style,
    }}
  >
    {label}
  </span>
);

const UrlRow: React.FC<(typeof ROWS)[number]> = ({ path, suffix, y, at, typeAt }) => {
  const frame = useFrame();
  const chars = Math.min(suffix.length, Math.max(0, Math.floor((frame - typeAt) * TYPE_SPEED)));
  const typing = frame >= typeAt && chars < suffix.length;
  const done = typeAt + suffix.length / TYPE_SPEED;
  const swap = progress(frame, done + 2, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: ROW.x,
        top: y - ROW.h / 2,
        width: ROW.w,
        height: ROW.h,
        boxSizing: "border-box",
        borderRadius: RADIUS.md,
        background: SURFACE,
        border: `1.5px solid ${interpolateColors(swap, [0, 1], [inkA(0.14), withAlpha(MD, 0.6)])}`,
        boxShadow: SHADOW,
        display: "flex",
        alignItems: "center",
        paddingLeft: 36,
        fontFamily: MONO,
        fontSize: 40,
        whiteSpace: "pre",
        ...enter(frame, at),
      }}
    >
      <span style={{ color: MUTED }}>{HOST}</span>
      <span style={{ color: INK, fontWeight: 500 }}>{path}</span>
      <span style={{ color: MD, fontWeight: 700 }}>{suffix.slice(0, chars)}</span>
      {typing && <span style={{ width: 4, height: 46, background: MD, marginLeft: 2 }} />}
      <Tag label="HTML" color={HTML} style={{ opacity: 1 - swap }} />
      <Tag label="Markdown" color={MD} style={{ opacity: swap, transform: `scale(${0.85 + 0.15 * swap})` }} />
    </div>
  );
};

export const MarkdownUrls: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();
  return (
    <AgentStage {...chrome}>
      <Headline top={330} size={56} style={enter(frame, 4)}>
        Markdown at its own URL
      </Headline>
      {ROWS.map((r) => (
        <UrlRow key={r.path} {...r} />
      ))}
    </AgentStage>
  );
};
