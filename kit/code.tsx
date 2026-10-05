// A guided code walkthrough: the editor on the left, a highlight that glides
// from block to block, and commentary on the right that tracks it. Pass the
// code as coloured tokens and the steps as line ranges with copy.
import { lerp } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { enter, pop, progress, rise } from "./anim";
import { Stage } from "./Stage";
import { BRAND, FONT, INK, inkA, MONO, MUTED, ON_DARK, RADIUS } from "./tokens";
import { TITLE_BAR_H, TitleBar } from "./Window";

// ── Tokens ───────────────────────────────────────────────────────────────────
// Just enough structure to colour a snippet without a real highlighter.
export type TokRole = "kw" | "str" | "fn" | "punc" | "txt";
export type Tok = { x: string; c: TokRole };
export type CodeLine = { toks: Tok[] };

export const k = (x: string): Tok => ({ x, c: "kw" }); // import / new / return / async
export const s = (x: string): Tok => ({ x, c: "str" }); // strings
export const f = (x: string): Tok => ({ x, c: "fn" }); // calls / properties
export const p = (x: string): Tok => ({ x, c: "punc" });
export const t = (x: string): Tok => ({ x, c: "txt" });

// A step: which lines to light up, and what to say about them.
export type Step = { range: [number, number]; title: string; body: string };

// Syntax colours from the palette: orange keywords, green strings, blue calls.
export const SYNTAX: Record<TokRole, string> = {
  kw: BRAND,
  str: ON_DARK.green,
  fn: ON_DARK.blue,
  punc: inkA(0.55),
  txt: INK,
};

// ── Geometry and timing ──────────────────────────────────────────────────────
const PANEL_X = 96;
const CODE_PAD_TOP = 18;
const CODE_PAD_X = 34;
const PANEL_PAD_B = 22;
const TEXT_X = 1120;
const TEXT_W = 710;
// The commentary is centred on the highlight, so keep it inside the stage.
const TEXT_MIN_Y = 340;
const TEXT_MAX_Y = 800;
const DIM = 0.34;

const HEADER_AT = 2;
const PANEL_AT = 6;
export const START = 30; // first step
export const STEP_LEN = 52;
const TAIL = 18; // hold after the last step, before the fade

// Frames a walkthrough needs: the code landing, every step, then a short hold.
export const walkthroughDuration = (steps: number, stepLen: number = STEP_LEN) => START + steps * stepLen + TAIL;

export type CodeWalkthroughProps = {
  eyebrow: string; // product, in orange spaced caps
  title: string;
  subtitle: string;
  fileName: string;
  code: CodeLine[];
  steps: Step[];
  // Tuned per clip: longer snippets need tighter type.
  fontSize?: number;
  lineHeight?: number;
  panelWidth?: number;
  panelTop?: number;
  stepLen?: number;
};

export const CodeWalkthrough: React.FC<CodeWalkthroughProps> = ({
  eyebrow,
  title,
  subtitle,
  fileName,
  code,
  steps,
  fontSize = 26,
  lineHeight = 42,
  panelWidth = 900,
  panelTop = 280,
  stepLen = STEP_LEN,
}) => {
  const frame = useFrame();

  const topOf = (r: readonly [number, number]) => r[0] * lineHeight;
  const heightOf = (r: readonly [number, number]) => (r[1] - r[0] + 1) * lineHeight;
  const codeTop = TITLE_BAR_H + CODE_PAD_TOP;
  const panelHeight = codeTop + code.length * lineHeight + PANEL_PAD_B;

  const panelIn = pop(frame, PANEL_AT);

  // No steps: the code sits fully lit with no highlight or commentary.
  const idx = Math.max(0, Math.min(steps.length - 1, Math.floor((frame - START) / stepLen)));
  const step = steps[idx];
  const stepAt = START + idx * stepLen;
  const slideT = progress(frame, stepAt, 14);

  const cur = step?.range ?? ([0, code.length - 1] as const);
  const prev = steps[Math.max(0, idx - 1)]?.range ?? cur;

  const hlTop = lerp(topOf(prev), topOf(cur), slideT);
  const hlH = lerp(heightOf(prev), heightOf(cur), slideT);
  // Vertical centre of the highlight on screen; the commentary tracks it.
  const hlCenter = panelTop + codeTop + hlTop + hlH / 2;
  const textY = Math.max(TEXT_MIN_Y, Math.min(TEXT_MAX_Y, hlCenter));

  // Each step's commentary springs in from just above, following the code's top-down flow.
  const textT = pop(frame, stepAt);

  return (
    <Stage logo>
      {/* header, top left */}
      <div style={{ position: "absolute", left: PANEL_X, top: 92, fontFamily: FONT, ...enter(frame, HEADER_AT, 14) }}>
        <div
          style={{ color: BRAND, fontSize: 24, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase" }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: INK,
            fontSize: 58,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            marginTop: 10,
          }}
        >
          {title}
        </div>
        <div style={{ color: MUTED, fontSize: 24, fontWeight: 500, marginTop: 6 }}>{subtitle}</div>
      </div>

      {/* the editor */}
      <div
        style={{
          position: "absolute",
          left: PANEL_X,
          top: panelTop,
          width: panelWidth,
          height: panelHeight,
          borderRadius: RADIUS.md,
          background: ON_DARK.surface,
          border: `1px solid ${inkA(0.12)}`,
          boxShadow: `0 30px 70px ${ON_DARK.shadow}`,
          overflow: "hidden",
          ...rise(panelIn, 24, 0.98),
          transformOrigin: "center top",
        }}
      >
        <TitleBar title={fileName} />

        <div style={{ position: "absolute", left: CODE_PAD_X, right: CODE_PAD_X, top: codeTop }}>
          <div style={{ position: "relative" }}>
            {step && (
              <div
                style={{
                  position: "absolute",
                  left: -16,
                  right: -12,
                  top: hlTop,
                  height: hlH,
                  borderRadius: RADIUS.sm,
                  background: ON_DARK.raised,
                }}
              >
                {/* orange accent bar marking the block in focus */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 4,
                    borderRadius: RADIUS.xs,
                    background: BRAND,
                  }}
                />
              </div>
            )}
            {code.map((line, i) => {
              const now = i >= cur[0] && i <= cur[1];
              const before = i >= prev[0] && i <= prev[1];
              const op = now && before ? 1 : now ? lerp(DIM, 1, slideT) : before ? lerp(1, DIM, slideT) : DIM;

              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    height: lineHeight,
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "pre",
                    fontFamily: MONO,
                    fontSize,
                    lineHeight: 1,
                    opacity: op,
                  }}
                >
                  {line.toks.map((tk, j) => (
                    <span key={j} style={{ color: SYNTAX[tk.c] }}>
                      {tk.x}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* commentary, synced to the highlighted block */}
      {step && (
        <div
          style={{
            position: "absolute",
            left: TEXT_X,
            width: TEXT_W,
            top: textY,
            fontFamily: FONT,
            opacity: Math.min(1, textT * 1.4) * Math.min(1, panelIn * 1.4),
            transform: `translateY(calc(-50% + ${(textT - 1) * 16}px))`,
          }}
        >
          <div style={{ color: INK, fontSize: 46, fontWeight: 700, lineHeight: 1.1 }}>{step.title}</div>
          <div style={{ color: MUTED, fontSize: 28, fontWeight: 400, lineHeight: 1.5, marginTop: 20 }}>{step.body}</div>
        </div>
      )}
    </Stage>
  );
};
