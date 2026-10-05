// A terminal for CLI videos: rows that appear on cue and get redrawn away the
// way prompt libraries and spinners replace their own line, smooth inserts and
// scroll, and per-row brightness so the scene can dim everything but the lines
// in use. StreamImport is the worked example.
import { useFrame } from "@keyframe/engine/time";
import { pop, progress } from "./anim";
import { BRAND, INK, inkA, MONO, ON_DARK, RADIUS, withAlpha } from "./tokens";
import { TITLE_BAR_H, TitleBar } from "./Window";

// ── Text ─────────────────────────────────────────────────────────────────────
// chalk colours mapped onto the brand palette. Cyan has no brand hue, so it
// takes brand blue.
export const TERM_COLOR = { ink: INK, brand: BRAND, green: ON_DARK.green, cyan: ON_DARK.blue, gray: inkA(0.5) };
const C = TERM_COLOR;

export type Seg = { text: string; color?: string; bold?: boolean; underline?: boolean };
export const s = (text: string, color: string = C.ink, bold = false): Seg => ({ text, color, bold });

export const Segs: React.FC<{ segs: Seg[] }> = ({ segs }) => (
  <>
    {segs.map((g, i) => (
      <span
        key={i}
        style={{
          color: g.color,
          fontWeight: g.bold ? 700 : 400,
          textDecoration: g.underline ? "underline" : undefined,
        }}
      >
        {g.text}
      </span>
    ))}
  </>
);

// Caret: solid while input is arriving, blinking while it waits.
export const Caret: React.FC<{ busy: boolean }> = ({ busy }) => {
  const frame = useFrame();

  return busy || Math.floor(frame / 15) % 2 === 0 ? (
    <span
      style={{ display: "inline-block", width: 13, height: 28, background: INK, marginLeft: 2, verticalAlign: -6 }}
    />
  ) : null;
};

// Human typing: two frames a character, a beat longer after a space.
export const typing = (text: string, start: number, { perChar = 2, afterSpace = 5 } = {}) => {
  const at: number[] = [];
  let t = start;
  for (const ch of text) {
    at.push(t);
    t += ch === " " ? afterSpace : perChar;
  }

  return at;
};

// The `prompts` library's question states.
export const ask = (message: string, tail: Seg[] = []): Seg[] => [
  s("? ", C.cyan, true),
  s(message, C.ink, true),
  s(" › ", C.gray),
  ...tail,
];
export const answered = (message: string, sep: "›" | "…", value: string): Seg[] => [
  s("✔ ", C.green),
  s(message, C.ink, true),
  s(` ${sep} `, C.gray),
  s(value),
];

// ora's "dots" spinner at 80ms a frame.
const DOTS = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
export const spinner = (text: string) => (frame: number, from: number) => (
  <Segs segs={[s(`${DOTS[Math.floor(Math.max(0, frame - from) / 2.4) % DOTS.length]} `, C.cyan), s(text)]} />
);

// cli-table3 "text" style: borderless, one space of left padding, two between columns.
export const table = (rows: [string, string][], head: [string, string] = ["Key", "Value"]) => {
  const w = Math.max(...rows.map(([k]) => k.length), head[0].length);
  const line = (k: string, v: string, isHead = false): Seg[] =>
    isHead ? [s(` ${k.padEnd(w)}  `, C.brand, true), s(v, C.brand, true)] : [s(` ${k.padEnd(w)}  `), s(v)];

  return [line(head[0], head[1], true), ...rows.map(([k, v]) => line(k, v))];
};

// 20 cells of █ and ░.
export const bar = (fraction: number, cells = 20) => {
  const filled = Math.round(fraction * cells);

  return "█".repeat(filled) + "░".repeat(cells - filled);
};

