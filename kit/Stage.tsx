import { Fill, useFrame, useVideo } from "@keyframe/engine/time";
import { progress } from "./anim";
import { BunnyLogo } from "./brand";
import { BG, BRAND, FONT } from "./tokens";

// The navy stage every scene sits on: optional orange spaced-caps eyebrow at
// the top, optional wordmark bottom centre, and an eased fade at either end.
// Set fadeIn/fadeOut to 0 when a parent reel crossfades scenes itself. In an
// alpha render the fill steps aside so the scene composites cleanly.
export const Stage: React.FC<{
  eyebrow?: string;
  logo?: boolean;
  background?: string;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({ eyebrow, logo = false, background = BG, fadeIn = 18, fadeOut = 16, children }) => {
  const frame = useFrame();
  const { durationInFrames, transparent } = useVideo();
  const opacity =
    (fadeIn ? progress(frame, 0, fadeIn) : 1) *
    (fadeOut ? 1 - progress(frame, durationInFrames - fadeOut, fadeOut) : 1);

  return (
    <Fill style={{ background: transparent ? undefined : background, fontFamily: FONT }}>
      <Fill style={{ opacity }}>
        {children}
        {eyebrow && (
          <div
            style={{
              position: "absolute",
              top: 58,
              left: 0,
              right: 0,
              textAlign: "center",
              color: BRAND,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              opacity: progress(frame, 4, 20),
            }}
          >
            {eyebrow}
          </div>
        )}
        {logo && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 46,
              display: "flex",
              justifyContent: "center",
              opacity: progress(frame, 8, 20) * 0.9,
            }}
          >
            <BunnyLogo width={168} />
          </div>
        )}
      </Fill>
    </Fill>
  );
};
