// The diagram either side of the terminal: the framework mosaic funnelling
// into the CLI, and the CLI handing the site to the bunny.net edge, with the
// Optimizer checkbox under it.
import { CheckTile, Dot, EdgeNode, pointOnPath, Svg, Trace } from "@keyframe/components";
import { asset, Img } from "@keyframe/engine/assets";
import { useFrame } from "@keyframe/engine/time";
import {
  BRAND,
  brandA,
  enter,
  FONT,
  INK,
  inkA,
  MONO,
  MUTED,
  PRODUCTS,
  pop,
  progress,
  RADIUS,
  RAIL,
  RAISED,
  rise,
  SHADOW,
  SURFACE,
  travel,
} from "@keyframe/kit";
import { FRAMEWORKS, FUNNEL_DUR, FUNNEL_STEP, PACKET_DUR, PACKETS, PICKED, packetAt, T } from "./data";

// ── Geometry ─────────────────────────────────────────────────────────────────
// The mosaic sits left of centre with the CLI to its right; after the deploy
// the CLI moves left and the edge takes the right.
const COLS = 6;
const ROWS = Math.ceil(FRAMEWORKS.length / COLS);
const TILE = 112;
const GAP = 16;
const GRID_X = 170;
const GRID_Y = 572 - (ROWS * TILE + (ROWS - 1) * GAP) / 2;
const GRID_RIGHT = GRID_X + COLS * TILE + (COLS - 1) * GAP;

const NODE = 150;
export const CLI_IN = { x: 1500, y: 572 };
// The edge row rides up to make room for the Optimizer card when it shows.
const rowY = (optimizer: boolean) => (optimizer ? 470 : 540);
export const cliOut = (optimizer: boolean) => ({ x: 600, y: rowY(optimizer) });
const edgeAt = (optimizer: boolean) => ({ x: 1320, y: rowY(optimizer) });

const tileAt = (i: number) => ({
  x: GRID_X + (i % COLS) * (TILE + GAP) + TILE / 2,
  y: GRID_Y + Math.floor(i / COLS) * (TILE + GAP) + TILE / 2,
});

// One rail per row, from just past the grid into the CLI node's left side.
const railStart = (row: number) => ({ x: GRID_RIGHT + 34, y: GRID_Y + row * (TILE + GAP) + TILE / 2 });
const rail = (row: number) => {
  const a = railStart(row);
  const end = CLI_IN.x - NODE / 2 - 8;

  return `M ${a.x} ${a.y} C ${a.x + 240} ${a.y}, ${end - 220} ${CLI_IN.y}, ${end} ${CLI_IN.y}`;
};

// A tile runs along its row to the rail, then down the rail into the node.
const tilePath = (i: number) => {
  const p = tileAt(i);
  const a = railStart(Math.floor(i / COLS));

  return `M ${p.x} ${p.y} L ${a.x} ${a.y} ${rail(Math.floor(i / COLS)).replace(/^M [^C]+/, "")} L ${CLI_IN.x} ${CLI_IN.y}`;
};

// Leave order: right column first, top to bottom, the picked tile last.
const ORDER = FRAMEWORKS.map((_, i) => i)
  .filter((i) => i !== PICKED)
  .sort((a, b) => (b % COLS) - (a % COLS) || a - b);
const leaveAt = (i: number) =>
  i === PICKED ? T.funnel + ORDER.length * FUNNEL_STEP + 2 : T.funnel + ORDER.indexOf(i) * FUNNEL_STEP;
export const PICKED_LANDS = leaveAt(PICKED) + FUNNEL_DUR;

// ── Mosaic ───────────────────────────────────────────────────────────────────
const Tile = ({ i }: { i: number }) => {
  const frame = useFrame();
  const { name, icon } = FRAMEWORKS[i];
  const picked = i === PICKED;
  const lit = picked ? progress(frame, T.pick, 10) : 0;
  const t = travel(frame, leaveAt(i), FUNNEL_DUR);
  if (t >= 1) return null;

  const at = pointOnPath(tilePath(i), t);
  const s = pop(frame, T.tiles + ((i % COLS) + Math.floor(i / COLS)) * 1.6);
  // Full size along the row, shrinking down the rail, gone as it reaches the node.
  const shrink = 1 - 0.7 * progress(t, 0.25, 0.75);
  const gone = 1 - progress(t, 0.8, 0.2);

  return (
    <div
      style={{
        position: "absolute",
        left: at.x - TILE / 2,
        top: at.y - TILE / 2,
        width: TILE,
        height: TILE,
        boxSizing: "border-box",
        borderRadius: RADIUS.md,
        background: picked ? `linear-gradient(${brandA(0.14 * lit)}, ${brandA(0.14 * lit)}), ${SURFACE}` : SURFACE,
        border: `1.5px solid ${picked && lit > 0 ? brandA(0.2 + 0.8 * lit) : inkA(0.1)}`,
        boxShadow: SHADOW,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: FONT,
        ...rise(s, 16, 0.85),
        opacity: Math.min(1, s * 1.4) * gone,
        transform: `${rise(s, 16, 0.85).transform} scale(${shrink})`,
      }}
    >
      {icon ? (
        // Marks arrive in their own colours; the mosaic sets them all in one ink.
        <Img
          src={asset(`frameworks/${icon}.svg`)}
          style={{ width: 46, height: 46, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }}
        />
      ) : (
        <span style={{ color: INK, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: "46px" }}>
          {name}
        </span>
      )}
      {icon && (
        <span style={{ color: picked && lit > 0 ? INK : MUTED, fontSize: 17, fontWeight: 500, whiteSpace: "nowrap" }}>
          {name}
        </span>
      )}
    </div>
  );
};

