import { Chip, Dot, EdgeNode, Label, Svg, Trace } from "@keyframe/components";
import { interpolate, interpolateColors } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import {
  enter,
  INK,
  inkA,
  MONO,
  MUTED,
  pop,
  progress,
  RADIUS,
  RAIL,
  RAISED,
  SURFACE,
  travel,
  withAlpha,
} from "@keyframe/kit";
import { AgentStage, Bar, type Chrome, CUT, KEPT, MD, MdLine, Panel, PENDING } from "../kit";
import { T } from "./data";

// Generating llms.txt: pick a mode, up to 20 pages go in (the ones that cannot
// be converted are skipped), the status goes from Processing to Generated, and
// the file only goes live once serving is switched on.
const MODES = ["Automatic", "Select pages", "Use sitemap"];
const MODE_W = 180;
const GRID = { cx: 360, top: 415, cols: 4, rows: 5, w: 80, h: 56, gap: 16 };
const SKIPPED = [6, 13];
const EDGE = { x: 960, y: 540, size: 150 };
const FILE = { x: 1250, y: 330, w: 540, h: 400 };

const FILE_LINES = [
  "# Acme",
  "> Tools for shipping faster.",
  "",
  "## Docs",
  "- [Getting started](https://...)",
  "- [API reference](https://...)",
  "",
  "## Product",
  "- [Pricing](https://...)",
];

const tilePos = (i: number) => {
  const gridW = GRID.cols * GRID.w + (GRID.cols - 1) * GRID.gap;
  const c = i % GRID.cols;
  const r = Math.floor(i / GRID.cols);
  return {
    x: GRID.cx - gridW / 2 + c * (GRID.w + GRID.gap),
    y: GRID.top + r * (GRID.h + GRID.gap),
  };
};

const SENT = Array.from({ length: GRID.cols * GRID.rows }, (_, i) => i).filter((i) => !SKIPPED.includes(i));
const pathFrom = (i: number) => {
  const { x, y } = tilePos(i);
  const sx = x + GRID.w;
  const sy = y + GRID.h / 2;
  return `M ${sx} ${sy} C ${sx + 180} ${sy}, ${EDGE.x - 260} ${EDGE.y}, ${EDGE.x - EDGE.size / 2} ${EDGE.y}`;
};

const ModePicker: React.FC = () => {
  const frame = useFrame();
  // Slide from mode to mode, settling on the last.
  const pos = MODES.reduce((acc, _, i) => (i === 0 ? 0 : acc + progress(frame, T.modes + 12 + i * T.modeStep, 12)), 0);
  const w = MODES.length * MODE_W;
  return (
    <div
      style={{
        position: "absolute",
        left: GRID.cx - w / 2 - 6,
        top: 297,
        width: w + 12,
        height: 64,
        boxSizing: "border-box",
        padding: 6,
        borderRadius: RADIUS.md,
        background: SURFACE,
        border: `1.5px solid ${inkA(0.14)}`,
        display: "flex",
        ...enter(frame, T.modes),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 6 + pos * MODE_W,
          top: 6,
          width: MODE_W,
          height: 50,
          borderRadius: RADIUS.sm,
          background: RAISED,
          border: `1px solid ${withAlpha(MD, 0.6)}`,
        }}
      />
      {MODES.map((m, i) => (
        <div
          key={m}
          style={{
            position: "relative",
            width: MODE_W,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 500,
            color: Math.abs(pos - i) < 0.5 ? INK : MUTED,
          }}
        >
          {m}
        </div>
      ))}
    </div>
  );
};

