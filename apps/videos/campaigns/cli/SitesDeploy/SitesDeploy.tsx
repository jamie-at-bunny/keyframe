import { BunnyLogo, Check, groupFocus, type Placed, Super, TERM, Terminal } from "@keyframe/components";
import { lerp } from "@keyframe/engine/motion";
import { Fill, useFrame } from "@keyframe/engine/time";
import { Device, ILLUSTRATIONS } from "@keyframe/illustrations";
import {
  BG,
  BRAND,
  brandA,
  enter,
  FONT,
  INK,
  inkA,
  MUTED,
  ON_DARK,
  pop,
  progress,
  RADIUS,
  rise,
  SHADOW,
  STAGE,
  SURFACE,
  withAlpha,
} from "@keyframe/kit";
import { CLOSE, FILES, SITE, SUPERS, T, uploadedAt, uploadedCount } from "./data";
import { ROWS } from "./rows";

// ── Camera ───────────────────────────────────────────────────────────────────
// The panel keeps one size and one x the whole way through; each beat only
// eases it up or down so the lines in use (the group) sit on the aim line.
type Shot = { at: number; dur: number; group: string };
const SHOTS: Shot[] = [
  { at: 0, dur: 1, group: "cmd" },
  { at: T.buildAsk - 4, dur: 18, group: "build" },
  { at: T.outDir - 6, dur: 20, group: "ship" },
];

const SCALE = 1.4;
// Where the framed lines land on screen: centred, below the super band.
const AIM_X = STAGE.width / 2;
const AIM_Y = 620;
// Text is left aligned, so the panel is placed by where its text starts.
const TEXT_LEFT = 200;

// The terminal sits in the code-window illustration, sized so its screen is
// exactly the terminal's width. The terminal rides up by its own title bar so
// the window's dots take that place. OX/OY is where the terminal's origin
// lands inside the window, so the camera can keep aiming in terminal space.
const WINDOW = ILLUSTRATIONS["code-window"];
const K = TERM.width / WINDOW.screen.w;
const WINDOW_W = WINDOW.width * K;
const OX = WINDOW.screen.x * K;
const OY = WINDOW.screen.y * K - TERM.bar;

const FX = TERM.padX + (AIM_X - TEXT_LEFT) / SCALE;

const camera = (frame: number) => {
  let fy = groupFocus(ROWS, frame, SHOTS[0].group);
  for (const shot of SHOTS.slice(1)) {
    const t = progress(frame, shot.at, shot.dur);
    if (t > 0) fy = lerp(fy, groupFocus(ROWS, frame, shot.group), t);
  }

  return { scale: SCALE, fx: FX, fy };
};

// What stays lit: the framed group, everything else drops to DIM, blended
// from the previous shot over 12 frames.
const DIM = 0.36;
const litFor = (frame: number) => {
  const current = [...SHOTS].reverse().find((s) => frame >= s.at) ?? SHOTS[0];
  const before = SHOTS[Math.max(0, SHOTS.indexOf(current) - 1)];
  const t = progress(frame, current.at, 12);
  const level = (shot: Shot, p: Placed) => (p.row.group === shot.group ? 1 : DIM);

  return (p: Placed) => lerp(level(before, p), level(current, p), t);
};

// ── Live deploy card ─────────────────────────────────────────────────────────
// A compact card over the upload, like a live activity: the file count ticks
// on tabular figures, the bar eases, and when the deploy goes live a check
// strokes on and the card gives a small bump.
const uploadSmooth = (frame: number) => {
  const n = uploadedCount(frame);
  if (n >= FILES) return 1;
  const prev = n === 0 ? T.upload : uploadedAt(n - 1);
  const next = uploadedAt(n);

  return (n + Math.min(1, Math.max(0, (frame - prev) / Math.max(1, next - prev)))) / FILES;
};

const LiveCard = () => {
  const frame = useFrame();
  const live = frame >= T.done;
  const checkT = progress(frame, T.done, 12);
  const bump = live ? Math.sin(Math.PI * progress(frame, T.done + 2, 12)) : 0;
  const out = progress(frame, T.rollback - 14, 14);
  const style = enter(frame, T.upload - 4, -18);
  const label = live ? "Published" : frame >= T.publish ? "Publishing" : "Deploying";

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
        border: `1px solid ${live ? withAlpha(ON_DARK.green, 0.5 * checkT) : inkA(0.14)}`,
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
      {/* spinner tile, turning into a drawn check when the deploy goes live */}
      <div
        style={{
          width: 52,
          height: 52,
          flex: "none",
          borderRadius: RADIUS.sm,
          background: live ? withAlpha(ON_DARK.green, 0.16 * checkT) : brandA(0.12),
          border: `1.5px solid ${live ? ON_DARK.green : BRAND}`,
          position: "relative",
        }}
      >
        {live ? (
          <Check at={T.done} />
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
            {label} <span style={{ color: INK }}>{SITE}</span>
          </span>
          <span
            style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 40, color: INK, lineHeight: 1 }}
          >
            {uploadedCount(frame)}
            <span style={{ color: MUTED, fontWeight: 500, fontSize: 26 }}> / {FILES} files</span>
          </span>
        </div>
        <div style={{ height: 6, borderRadius: RADIUS.xs, background: inkA(0.12), overflow: "hidden" }}>
          <div
            style={{
              width: `${100 * uploadSmooth(frame)}%`,
              height: "100%",
              borderRadius: RADIUS.xs,
              background: live ? ON_DARK.green : BRAND,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Close ────────────────────────────────────────────────────────────────────
// The site is live, so the film closes on where it lives.

const Close = () => {
  const frame = useFrame();

  return (
    <Fill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          color: MUTED,
          fontSize: 52,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          ...enter(frame, CLOSE.line, 16),
        }}
      >
        Live on
      </div>
      <div style={{ marginTop: 34, ...rise(pop(frame, CLOSE.logo)) }}>
        <BunnyLogo width={560} />
      </div>
    </Fill>
  );
};

// ── Scene ────────────────────────────────────────────────────────────────────
// `bunny sites deploy` in a linked Astro project: type the command, say yes to
// the build, watch it build, upload and publish, then the close. The camera
// works the lines in use; supers sit in the band above, where the terminal
// fades out.
const MASK = "linear-gradient(to bottom, transparent 150px, black 240px, black 1010px, transparent 1080px)";

export const SitesDeploy = () => {
  const frame = useFrame();
  const cam = camera(frame);

  const stageIn = progress(frame, 0, 18);
  const panelIn = pop(frame, 4);
  const out = progress(frame, T.outro, 18);
  const fadeAll = progress(frame, T.end - 16, 16);

  const tx = AIM_X - (cam.fx + OX) * cam.scale;
  const ty = AIM_Y - (cam.fy + OY) * cam.scale;

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
          <Device name="code-window" width={WINDOW_W} screenBackground={ON_DARK.surface}>
            <div style={{ marginTop: -TERM.bar }}>
              <Terminal rows={ROWS} lit={litFor(frame)} bare />
            </div>
          </Device>
        </div>
      </Fill>

      {SUPERS.map((sup) => (
        <Super key={sup.text} {...sup} />
      ))}

      {frame >= T.upload - 4 && frame < T.rollback && <LiveCard />}
      {frame >= T.outro && <Close />}
    </Fill>
  );
};