// An arrow-key picker whose highlight springs from choice to choice.
export const Select: React.FC<{
  message: string;
  choices: string[];
  moves: readonly number[];
  pick: number;
  width?: number;
}> = ({ message, choices, moves, pick, width = 520 }) => {
  const frame = useFrame();
  let y = 0;
  let index = 0;
  moves.forEach((at, i) => {
    if (frame >= at) index = i + 1;
    y += pop(frame, at, { dur: 14 });
  });
  const press = Math.sin(Math.PI * progress(frame, pick - 6, 8));

  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: TERM.line, display: "flex", alignItems: "center" }}>
        <Segs segs={ask(message, [s("- Use arrow-keys. Return to submit.", C.gray)])} />
      </div>
      <div
        style={{
          position: "absolute",
          left: -12,
          top: TERM.line * (1 + y) + 3,
          width,
          height: TERM.line - 6,
          borderRadius: RADIUS.sm,
          background: withAlpha(C.cyan, 0.16 + 0.12 * press),
          transform: `scale(${1 - 0.03 * press})`,
          transformOrigin: "left center",
        }}
      />
      {choices.map((c, i) => (
        <div key={c} style={{ position: "relative", height: TERM.line, display: "flex", alignItems: "center" }}>
          {i === index ? (
            <Segs segs={[s("❯ ", C.cyan), { text: c, color: C.cyan, underline: true }]} />
          ) : (
            <Segs segs={[s("  "), s(c)]} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Rows ─────────────────────────────────────────────────────────────────────
// A row appears at `from` (growing in); an `until` row is redrawn away. `group`
// is what the camera frames and what stays lit while the rest dims.
export type Row = {
  key: string;
  from: number;
  until?: number;
  lines?: number;
  group: string;
  render: (frame: number, from: number) => React.ReactNode;
};

export const line = (segs: Seg[]) => () => <Segs segs={segs} />;

// Panel geometry, in panel pixels (a camera scales the whole panel).
export const TERM = {
  width: 1560,
  height: 800,
  bar: TITLE_BAR_H,
  padX: 40,
  padTop: 22,
  line: 40,
  fontSize: 24,
} as const;
const BODY_H = TERM.height - TERM.bar - TERM.padTop - 26;

export type Placed = { row: Row; y: number; h: number; opacity: number };

// Each row's share of its height grows in over 6 frames and collapses the same
// way, so summing them gives smooth inserts and smooth scroll.
const presence = (frame: number, r: Row) =>
  progress(frame, r.from, 6) * (r.until === undefined ? 1 : 1 - progress(frame, r.until, 6));

export const layout = (rows: Row[], frame: number) => {
  let y = 0;
  const placed: Placed[] = [];
  for (const row of rows) {
    if (frame < row.from || (row.until !== undefined && frame >= row.until + 6)) continue;
    const h = (row.lines ?? 1) * TERM.line * presence(frame, row);
    const opacity = progress(frame, row.from, 8) * (row.until === undefined ? 1 : 1 - progress(frame, row.until, 4));
    placed.push({ row, y, h, opacity });
    y += h;
  }

  return { placed, scroll: Math.max(0, y - BODY_H), total: y, bodyH: BODY_H };
};

// Vertical span of a group's rows in panel coordinates, after scroll. "tail"
// is the last three lines of content; a group with no rows yet sits where its
// first row will appear. Both move continuously.
export const groupBox = (rows: Row[], frame: number, group: string) => {
  const { placed, scroll, total } = layout(rows, frame);
  const offset = TERM.bar + TERM.padTop - scroll;
  const mine = placed.filter((p) => p.row.group === group);
  if (group === "tail" || mine.length === 0) {
    const span = group === "tail" ? 3 * TERM.line : TERM.line;

    return { top: offset + total - span, bottom: offset + total };
  }

  return { top: offset + Math.min(...mine.map((p) => p.y)), bottom: offset + Math.max(...mine.map((p) => p.y + p.h)) };
};

// Where a camera aims for a group: the centre of its box averaged over the
// last few frames, so framing glides after a block unfolds.
export const groupFocus = (rows: Row[], frame: number, group: string, settle = 10) => {
  let sum = 0;
  for (let k = 0; k < settle; k++) {
    const b = groupBox(rows, Math.max(0, frame - k), group);
    sum += (b.top + b.bottom) / 2;
  }

  return sum / settle;
};

// ── The panel ────────────────────────────────────────────────────────────────
// `lit(placed, y)` gives each row's brightness, so the scene decides what dims.
export const Terminal: React.FC<{ rows: Row[]; title?: string; lit?: (p: Placed, y: number) => number }> = ({
  rows,
  title = "~",
  lit = () => 1,
}) => {
  const frame = useFrame();
  const { placed, scroll } = layout(rows, frame);

  return (
    <div
      style={{
        width: TERM.width,
        height: TERM.height,
        borderRadius: RADIUS.md,
        background: ON_DARK.surface,
        border: `1px solid ${inkA(0.12)}`,
        boxShadow: `0 30px 70px ${ON_DARK.shadow}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <TitleBar title={title} />

      <div
        style={{ position: "absolute", left: 0, right: 0, top: TERM.bar + TERM.padTop, bottom: 0, overflow: "hidden" }}
      >
        {placed.map((p) => {
          const y = p.y - scroll;
          if (y + p.h < -TERM.line || y > BODY_H + TERM.line) return null;

          return (
            <div
              key={p.row.key}
              style={{
                position: "absolute",
                top: y,
                // block rows get a gutter so a selection highlight is not clipped
                left: p.row.lines ? TERM.padX - 16 : TERM.padX,
                paddingLeft: p.row.lines ? 16 : 0,
                right: TERM.padX,
                height: p.h,
                // the slot grows while the line inside stays full height, so a
                // new line slides up into view instead of squashing its neighbours
                overflow: "hidden",
                display: "flex",
                alignItems: p.row.lines ? "flex-start" : "flex-end",
                whiteSpace: "pre",
                fontFamily: MONO,
                fontSize: TERM.fontSize,
                lineHeight: 1,
                opacity: p.opacity * lit(p, y),
              }}
            >
              {p.row.lines ? (
                p.row.render(frame, p.row.from)
              ) : (
                <div style={{ height: TERM.line, flex: "none", display: "flex", alignItems: "center" }}>
                  {p.row.render(frame, p.row.from)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