const Rails = () => {
  const frame = useFrame();
  const draw = progress(frame, T.cli + 2, 18);
  // The rails go once the last tile is in.
  const out = progress(frame, PICKED_LANDS - 6, 12);

  return (
    <Svg>
      {Array.from({ length: ROWS }, (_, r) => (
        <Trace key={r} d={rail(r)} progress={draw} color={RAIL} width={2} opacity={1 - out} />
      ))}
    </Svg>
  );
};

export const Mosaic = () => (
  <>
    <Rails />
    {FRAMEWORKS.map((f, i) => (
      <Tile key={f.name} i={i} />
    ))}
  </>
);

// ── CLI node ─────────────────────────────────────────────────────────────────
// The CLI as a node: a prompt mark in a raised tile, the product name beneath.
// It turns orange once it holds this run's framework, and bumps as it lands.
export const CliNode = ({
  x,
  y,
  at,
  litAt,
  out = 1,
}: {
  x: number;
  y: number;
  at: number;
  litAt: number;
  out?: number;
}) => {
  const frame = useFrame();
  const s = pop(frame, at);
  const lit = progress(frame, litAt, 10);
  const bump = Math.sin(Math.PI * progress(frame, litAt, 12));

  return (
    <div style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: x - NODE / 2,
          top: y - NODE / 2,
          width: NODE,
          height: NODE,
          boxSizing: "border-box",
          borderRadius: RADIUS.md,
          background: `linear-gradient(${brandA(0.1 * lit)}, ${brandA(0.1 * lit)}), ${RAISED}`,
          border: `1.5px solid ${lit > 0 ? brandA(0.3 + 0.7 * lit) : inkA(0.3)}`,
          boxShadow: SHADOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: 58,
          fontWeight: 700,
          color: INK,
          ...rise(s, 16, 0.7),
          transform: `${rise(s, 16, 0.7).transform} scale(${1 + 0.06 * bump})`,
        }}
      >
        <span style={{ color: BRAND }}>&gt;</span>_
      </div>
      <div
        style={{
          position: "absolute",
          left: x - 300,
          width: 600,
          top: y + NODE / 2 + 20,
          display: "flex",
          justifyContent: "center",
          ...enter(frame, at + 6),
        }}
      >
        <span
          style={{
            color: INK,
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 600,
            background: RAISED,
            border: `1px solid ${inkA(0.2)}`,
            borderRadius: RADIUS.sm,
            padding: "4px 18px",
          }}
        >
          {PRODUCTS.cli}
        </span>
      </div>
    </div>
  );
};

// ── Edge ─────────────────────────────────────────────────────────────────────
// The CLI ships the build down a wire to the edge; files run along it as dots.
const wire = (optimizer: boolean) => {
  const a = cliOut(optimizer);
  const b = edgeAt(optimizer);

  return `M ${a.x + NODE / 2 + 14} ${a.y} L ${b.x - NODE / 2 - 14} ${b.y}`;
};

// Optimizer as a setting on the site: a box that ticks, its name and what it does.
const OptimizerCard = () => {
  const frame = useFrame();
  const edge = edgeAt(true);

  return (
    <div
      style={{
        position: "absolute",
        left: edge.x - 230,
        top: edge.y + 190,
        width: 460,
        boxSizing: "border-box",
        padding: "22px 28px",
        borderRadius: RADIUS.md,
        background: SURFACE,
        border: `1px solid ${inkA(0.14)}`,
        boxShadow: SHADOW,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: FONT,
        ...enter(frame, T.optimizer, 18),
      }}
    >
      {frame >= T.optimizerCheck ? (
        <CheckTile at={T.optimizerCheck} />
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            flex: "none",
            boxSizing: "border-box",
            borderRadius: RADIUS.sm,
            border: `1.5px solid ${inkA(0.4)}`,
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: INK, fontSize: 32, fontWeight: 600 }}>{PRODUCTS.optimizer}</span>
        <span style={{ color: MUTED, fontSize: 24 }}>Image optimisation</span>
      </div>
    </div>
  );
};

export const EdgeScene = ({ optimizer }: { optimizer: boolean }) => {
  const frame = useFrame();
  const out = 1 - progress(frame, T.outro, 16);
  const cli = cliOut(optimizer);
  const edge = edgeAt(optimizer);
  const d = wire(optimizer);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <Svg>
        <Trace d={d} progress={progress(frame, T.wire, 18)} color={RAIL} width={3} />
        {Array.from({ length: PACKETS }, (_, i) => {
          const p = travel(frame, packetAt(i), PACKET_DUR);

          return p > 0 && p < 1 ? <Dot key={i} d={d} p={p} color={BRAND} /> : null;
        })}
      </Svg>
      <CliNode x={cli.x} y={cli.y} at={T.handoff + 9} litAt={T.handoff + 9} />
      <EdgeNode cx={edge.x} cy={edge.y} at={T.edge} size={NODE} />
      {optimizer && <OptimizerCard />}
    </div>
  );
};
