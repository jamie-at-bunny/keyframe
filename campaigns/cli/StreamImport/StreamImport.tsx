import { lerp } from "@keyframe/engine/motion";
import { Fill, useFrame } from "@keyframe/engine/time";
import {
  BG,
  BRAND,
  BunnyLogo,
  brandA,
  Check,
  CheckItem,
  enter,
  FONT,
  groupFocus,
  INK,
  inkA,
  MUTED,
  ON_DARK,
  type Placed,
  pop,
  progress,
  RADIUS,
  rise,
  SHADOW,
  STAGE,
  SURFACE,
  Super,
  TERM,
  Terminal,
  withAlpha,
} from "@keyframe/kit";
import { doneCount, doneSmooth, LIBRARY, SUPERS, T, VIDEOS, WELCOME } from "./data";
import { ROWS } from "./rows";

// ── Camera ───────────────────────────────────────────────────────────────────
// The panel never sits still: each beat eases to frame the lines in use (the
// group), then keeps drifting in a few percent until the next beat takes over.
// `null` is the wide shot, the whole window centred.
// `left` is the screen x the framed text starts at.
type Shot = { at: number; dur: number; scale: number; group: string | null; drift?: number; left?: number };
const SHOTS: Shot[] = [
  { at: 0, dur: 1, scale: 1.55, group: "cmd", drift: 0.05 },
  { at: T.srcAsk - 4, dur: 18, scale: 1.4, group: "src", drift: 0.04 },
  { at: T.checkSpin + 2, dur: 18, scale: 1.4, group: "tail" },
  { at: T.summary - 6, dur: 20, scale: 1.48, group: "plan", drift: 0.04 },
  { at: T.engine, dur: 30, scale: 1, group: null },
];

// Where the framed lines land on screen: centred, below the super band.
const AIM_X = STAGE.width / 2;
const AIM_Y = 620;
// Text is left aligned, so a group is framed by where its left edge lands.
const TEXT_LEFT = 200;

const shotPose = (frame: number, shot: Shot, next?: Shot) => {
  const span = next ? next.at - shot.at : T.end - shot.at;
  const scale = shot.scale * (1 + (shot.drift ?? 0) * progress(frame, shot.at, span));
  if (shot.group === null) return { scale, fx: TERM.width / 2, fy: TERM.height / 2 };

  return { scale, fx: TERM.padX + (AIM_X - (shot.left ?? TEXT_LEFT)) / scale, fy: groupFocus(ROWS, frame, shot.group) };
};

const camera = (frame: number) => {
  let pose = shotPose(frame, SHOTS[0], SHOTS[1]);
  SHOTS.slice(1).forEach((shot, i) => {
    const t = progress(frame, shot.at, shot.dur);
    if (t <= 0) return;
    const next = shotPose(frame, shot, SHOTS[i + 2]);
    pose = { scale: lerp(pose.scale, next.scale, t), fx: lerp(pose.fx, next.fx, t), fy: lerp(pose.fy, next.fy, t) };
  });

  return pose;
};

// What stays lit: the framed group, everything else drops to DIM. In the wide
// shot of the run, the newest few lines stay lit and older ones fall away.
const DIM = 0.36;
const litFor = (frame: number) => {
  const current = [...SHOTS].reverse().find((s) => frame >= s.at) ?? SHOTS[0];
  const before = SHOTS[Math.max(0, SHOTS.indexOf(current) - 1)];
  const t = progress(frame, current.at, 12);
  const bodyBottom = TERM.height - TERM.bar - TERM.padTop - 26;
  const level = (shot: Shot, p: Placed, y: number) => {
    if (shot.group === null) {
      if (frame < T.engine) return 1;
      const fromBottom = bodyBottom - (y + p.h);

      return lerp(1, DIM, Math.min(1, Math.max(0, (fromBottom - TERM.line * 4) / (TERM.line * 5))));
    }
    if (shot.group === "tail") return 1;

    return p.row.group === shot.group ? 1 : DIM;
  };

  return (p: Placed, y: number) => lerp(level(before, p, y), level(current, p, y), t);
};

