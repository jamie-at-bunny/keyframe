// "bunny stream import": Cloudflare Stream into a Bunny Stream library. Every
// line on screen is the CLI's own output, taken from the stream-import branch
// of the CLI (packages/cli/src/commands/stream/import.ts, import-setup.ts,
// interactive.ts and packages/stream-import/src/migration.ts). Only the
// account values (library, IDs, video names, sizes) are made up.
//
// The run is the short, set-up case: the directory is already linked to the
// library (no library picker, no link prompt) and two sources have their
// credentials in the environment (no credential prompts), so the source
// picker marks them "(configured)".

import { typing } from "@keyframe/components";

// ── Beats ────────────────────────────────────────────────────────────────────
// Frame each beat starts on. The scene, camera and supers all key off these.
export const T = {
  type: 16, // `bunny stream import` starts typing
  enter: 62, // return pressed
  libLoad: 64, // "Loading linked video library..."
  srcAsk: 80, // source picker
  srcMoves: [94, 100, 106, 112], // four steps down: Vimeo > AWS S3 > Wistia > Mux > Cloudflare Stream
  srcPick: 126,
  checkSpin: 130, // "Checking Cloudflare Stream credentials..."
  discoverSpin: 146, // "Discovering Cloudflare Stream content..."
  summary: 164, // the summary table
  confirmAsk: 220, // "Import 48 videos into bunny.net?"
  confirmAnswer: 234,
  engine: 238, // the engine's own log lines
  firstDone: 280, // first video completes
  lastDone: 392, // last of the 48 completes
  outro: 414, // the card has ticked: terminal clears for the welcome
  end: 546,
} as const;

// The welcome: the line, then the logo, then each checklist item, whose check
// starts drawing 6 frames after the item lands.
export const WELCOME = {
  line: T.outro + 12,
  logo: T.outro + 20,
  items: [T.outro + 42, T.outro + 54],
  checkDelay: 6,
} as const;

export const COMMAND = "bunny stream import";
export const typedAt = typing(COMMAND, T.type);

// ── Account values ───────────────────────────────────────────────────────────
// The destination library, named for where the videos are going.
export const LIBRARY = "bunny.net";
export const LIBRARY_ID = 412843;

// SOURCES in import-sources.ts, in order, with each plugin's label.
export const SOURCES = ["Vimeo", "AWS S3", "Wistia", "Mux", "Cloudflare Stream", "JW Player", "Brightcove"];
export const SOURCE = "Cloudflare Stream";
// Sources whose credentials are all in the environment. With more than one
// ready, the CLI still asks, and tags these in the picker.
export const CONFIGURED = new Set(["Vimeo", SOURCE]);
export const sourceTitle = (label: string) => (CONFIGURED.has(label) ? `${label} (configured)` : label);

// renderSummary: formatDuration (h:mm:ss) and formatBytes (no decimal at 10+).
export const SUMMARY: [string, string][] = [
  ["Library", `${LIBRARY} (${LIBRARY_ID})`],
  // Cloudflare Stream has no folders, so the CLI really does say "0 folders".
  ["Source", `${SOURCE}: 48 videos in 0 folders`],
  ["Already imported", "0"],
  ["To import", "48"],
  ["Duration", "6:12:40"],
  ["Size", "18 GB"],
];

export const CONCURRENCY = 3; // DEFAULT_CONCURRENCY

// Cloudflare's meta.name for each video, in the order the import walks them.
const FIRST = [
  "launch-keynote-2026.mp4",
  "product-tour.mp4",
  "onboarding-01-welcome.mp4",
  "onboarding-02-first-upload.mp4",
  "onboarding-03-players.mp4",
  "customer-story-acme.mp4",
  "pricing-explained.mp4",
  "webinar-edge-caching.mp4",
  "webinar-video-security.mp4",
  "changelog-september.mp4",
  "changelog-august.mp4",
  "team-offsite-recap.mp4",
];
export const VIDEOS: string[] = [
  ...FIRST,
  ...Array.from({ length: 48 - FIRST.length }, (_, i) => `tutorial-${String(i + 1).padStart(2, "0")}.mp4`),
];

// When video k completes. Encoding the first few takes a while, then the pool
// is full and completions land faster and faster: the long wait, compressed.
export const doneAt = (k: number) =>
  Math.round(T.firstDone + (T.lastDone - T.firstDone) * (k / (VIDEOS.length - 1)) ** 0.55);

// Videos finished by `frame`, as a whole count and as a smooth 0..1 for bars.
export const doneCount = (frame: number) => VIDEOS.filter((_, k) => frame >= doneAt(k)).length;
export const doneSmooth = (frame: number) => {
  const n = doneCount(frame);
  if (n >= VIDEOS.length) return 1;
  const prev = n === 0 ? T.engine + 24 : doneAt(n - 1);
  const next = doneAt(n);

  return (n + Math.min(1, Math.max(0, (frame - prev) / (next - prev)))) / VIDEOS.length;
};

// ── Supers ───────────────────────────────────────────────────────────────────
// What you get, not what the command does: short, no trailing period, never
// during the action itself. The welcome and its checklist close the story.
export const SUPERS: { from: number; to: number; text: string }[] = [
  { from: 4, to: 58, text: "Bring every video with you" },
  { from: 168, to: 218, text: "No surprises" },
];
