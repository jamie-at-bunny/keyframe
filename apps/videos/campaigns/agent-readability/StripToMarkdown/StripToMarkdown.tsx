import { interpolate, interpolateColors } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { enter, inkA, MONO, progress, RADIUS, withAlpha } from "@keyframe/kit";
import { AgentStage, Bar, type Chrome, CUT, HTML, MD, MdLine, Panel } from "../kit";
import { T } from "./data";

// The conversion: navigation, sidebars, forms and footers fall away, and the
// content that is left flies across as clean Markdown.
const PAGE = { x: 140, y: 180, w: 720, h: 760 };
const DOC = { x: 1060, y: 180, w: 720, h: 760 };
const LINE = 34;
const PAD = 36; // text inset inside the Markdown panel

type Rect = { x: number; y: number; w: number; h: number };

// Boilerplate, tagged with the element it came from. Coordinates are page local.
const CUTS: Array<Rect & { tag: string }> = [
  { tag: "<nav>", x: 0, y: 68, w: 720, h: 56 },
  { tag: "<aside>", x: 24, y: 144, w: 156, h: 480 },
  { tag: "<form>", x: 204, y: 596, w: 492, h: 44 },
  { tag: "<footer>", x: 0, y: 664, w: 720, h: 96 },
];

// Content that survives, and the Markdown each block becomes.
const KEEPS: Array<Rect & { top: number; lines: string[]; code?: boolean }> = [
  { x: 204, y: 144, w: 280, h: 32, top: 72, lines: ["# Getting started"] },
  {
    x: 204,
    y: 196,
    w: 492,
    h: 56,
    top: 118,
    lines: ["Install the SDK and send your first", "request through the Pull Zone."],
  },
  {
    x: 204,
    y: 272,
    w: 340,
    h: 76,
    top: 200,
    lines: ["- Create a Pull Zone", "- Enable Bunny Optimizer", "- Turn on Markdown for AI agents"],
  },
  {
    x: 204,
    y: 368,
    w: 492,
    h: 92,
    top: 318,
    code: true,
    lines: ["```bash", 'curl -H "Accept: text/markdown" \\', "  https://acme.b-cdn.net/docs/", "```"],
  },
  {
    x: 204,
    y: 480,
    w: 492,
    h: 96,
    top: 470,
    lines: [
      "| Page    | Markdown         |",
      "| ------- | ---------------- |",
      "| /docs/  | /docs/index.md   |",
      "| /about  | /about.index.md  |",
    ],
  },
];

// What each surviving block looks like on the rendered page.
const KeepArt: React.FC<{ i: number; r: Rect }> = ({ i, r }) => {
  if (i === 0) return <Bar x={0} y={0} w={r.w} h={r.h} a={0.34} />;
  if (i === 1)
    return (
      <>
        <Bar x={0} y={4} w={r.w} h={12} />
        <Bar x={0} y={24} w={r.w - 60} h={12} />
        <Bar x={0} y={44} w={r.w - 160} h={12} />
      </>
    );
  if (i === 2)
    return (
      <>
        {[0, 1, 2].map((k) => (
          <div key={k}>
            <Bar x={0} y={k * 28 + 2} w={10} h={10} a={0.4} />
            <Bar x={22} y={k * 28} w={r.w - 60 - k * 40} h={12} />
          </div>
        ))}
      </>
    );
  if (i === 3)
    return (
      <>
        <Bar x={0} y={0} w={r.w} h={r.h} a={0.07} />
        <Bar x={20} y={22} w={300} h={12} color={HTML} a={0.4} />
        <Bar x={40} y={50} w={240} h={12} a={0.22} />
      </>
    );
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: RADIUS.xs,
          border: `1px solid ${inkA(0.2)}`,
          background: `linear-gradient(${inkA(0.2)}, ${inkA(0.2)}) 0 32px / 100% 1px no-repeat, linear-gradient(${inkA(0.2)}, ${inkA(0.2)}) 50% 0 / 1px 100% no-repeat`,
        }}
      />
      <Bar x={16} y={10} w={120} h={12} a={0.34} />
      <Bar x={262} y={10} w={120} h={12} a={0.34} />
      <Bar x={16} y={48} w={90} h={10} />
      <Bar x={262} y={48} w={150} h={10} />
      <Bar x={16} y={72} w={90} h={10} />
      <Bar x={262} y={72} w={170} h={10} />
    </>
  );
};

export const StripToMarkdown: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();
  const flag = progress(frame, T.flag, 16);

  return (
    <AgentStage {...chrome}>
      {/* the rendered page */}
      <Panel x={PAGE.x} y={PAGE.y} w={PAGE.w} h={PAGE.h} tag="text/html" accent={HTML} style={enter(frame, T.page)}>
        {CUTS.map((c, i) => {
          const drop = progress(frame, T.drop + i * 8, 20);
          return (
            <div
              key={c.tag}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.h,
                boxSizing: "border-box",
                borderRadius: RADIUS.sm,
                background: interpolateColors(flag, [0, 1], [inkA(0.06), withAlpha(CUT, 0.12)]),
                border: `1.5px dashed ${interpolateColors(flag, [0, 1], [inkA(0.14), withAlpha(CUT, 0.8)])}`,
                opacity: progress(frame, T.page + 8 + i * 3, 14) * (1 - drop),
                transform: `translateY(${drop * 40}px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  fontWeight: 500,
                  color: interpolateColors(flag, [0, 1], [inkA(0.66), CUT]),
                  ...enter(frame, T.tags + i * 4, 10),
                }}
              >
                {c.tag}
              </span>
            </div>
          );
        })}
        {KEEPS.map((k, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: k.x,
              top: k.y,
              width: k.w,
              height: k.h,
              opacity:
                progress(frame, T.page + 14 + i * 3, 14) *
                interpolate(progress(frame, T.fly + i * 14, 20), [0, 1], [1, 0.3]),
            }}
          >
            <KeepArt i={i} r={k} />
          </div>
        ))}
      </Panel>

      {/* the Markdown it becomes */}
      <Panel x={DOC.x} y={DOC.y} w={DOC.w} h={DOC.h} tag="text/markdown" accent={MD} style={enter(frame, T.doc)}>
        {KEEPS.map((k, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: PAD, top: k.top, ...enter(frame, T.fly + i * 14 + 22, 10) }}
          >
            {k.lines.map((l) => (
              <MdLine key={l} text={l} code={k.code} height={LINE} />
            ))}
          </div>
        ))}
      </Panel>

      {/* each block's ghost, flying from the page to its Markdown */}
      {KEEPS.map((k, i) => {
        const p = progress(frame, T.fly + i * 14, 30);
        if (p <= 0 || p >= 1) return null;
        const from = { x: PAGE.x + k.x, y: PAGE.y + k.y, w: k.w, h: k.h };
        const to = { x: DOC.x + PAD, y: DOC.y + k.top, w: 520, h: k.lines.length * LINE };
        const lerp = (a: number, b: number) => a + (b - a) * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: lerp(from.x, to.x),
              top: lerp(from.y, to.y),
              width: lerp(from.w, to.w),
              height: lerp(from.h, to.h),
              borderRadius: RADIUS.sm,
              background: withAlpha(MD, 0.14),
              border: `1.5px solid ${withAlpha(MD, 0.6)}`,
              opacity: interpolate(p, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
            }}
          />
        );
      })}
    </AgentStage>
  );
};
