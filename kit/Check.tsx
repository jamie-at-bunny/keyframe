import { useFrame } from "@keyframe/engine/time";
import { enter, progress } from "./anim";
import { FONT, INK, ON_DARK, RADIUS, withAlpha } from "./tokens";

const PATH = "M 14 25 L 22 33 L 37 17";
const LEN = 34;

// A check stroked on over 12 frames from `at`, in a 52px box.
export const Check: React.FC<{ at: number; color?: string }> = ({ at, color = ON_DARK.green }) => {
  const frame = useFrame();

  return (
    <svg width={52} height={52} viewBox="0 0 52 52" style={{ position: "absolute", left: -1.5, top: -1.5 }}>
      <path
        d={PATH}
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={LEN}
        strokeDashoffset={LEN * (1 - progress(frame, at, 12))}
      />
    </svg>
  );
};

// The tinted square a check sits in.
export const CheckTile: React.FC<{ at: number; color?: string }> = ({ at, color = ON_DARK.green }) => (
  <div
    style={{
      width: 52,
      height: 52,
      flex: "none",
      boxSizing: "border-box",
      borderRadius: RADIUS.sm,
      background: withAlpha(color, 0.14),
      border: `1.5px solid ${color}`,
      position: "relative",
    }}
  >
    <Check at={at} color={color} />
  </div>
);

// A checklist row: springs in at `at`, its check draws `delay` frames later.
export const CheckItem: React.FC<{ at: number; delay?: number; children: React.ReactNode }> = ({
  at,
  delay = 6,
  children,
}) => {
  const frame = useFrame();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: FONT, ...enter(frame, at, 16) }}>
      <CheckTile at={at + delay} />
      <span style={{ color: INK, fontSize: 40, fontWeight: 500 }}>{children}</span>
    </div>
  );
};