const Tile: React.FC<{ i: number }> = ({ i }) => {
  const frame = useFrame();
  const { x, y } = tilePos(i);
  const skipped = SKIPPED.includes(i);
  const flag = skipped ? progress(frame, T.skip, 12) : 0;
  const drop = skipped ? progress(frame, T.skip + 18, 18) : 0;
  const sent = SENT.indexOf(i);
  // Dim each page once its dot has left, so the grid empties into the edge.
  const gone = sent >= 0 ? progress(frame, T.send + sent * 3, 16) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: GRID.w,
        height: GRID.h,
        boxSizing: "border-box",
        borderRadius: RADIUS.sm,
        background: interpolateColors(flag, [0, 1], [SURFACE, withAlpha(CUT, 0.16)]),
        border: `1.5px solid ${interpolateColors(flag, [0, 1], [inkA(0.16), CUT])}`,
        ...enter(frame, T.tiles + i * 2),
        opacity: pop(frame, T.tiles + i * 2) * (1 - drop) * interpolate(gone, [0, 1], [1, 0.4]),
        translate: `0 ${drop * 30}px`,
      }}
    >
      <Bar x={10} y={12} w={40} h={8} a={0.34} />
      <Bar x={10} y={28} w={56} h={6} />
      <Bar x={10} y={40} w={48} h={6} />
    </div>
  );
};

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div
    style={{
      position: "relative",
      width: 64,
      height: 36,
      borderRadius: RADIUS.sm,
      background: interpolateColors(on, [0, 1], [inkA(0.18), KEPT]),
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 4,
        left: 4 + on * 28,
        width: 28,
        height: 28,
        borderRadius: RADIUS.xs,
        background: INK,
      }}
    />
  </div>
);

export const LlmsTxt: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();
  const generated = progress(frame, T.generated, 12);
  const on = pop(frame, T.toggle);
  const live = progress(frame, T.live, 16);
  const toFile = progress(frame, T.generated - 6, 24);

  return (
    <AgentStage {...chrome}>
      <ModePicker />
      {Array.from({ length: GRID.cols * GRID.rows }, (_, i) => (
        <Tile key={i} i={i} />
      ))}
      <Svg>
        {SENT.map((i, k) => (
          <Dot key={i} d={pathFrom(i)} p={travel(frame, T.send + k * 3, 40)} color={MD} r={6} />
        ))}
        <Trace d={`M ${EDGE.x + EDGE.size / 2} ${EDGE.y} H ${FILE.x}`} progress={toFile} color={RAIL} width={3} />
      </Svg>

      <EdgeNode cx={EDGE.x} cy={EDGE.y} at={T.edge} label="Your Pull Zone" />
      <Chip cx={EDGE.x} cy={745} accent={PENDING} style={{ opacity: pop(frame, T.processing) * (1 - generated) }}>
        Processing
      </Chip>
      <Chip
        cx={EDGE.x}
        cy={745}
        accent={KEPT}
        style={{ opacity: generated, transform: `scale(${0.9 + 0.1 * pop(frame, T.generated)})` }}
      >
        Generated
      </Chip>

      {/* the file: drafted first, public only once serving is on */}
      <div style={{ opacity: interpolate(live, [0, 1], [0.55, 1]) }}>
        <Panel
          x={FILE.x}
          y={FILE.y}
          w={FILE.w}
          h={FILE.h}
          tag="llms.txt"
          accent={MD}
          style={{
            ...enter(frame, T.file),
            borderColor: interpolateColors(live, [0, 1], [inkA(0.14), withAlpha(KEPT, 0.7)]),
          }}
        >
          <div style={{ padding: "16px 28px" }}>
            {FILE_LINES.map((l, i) => (
              <div key={i} style={{ opacity: progress(frame, T.file + 8 + i * 4, 10) }}>
                <MdLine text={l} height={l ? 40 : 14} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div
        style={{
          position: "absolute",
          left: FILE.x,
          top: FILE.y + FILE.h + 28,
          width: FILE.w,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: INK,
          fontSize: 26,
          fontWeight: 500,
          ...enter(frame, T.toggle - 16),
        }}
      >
        Enable llms.txt serving
        <Toggle on={on} />
      </div>

      <Label
        x={FILE.x + FILE.w / 2}
        y={290}
        size={28}
        color={KEPT}
        style={{ fontFamily: MONO, fontWeight: 500, ...enter(frame, T.live + 4) }}
      >
        acme.b-cdn.net/llms.txt
      </Label>
    </AgentStage>
  );
};