// ── Live progress card ───────────────────────────────────────────────────────
// A compact card over the run, like a live activity: the count ticks on
// tabular figures, the bar eases, and on the last video a check strokes on
// and the card gives a small bump.
const LiveCard = () => {
  const frame = useFrame();
  const at = T.engine + 24;
  const done = doneCount(frame);
  const full = frame >= T.lastDone;
  const checkT = progress(frame, T.lastDone + 2, 12);
  const bump = full ? Math.sin(Math.PI * progress(frame, T.lastDone + 4, 12)) : 0;
  const out = progress(frame, T.outro, 14);
  const style = enter(frame, at, -18);

  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        left: STAGE.width / 2 - 330,
        width: 660,
        height: 112,
        boxSizing: "border-box",
        borderRadius: RADIUS.md,
        background: SURFACE,
        border: `1px solid ${full ? withAlpha(ON_DARK.green, 0.5 * checkT) : inkA(0.14)}`,
        boxShadow: SHADOW,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 30px",
        fontFamily: FONT,
        ...style,
        opacity: style.opacity * (1 - out),
        transform: `${style.transform} scale(${1 + 0.04 * bump})`,
      }}
    >
      {/* spinner tile, turning into a drawn check when the last video lands */}
      <div
        style={{
          width: 52,
          height: 52,
          flex: "none",
          borderRadius: RADIUS.sm,
          background: full ? withAlpha(ON_DARK.green, 0.16 * checkT) : brandA(0.12),
          border: `1.5px solid ${full ? ON_DARK.green : BRAND}`,
          position: "relative",
        }}
      >
        {full ? (
          <Check at={T.lastDone + 2} />
        ) : (
          <svg width={52} height={52} viewBox="0 0 52 52" style={{ position: "absolute", left: -1.5, top: -1.5 }}>
            <circle
              cx={26}
              cy={26}
              r={11}
              fill="none"
              stroke={BRAND}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 11 * 0.28} ${2 * Math.PI * 11}`}
              transform={`rotate(${frame * 9} 26 26)`}
            />
          </svg>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: MUTED, fontSize: 24, fontWeight: 500 }}>
            {full ? "Imported to" : "Importing to"} <span style={{ color: INK }}>{LIBRARY}</span>
          </span>
          <span
            style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 40, color: INK, lineHeight: 1 }}
          >
            {done}
            <span style={{ color: MUTED, fontWeight: 500, fontSize: 26 }}> / {VIDEOS.length}</span>
          </span>
        </div>
        <div style={{ height: 6, borderRadius: RADIUS.xs, background: inkA(0.12), overflow: "hidden" }}>
          <div
            style={{
              width: `${100 * doneSmooth(frame)}%`,
              height: "100%",
              borderRadius: RADIUS.xs,
              background: full ? ON_DARK.green : BRAND,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Welcome ──────────────────────────────────────────────────────────────────
// The videos have moved in, so the film closes on a welcome, then a short
// checklist of where things stand, each check drawing on in turn.
const CHECKLIST = ["Import completed", "Ready to stream"];

const Welcome = () => {
  const frame = useFrame();

  return (
    <Fill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          color: MUTED,
          fontSize: 52,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          ...enter(frame, WELCOME.line, 16),
        }}
      >
        Welcome to
      </div>
      <div style={{ marginTop: 34, ...rise(pop(frame, WELCOME.logo)) }}>
        <BunnyLogo width={560} />
      </div>
      <div style={{ marginTop: 84, display: "flex", flexDirection: "column", gap: 22 }}>
        {CHECKLIST.map((item, i) => (
          <CheckItem key={item} at={WELCOME.items[i]} delay={WELCOME.checkDelay}>
            {item}
          </CheckItem>
        ))}
      </div>
    </Fill>
  );
};

// ── Scene ────────────────────────────────────────────────────────────────────
// `bunny stream import` in a linked directory: type the command, pick a
// source, read the plan, say yes, watch 48 videos land, then a welcome. The
// camera works the lines in use; supers sit in the band above, where the
// terminal fades out.
const MASK = "linear-gradient(to bottom, transparent 150px, black 240px, black 1010px, transparent 1080px)";

export const StreamImport = () => {
  const frame = useFrame();
  const cam = camera(frame);

  const stageIn = progress(frame, 0, 18);
  const panelIn = pop(frame, 4);
  const out = progress(frame, T.outro, 18);
  const fadeAll = progress(frame, T.end - 16, 16);

  const tx = AIM_X - cam.fx * cam.scale;
  const ty = AIM_Y - cam.fy * cam.scale;

  return (
    <Fill style={{ background: BG, opacity: 1 - fadeAll }}>
      {/* the terminal, under a soft mask so it fades out beneath the super band */}
      <Fill style={{ opacity: stageIn * (1 - out), maskImage: MASK, WebkitMaskImage: MASK }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty + (1 - panelIn) * 40 - out * 30}px) scale(${cam.scale})`,
          }}
        >
          <Terminal rows={ROWS} title="~/videos" lit={litFor(frame)} />
        </div>
      </Fill>

      {SUPERS.map((sup) => (
        <Super key={sup.text} {...sup} />
      ))}

      {frame >= T.engine && <LiveCard />}
      {frame >= T.outro && <Welcome />}
    </Fill>
  );
};
