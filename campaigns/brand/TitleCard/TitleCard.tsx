import { useFrame } from "@keyframe/engine/time";
import { enter, FONT, INK, MUTED, Stage } from "@keyframe/kit";
import { COPY, T } from "./data";

// The starter: eyebrow, a title that springs in, one supporting line, the
// wordmark. Copy this folder to begin a new video.
export const TitleCard = () => {
  const frame = useFrame();

  return (
    <Stage eyebrow={COPY.eyebrow} logo>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          fontFamily: FONT,
        }}
      >
        <div
          style={{ color: INK, fontSize: 96, fontWeight: 700, letterSpacing: "-0.02em", ...enter(frame, T.title, 30) }}
        >
          {COPY.title}
        </div>
        <div style={{ color: MUTED, fontSize: 40, fontWeight: 500, ...enter(frame, T.sub, 16) }}>{COPY.sub}</div>
      </div>
    </Stage>
  );
};
