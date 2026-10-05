// SVG path helpers on the browser's own geometry: draw a path on, and find
// points along it for dots and packets.
const NS = "http://www.w3.org/2000/svg";
const cache = new Map<string, { el: SVGPathElement; length: number }>();

const measure = (d: string) => {
  let hit = cache.get(d);
  if (!hit) {
    const el = document.createElementNS(NS, "path");
    el.setAttribute("d", d);
    hit = { el, length: el.getTotalLength() };
    cache.set(d, hit);
  }

  return hit;
};

export const pathLength = (d: string) => measure(d).length;

export const pointOnPath = (d: string, p: number) => {
  const { el, length } = measure(d);
  const pt = el.getPointAtLength(length * Math.min(1, Math.max(0, p)));

  return { x: pt.x, y: pt.y };
};

// A path drawn from its start up to `progress` (0..1).
export const Trace: React.FC<{ d: string; progress: number; color: string; width?: number; opacity?: number }> = ({
  d,
  progress,
  color,
  width = 4,
  opacity = 1,
}) => {
  if (progress <= 0) return null;
  const len = pathLength(d);

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      strokeDasharray={len}
      strokeDashoffset={len * (1 - Math.min(1, progress))}
    />
  );
};

// A dot at `p` (0..1) along a path with a short trail. No glow: house dots are flat.
export const Dot: React.FC<{ d: string; p: number; color: string; r?: number; trail?: number }> = ({
  d,
  p,
  color,
  r = 8,
  trail = 0.012,
}) => {
  if (p <= 0 || p >= 1) return null;
  const fade = Math.min(1, p / 0.05, (1 - p) / 0.05);
  const head = pointOnPath(d, p);

  return (
    <g opacity={fade}>
      {[3, 2, 1].map((k) => {
        const pt = pointOnPath(d, Math.max(0, p - trail * k));

        return <circle key={k} cx={pt.x} cy={pt.y} r={r - k * 1.4} fill={color} opacity={0.3 - k * 0.07} />;
      })}
      <circle cx={head.x} cy={head.y} r={r} fill={color} />
    </g>
  );
};
