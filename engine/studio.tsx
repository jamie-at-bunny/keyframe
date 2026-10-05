// The preview studio: pick a video, scrub, play with sound. The URL hash keeps
// your place (#StreamImport@120), so a reload lands on the same frame.
//
//   space play/pause · ←/→ one frame · shift+←/→ ten · home/end · M mute · L loop
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { VIDEOS } from "../videos";
import { loadCues, schedule } from "./audio";
import { Frame, type Video } from "./time";

const UI = {
  panel: "#0e1f38",
  line: "rgba(238,244,254,0.1)",
  muted: "rgba(238,244,254,0.55)",
  accent: "#FF784D",
};

const parseHash = () => {
  const [id, f] = decodeURIComponent(location.hash.slice(1)).split("@");

  return { id: id || VIDEOS[0]?.id, frame: Number(f) || 0 };
};

// ?props={"product":"Bunny DNS"} previews prop overrides, as --props renders them.
const urlProps = (() => {
  const raw = new URLSearchParams(location.search).get("props");
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
})();

const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);

  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}.${String(frame % fps).padStart(2, "0")}`;
};

const Studio = () => {
  const [id, setId] = useState(() => parseHash().id);
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState(() => parseHash().frame);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(true);

  // Load the selected video.
  useEffect(() => {
    const entry = VIDEOS.find((v) => v.id === id);
    if (!entry) return setError(`No video "${id}" in videos.ts`);
    setPlaying(false);
    setError(null);
    entry
      .load()
      .then((m) => setVideo(m.default))
      .catch((e) => setError(String(e?.stack ?? e)));
  }, [id]);

  const last = video ? video.durationInFrames - 1 : 0;
  const go = useCallback((f: number) => setFrame(Math.max(0, Math.min(last, Math.round(f)))), [last]);

  useEffect(() => {
    history.replaceState(null, "", `#${id}@${frame}`);
  }, [id, frame]);

  // Playback. The audio clock leads when there is sound, so picture follows it.
  const audio = useRef<{ ctx: AudioContext } | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart only on play, pause or a setting change, never on the frames this loop sets itself
  useEffect(() => {
    if (!playing || !video) return;
    let stop = () => {};
    let raf = 0;
    let cancelled = false;
    const startFrame = frame >= last ? 0 : frame;

    (async () => {
      let clock = () => performance.now() / 1000;
      let t0 = clock();
      if (video.sound?.length && !muted) {
        audio.current ??= { ctx: new AudioContext({ sampleRate: 48000 }) };
        const { ctx } = audio.current;
        await ctx.resume();
        const buffers = await loadCues(video.sound, ctx.sampleRate);
        if (cancelled) return;
        t0 = ctx.currentTime + 0.05;
        stop = schedule(ctx, ctx.destination, video.sound, buffers, video.fps, startFrame, t0);
        clock = () => ctx.currentTime;
      }
      const tick = () => {
        const f = startFrame + Math.max(0, clock() - t0) * video.fps;
        if (f < last) {
          setFrame(Math.floor(f));
          raf = requestAnimationFrame(tick);

          return;
        }
        setPlaying(false);
        if (loop) {
          setFrame(0);
          requestAnimationFrame(() => setPlaying(true));
        } else setFrame(last);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stop();
    };
  }, [playing, video, muted, loop]);

  // Keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" && e.key !== " ") return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === " ") setPlaying((p) => !p);
      else if (e.key === "ArrowRight") go(frame + step);
      else if (e.key === "ArrowLeft") go(frame - step);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(last);
      else if (e.key === "m") setMuted((m) => !m);
      else if (e.key === "l") setLoop((l) => !l);
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    return () => removeEventListener("keydown", onKey);
  }, [frame, last, go]);

  // Fit the frame to the viewer.
  const viewer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = viewer.current;
    if (!el || !video) return;
    const fit = () => setScale(Math.min((el.clientWidth - 48) / video.width, (el.clientHeight - 48) / video.height));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    return () => ro.disconnect();
  }, [video]);

  const campaigns = [...new Set(VIDEOS.map((v) => v.campaign))];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: "100%" }}>
      <nav style={{ background: UI.panel, borderRight: `1px solid ${UI.line}`, padding: "16px 0", overflow: "auto" }}>
        {campaigns.map((c) => (
          <div key={c} style={{ marginBottom: 14 }}>
            <div
              style={{
                padding: "0 16px 6px",
                color: UI.muted,
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {c}
            </div>
            {VIDEOS.filter((v) => v.campaign === c).map((v) => (
              <button
                type="button"
                key={v.id}
                onClick={() => {
                  setFrame(0);
                  setId(v.id);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                  border: 0,
                  padding: "6px 16px",
                  cursor: "pointer",
                  background: v.id === id ? "rgba(255,120,77,0.14)" : "transparent",
                  borderLeft: `2px solid ${v.id === id ? UI.accent : "transparent"}`,
                }}
              >
                {v.id}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <main style={{ display: "grid", gridTemplateRows: "1fr auto", minWidth: 0 }}>
        <div ref={viewer} style={{ position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}>
          {error && <pre style={{ color: "#E9776A", padding: 24, whiteSpace: "pre-wrap" }}>{error}</pre>}
          {video && !error && (
            <div
              style={{
                width: video.width * scale,
                height: video.height * scale,
                boxShadow: "0 0 0 1px rgba(238,244,254,0.12)",
                // checkerboard shows through a transparent video
                background: "repeating-conic-gradient(#1a2a44 0 25%, #14223a 0 50%) 0 0 / 24px 24px",
              }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                <Frame video={video} frame={frame} props={urlProps} />
              </div>
            </div>
          )}
        </div>

        {video && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 16px",
              background: UI.panel,
              borderTop: `1px solid ${UI.line}`,
            }}
          >
            <button type="button" onClick={() => setPlaying((p) => !p)} style={btn}>
              {playing ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              min={0}
              max={last}
              value={frame}
              onChange={(e) => {
                setPlaying(false);
                go(Number(e.target.value));
              }}
              style={{ flex: 1, accentColor: UI.accent }}
            />
            <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 150, textAlign: "right" }}>
              {timecode(frame, video.fps)}{" "}
              <span style={{ color: UI.muted }}>
                · {frame} / {last}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              style={{ ...btn, opacity: video.sound?.length ? 1 : 0.4 }}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={() => setLoop((l) => !l)}
              style={{ ...btn, color: loop ? UI.accent : undefined }}
            >
              Loop
            </button>
            <span style={{ color: UI.muted }}>
              {video.width}×{video.height} · {video.fps}fps
            </span>
          </div>
        )}
      </main>
    </div>
  );
};

const btn: React.CSSProperties = {
  background: "rgba(238,244,254,0.08)",
  color: "inherit",
  border: `1px solid ${UI.line}`,
  borderRadius: 6,
  padding: "5px 12px",
  font: "inherit",
  cursor: "pointer",
};

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");
createRoot(root).render(<Studio />);
