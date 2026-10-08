// The clock. A video is a React tree that reads the current frame and draws
// that frame, nothing else. The studio and the renderer both drive it through
// <Frame>, so what you scrub is exactly what gets encoded.
import { type CSSProperties, createContext, type ReactNode, useContext } from "react";
import type { Cue } from "./audio";
import "./frame.css";

export type VideoMeta = { width: number; height: number; fps: number; durationInFrames: number };
// `transparent` is set for alpha renders: stage fills should step aside.
type Meta = VideoMeta & { transparent: boolean };

export type Video = VideoMeta & {
  id: string;
  // biome-ignore lint/suspicious/noExplicitAny: each video types its own props; the registry holds them all
  Component: React.FC<any>;
  // Default props for Component. Override per render with --props '{"...": ...}'.
  props?: Record<string, unknown>;
  // Stage colour behind everything. Leave it out for a transparent render.
  background?: string;
  sound?: Cue[];
};

export const defineVideo = (v: Video) => v;

// A registry entry: the app lists every video by id and campaign, and each one
// lazy-loads its module, whose default export is a defineVideo().
export type Entry = { id: Video["id"]; campaign: string; load: () => Promise<{ default: Video }> };

const FrameCtx = createContext(0);
const MetaCtx = createContext<Meta>({ width: 1920, height: 1080, fps: 30, durationInFrames: 1, transparent: false });

// The current frame, relative to the nearest <Sequence>.
export const useFrame = () => useContext(FrameCtx);
export const useVideo = () => useContext(MetaCtx);

// Shift time for a block: children see frame 0 at `from`, and are unmounted
// outside [from, from + dur).
export const Sequence: React.FC<{ from: number; dur?: number; children: ReactNode }> = ({ from, dur, children }) => {
  const frame = useFrame();
  if (frame < from || (dur !== undefined && frame >= from + dur)) return null;

  return <FrameCtx.Provider value={frame - from}>{children}</FrameCtx.Provider>;
};

// A full-frame layer.
export const Fill: React.FC<{ style?: CSSProperties; children?: ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);

// One frame of a video at its native size.
export const Frame: React.FC<{
  video: Video;
  frame: number;
  transparent?: boolean;
  props?: Record<string, unknown>;
}> = ({ video, frame, transparent = false, props }) => {
  const { Component, width, height, fps, durationInFrames, background } = video;

  return (
    <MetaCtx.Provider value={{ width, height, fps, durationInFrames, transparent }}>
      <FrameCtx.Provider value={frame}>
        <div
          className="keyframe-root"
          style={{
            position: "relative",
            width,
            height,
            overflow: "hidden",
            background: transparent ? undefined : background,
          }}
        >
          <Component {...video.props} {...props} />
        </div>
      </FrameCtx.Provider>
    </MetaCtx.Provider>
  );
};
