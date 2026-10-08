// Motion maths: interpolation, easing curves and a physical spring. Everything
// is a pure function of the frame, so any frame renders the same on its own,
// in any order. Never reach for Date.now(), Math.random() or CSS transitions.

export type EasingFn = (t: number) => number;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── Easing ───────────────────────────────────────────────────────────────────
// Base curves are "in" curves; wrap them with out() or inOut().
const bezier = (x1: number, y1: number, x2: number, y2: number): EasingFn => {
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx;
  const cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;

  return (p) => {
    if (p <= 0 || p >= 1) return p;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (x(t) - p) / d;
    }
    // Newton can wander on steep curves; fall back to bisection.
    if (t < 0 || t > 1 || Math.abs(x(t) - p) > 1e-5) {
      let lo = 0,
        hi = 1;
      for (let i = 0; i < 30; i++) {
        t = (lo + hi) / 2;
        if (x(t) < p) lo = t;
        else hi = t;
      }
    }

    return y(t);
  };
};

export const Easing = {
  linear: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  quart: (t: number) => t ** 4,
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  exp: (t: number) => (t === 0 ? 0 : 2 ** (10 * (t - 1))),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  back:
    (s = 1.70158) =>
    (t: number) =>
      t * t * ((s + 1) * t - s),
  bezier,
  in: (f: EasingFn): EasingFn => f,
  out:
    (f: EasingFn): EasingFn =>
    (t) =>
      1 - f(1 - t),
  inOut:
    (f: EasingFn): EasingFn =>
    (t) =>
      t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2,
};

// ── Interpolate ──────────────────────────────────────────────────────────────
type Extrapolate = "clamp" | "extend";
export type InterpolateOptions = { easing?: EasingFn; left?: Extrapolate; right?: Extrapolate };

// Map `v` through matching input and output ranges (two or more points each).
// Clamps at both ends by default, which is what animation nearly always wants.
export const interpolate = (
  v: number,
  input: readonly number[],
  output: readonly number[],
  { easing = Easing.linear, left = "clamp", right = "clamp" }: InterpolateOptions = {},
) => {
  if (input.length !== output.length || input.length < 2) throw new Error("interpolate: ranges must match, 2+ points");
  let i = 1;
  while (i < input.length - 1 && v > input[i]) i++;
  const [a, b] = [input[i - 1], input[i]];
  let t = b === a ? 1 : (v - a) / (b - a);
  if (t < 0 && left === "clamp") t = 0;
  if (t > 1 && right === "clamp") t = 1;
  const e = t >= 0 && t <= 1 ? easing(t) : t;

  return lerp(output[i - 1], output[i], e);
};

// ── Colour ───────────────────────────────────────────────────────────────────
// Parse "#rgb", "#rrggbb", "#rrggbbaa", "rgb()" or "rgba()" into byte channels.
// Alpha is held as a byte too, so a fade lands on the same 256 steps a browser
// would store.
const channels = (color: string): [number, number, number, number] => {
  const hex = color.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (hex) {
    const full = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex;
    const n = (i: number) => parseInt(full.slice(i, i + 2), 16);

    return [n(0), n(2), n(4), full.length === 8 ? n(6) : 255];
  }
  const fn = color.match(/^rgba?\(([^)]+)\)$/i)?.[1];
  if (!fn) throw new Error(`interpolateColors: unsupported colour "${color}"`);
  const [r, g, b, a = 1] = fn.split(",").map(Number);

  return [r, g, b, Math.round(a * 255)];
};

// Interpolate between colours channel by channel, clamped. Returns rgba().
export const interpolateColors = (v: number, input: readonly number[], colors: readonly string[]) => {
  const parsed = colors.map(channels);
  const [r, g, b, a] = [0, 1, 2, 3].map((k) =>
    interpolate(
      v,
      input,
      parsed.map((c) => c[k]),
    ),
  );

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number((a / 255).toFixed(3))})`;
};

// ── Spring ───────────────────────────────────────────────────────────────────
// A damped mass on a spring travelling from 0 to 1, solved in closed form so
// every frame is exact and independent. `dur` stretches or squeezes the motion
// so it settles in that many frames while keeping its shape.
export type SpringConfig = { mass?: number; stiffness?: number; damping?: number };

const solve = (t: number, { mass = 1, stiffness = 100, damping = 10 }: SpringConfig) => {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const d0 = -1; // starts one unit short of rest, at rest
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);

    return 1 + Math.exp(-zeta * w0 * t) * (d0 * Math.cos(wd * t) + ((zeta * w0 * d0) / wd) * Math.sin(wd * t));
  }

  // At or past critical damping, settle as fast as possible without bouncing.
  // A physically overdamped spring crawls; `damping: 200` is meant as "smooth,
  // no bounce".
  return 1 + Math.exp(-w0 * t) * (d0 + w0 * d0 * t);
};

// Frames until the spring is within 0.5% of rest and stays there.
const settleCache = new Map<string, number>();
const settleFrames = (fps: number, cfg: SpringConfig) => {
  const key = `${fps}|${cfg.mass}|${cfg.stiffness}|${cfg.damping}`;
  const hit = settleCache.get(key);
  if (hit !== undefined) return hit;
  let last = 0;
  for (let f = 0; f < fps * 20; f++) if (Math.abs(solve(f / fps, cfg) - 1) > 0.005) last = f;
  settleCache.set(key, last + 1);

  return last + 1;
};

export const spring = ({
  frame,
  fps,
  config = {},
  dur,
  from = 0,
  to = 1,
}: {
  frame: number;
  fps: number;
  config?: SpringConfig;
  dur?: number;
  from?: number;
  to?: number;
}) => {
  if (frame <= 0) return from;
  const natural = settleFrames(fps, config);
  const f = dur ? frame * (natural / dur) : frame;
  if (f >= natural) return to;

  return lerp(from, to, solve(f / fps, config));
};
