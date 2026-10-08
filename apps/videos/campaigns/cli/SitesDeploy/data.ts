// "bunny sites deploy": an Astro site built and published from the terminal.
// Every CLI line on screen is the CLI's own output, taken from BunnyWay/cli
// (packages/cli/src/commands/sites/deploy.ts, interactive.ts, build.ts,
// constants.ts, core/logger.ts and core/format.ts) and the Astro preset in
// packages/framework-detector/src/presets.ts. The build lines are npm's script
// header and Astro's own build log, trimmed to its key lines. Only the account
// values (site, host, deploy ID, file count, size, timings) are made up.
//
// The run is the linked, repeat case: the directory is linked to the site (no
// site picker), it is not the site's first deploy (no custom domain prompt)
// and the site has no custom domain yet, so the CLI prints its domain hint.

import { typing } from "@keyframe/components";

// ── Beats ────────────────────────────────────────────────────────────────────
// Frame each beat starts on. The scene, camera and supers all key off these.
export const T = {
  type: 16, // `bunny sites deploy` starts typing
  enter: 62, // return pressed
  siteLoad: 64, // "Loading linked site..."
  buildAsk: 80, // "Detected Astro. Run `npm run build` before deploying?"
  buildAnswer: 96,
  build: 98, // "Running build: npm run build", then the build's own output
  buildLines: 104, // first line of the build log; one every 7 frames after
  outDir: 158, // "Deploying detected output directory: dist"
  hash: 162, // "Hashing files..."
  upload: 174, // "Uploading 38 files..."
  uploadEnd: 246, // last file lands
  publish: 248, // "Publishing to production..."
  done: 270, // "Deployed ..."
  rollback: 306, // the card has left: the rollback super
  outro: 372, // terminal clears for the close
  end: 468, // the logo holds for two seconds
} as const;

// The close: "Live on", then the logo.
export const CLOSE = {
  line: T.outro + 12,
  logo: T.outro + 20,
} as const;

export const COMMAND = "bunny sites deploy";
export const typedAt = typing(COMMAND, T.type);

// ── Account values ───────────────────────────────────────────────────────────
export const SITE = "docs";
export const HOST = "docs.b-cdn.net";
export const DEPLOY_ID = "4f2a91c8"; // git rev-parse --short=8 HEAD on a clean tree
export const FILES = 38;
// formatBytes(2_516_582): one decimal under 10.
export const SIZE = "2.4 MB";

// The Astro preset: label "Astro", output dir "dist", npm runs `npm run build`.
export const FRAMEWORK = "Astro";
export const OUT_DIR = "dist";
export const BUILD = "npm run build";
export const BUILD_ASK = `Detected ${FRAMEWORK}. Run \`${BUILD}\` before deploying?`;

// npm's script header, then Astro's log: a gray clock, a tag in blue.
export const BUILD_LOG: { time?: string; tag?: string; text: string }[] = [
  { text: `> ${SITE}@1.0.0 build` },
  { text: "> astro build" },
  { time: "10:42:07", tag: "[build]", text: 'output: "static"' },
  { time: "10:42:07", tag: "[build]", text: "Building static entrypoints..." },
  { time: "10:42:08", tag: "[vite]", text: "✓ built in 1.18s" },
  { time: "10:42:09", tag: "[build]", text: "12 page(s) built in 1.94s" },
  { time: "10:42:09", tag: "[build]", text: "Complete!" },
];
export const buildLineAt = (i: number) => T.buildLines + i * 7;

// When file k finishes uploading: eased, a few at first, then the pool is warm.
export const uploadedAt = (k: number) =>
  Math.round(T.upload + 4 + (T.uploadEnd - T.upload - 4) * ((k + 1) / FILES) ** 0.8);
export const uploadedCount = (frame: number) =>
  Array.from({ length: FILES }, (_, k) => k).filter((k) => frame >= uploadedAt(k)).length;

// ── Supers ───────────────────────────────────────────────────────────────────
// What you get, not what the command does: short, no trailing period, never
// during the action itself.
export const SUPERS: { from: number; to: number; text: string }[] = [
  { from: 4, to: 58, text: "Deploy from where you build" },
  { from: T.rollback, to: T.outro - 4, text: "Every deploy kept for rollback" },
];
