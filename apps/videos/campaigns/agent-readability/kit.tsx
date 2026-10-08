// Shared pieces for the Agent Readability clips: the campaign stage, the
// zone colours, a steel panel, a Markdown line renderer and placeholder bars.
import { Stage } from "@keyframe/components";
import { BRAND, FAINT, INK, inkA, MONO, ON_DARK, PRODUCTS, RADIUS, SHADOW, SURFACE, withAlpha } from "@keyframe/kit";

// Blue is the HTML page humans get; orange is the Markdown agents get. The two
// hold across every clip, so a viewer learns them once.
export const HTML = ON_DARK.blue;
export const MD = BRAND;
export const KEPT = ON_DARK.green;
export const CUT = ON_DARK.red;
export const PENDING = ON_DARK.yellow;

// The eyebrow and wordmark are off unless asked for (--props), like Burrow:
// the final edit usually brings its own titles.
export type Chrome = { showTitle?: boolean; showLogo?: boolean };

export const CHROME: Required<Chrome> = { showTitle: false, showLogo: false };

// Navy stage with a 20 frame fade in and a 30 frame fade out.
export const AgentStage: React.FC<Chrome & { children: React.ReactNode }> = ({ showTitle, showLogo, children }) => (
  <Stage eyebrow={showTitle ? PRODUCTS.agentReadability : undefined} logo={showLogo} fadeIn={20} fadeOut={30}>
    {children}
  </Stage>
);

// Steel panel with a mono tag in its header, e.g. "text/markdown".
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tag: string;
  accent: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, tag, accent, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: "border-box",
      borderRadius: RADIUS.md,
      background: SURFACE,
      border: `1.5px solid ${inkA(0.14)}`,
      boxShadow: SHADOW,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingLeft: 24,
        borderBottom: `1px solid ${inkA(0.1)}`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 24,
          borderRadius: RADIUS.xs,
          background: accent,
        }}
      />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 22,
          fontWeight: 500,
          color: accent,
        }}
      >
        {tag}
      </span>
    </div>
    {children}
  </div>
);

// ── Markdown syntax colouring ────────────────────────────────────────────────
// Markers (#, -, >, pipes, brackets) in orange or faint ink, headings bold,
// link targets in blue. Enough for the handful of lines the clips show.
type Tok = { s: string; color: string; weight?: number };

const BODY = inkA(0.78);

const inline = (text: string, base = BODY): Tok[] => {
  const out: Tok[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ s: text.slice(last, m.index), color: base });
    out.push({ s: "[", color: FAINT }, { s: m[1], color: INK, weight: 500 }, { s: "](", color: FAINT });
    out.push({ s: m[2], color: HTML }, { s: ")", color: FAINT });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ s: text.slice(last), color: base });
  return out;
};

const tokenize = (line: string, code: boolean): Tok[] => {
  if (code) return line.startsWith("```") ? [{ s: line, color: FAINT }] : [{ s: line, color: INK }];
  let m = line.match(/^(#+ )(.*)$/);
  if (m)
    return [
      { s: m[1], color: MD, weight: 700 },
      { s: m[2], color: INK, weight: 700 },
    ];
  m = line.match(/^(> )(.*)$/);
  if (m) return [{ s: m[1], color: MD }, ...inline(m[2], BODY)];
  m = line.match(/^(- )(.*)$/);
  if (m) return [{ s: m[1], color: MD, weight: 700 }, ...inline(m[2])];
  if (line.startsWith("|")) {
    return line
      .split(/(\|)/)
      .filter(Boolean)
      .map((s) => ({
        s,
        color: s === "|" || /^[\s-]+$/.test(s) ? FAINT : INK,
      }));
  }
  return inline(line);
};

// One line of Markdown. `chars` reveals it a character at a time for typing.
export const MdLine: React.FC<{
  text: string;
  code?: boolean;
  chars?: number;
  size?: number;
  height?: number;
}> = ({ text, code = false, chars = Infinity, size = 22, height = 34 }) => {
  let left = chars;
  return (
    <div
      style={{
        height,
        display: "flex",
        alignItems: "center",
        whiteSpace: "pre",
        fontFamily: MONO,
        fontSize: size,
      }}
    >
      {tokenize(text, code).map((t, i) => {
        if (left <= 0) return null;
        const s = t.s.slice(0, left);
        left -= t.s.length;
        return (
          <span key={i} style={{ color: t.color, fontWeight: t.weight ?? 400 }}>
            {s}
          </span>
        );
      })}
    </div>
  );
};

// A grey placeholder bar, the stand-in for rendered page content.
export const Bar: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  a?: number;
  color?: string;
}> = ({ x, y, w, h, a = 0.16, color = INK }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: RADIUS.xs,
      background: withAlpha(color, a),
    }}
  />
);
