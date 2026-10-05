import { useFrame } from "@keyframe/engine/time";
import { progress } from "./anim";
import { FONT, INK } from "./tokens";

// A super (on-screen line of copy) in the band at the top of frame. Rises and
// unblurs in, leaves a little quicker. Short, no trailing period, and never
// repeating a label already on screen.
export const Super: React.FC<{ from: number; to: number; text: string; top?: number; size?: number }> = ({
  from,
  to,
  text,
  top = 70,
  size = 56,
}) => {
  const frame = useFrame();
  const inT = progress(frame, from, 16);
  const outT = progress(frame, to - 9, 9);
  if (inT <= 0 || outT >= 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        color: INK,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        opacity: inT * (1 - outT),
        transform: `translateY(${(1 - inT) * 14 - outT * 6}px)`,
        filter: `blur(${(1 - inT) * 6}px)`,
      }}
    >
      {text}
    </div>
  );
};
