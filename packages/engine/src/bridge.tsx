// The render target. render.html mounts one video at its native size and
// exposes window.__keyframe for the Playwright renderer to drive frame by frame.
import { useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { settled } from "./assets";
import { mix, toWav } from "./audio";
import { type Entry, Frame, type Video, type VideoMeta } from "./time";

export type Bridge = {
  meta: VideoMeta & { id: Video["id"]; hasSound: boolean };
  seek: (frame: number) => Promise<void>;
  // The mix of frames [from, to) as a base64 WAV, or null for a silent video.
  audio: (from?: number, to?: number) => Promise<string | null>;
};

declare global {
  interface Window {
    __keyframe?: Bridge;
    __keyframeError?: string;
  }
}

const b64 = (bytes: Uint8Array) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));

  return btoa(s);
};

const boot = async (videos: Entry[]) => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const transparent = params.has("alpha");
  const rawProps = params.get("props");
  const props = rawProps ? JSON.parse(rawProps) : undefined;
  const entry = videos.find((v) => v.id === id);
  if (!entry) throw new Error(`no video "${id}" in videos.ts`);
  const video: Video = (await entry.load()).default;

  let setFrame: (f: number) => void = () => {};
  const Host = () => {
    const [frame, set] = useState(0);
    setFrame = set;

    return <Frame video={video} frame={frame} transparent={transparent} props={props} />;
  };
  const el = document.getElementById("root");
  if (!el) throw new Error("render.html has no #root element");
  const root = createRoot(el);
  flushSync(() => root.render(<Host />));
  await settled();

  window.__keyframe = {
    meta: {
      id: video.id,
      width: video.width,
      height: video.height,
      fps: video.fps,
      durationInFrames: video.durationInFrames,
      hasSound: !!video.sound?.length,
    },
    seek: async (frame) => {
      flushSync(() => setFrame(frame));
      await settled();
    },
    audio: async (from = 0, to = video.durationInFrames) =>
      video.sound?.length ? b64(toWav(await mix(video.sound, video.fps, from, to))) : null,
  };
};

// Mounts the render target on render.html's #root, resolving ?id= against the app's registry.
export const mountBridge = (videos: Entry[]) =>
  boot(videos).catch((err) => {
    window.__keyframeError = String(err?.stack ?? err);
    console.error(err);
  });
