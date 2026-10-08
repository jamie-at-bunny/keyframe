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
//
// The mosaic is the 30 starter sites in BunnyWay/examples (sites/README.md),
// in its order. Marks are Simple Icons (CC0), Analog's and Brunch's from their
// own repos; Elder.js has no mark, so its tile carries the name. The CLI has
// no Optimizer prompt, so the Optimizer checkbox sits in the diagram, never in
// the terminal.

import { typing } from "@keyframe/components";

// ── Beats ────────────────────────────────────────────────────────────────────
// Frame each beat starts on. The scene, camera and supers all key off these.
// Everything after the talking-head hold counts from its end, so the hold can
// be resized (or set to 0) in one place.
const TALK = 98; // the mosaic is in the CLI and the node is lit
const HOLD = 300; // 10s on the lit node, a slot to cut a talking head into
const TALK_END = TALK + HOLD;

export const T = {
  // The mosaic funnels into the CLI.
  tiles: 2, // framework tiles spring in on a diagonal wave
  pick: 30, // the Astro tile lights: this run's framework
  cli: 38, // the CLI node springs in
  funnel: 42, // tiles stream along the rails into the CLI, Astro last
  talk: TALK, // the hold starts: the stage is the lit CLI node alone
  term: TALK_END, // the CLI node opens into the terminal

  // The terminal run.
  type: TALK_END + 12, // `bunny sites deploy` starts typing
  enter: TALK_END + 58, // return pressed
  siteLoad: TALK_END + 60, // "Loading linked site..."
  buildAsk: TALK_END + 76, // "Detected Astro. Run `npm run build` before deploying?"
  buildAnswer: TALK_END + 92,
  build: TALK_END + 94, // "Running build: npm run build", then the build's own output
  buildLines: TALK_END + 100, // first line of the build log; one every 7 frames after
  outDir: TALK_END + 154, // "Deploying detected output directory: dist"
  hash: TALK_END + 158, // "Hashing files..."
  upload: TALK_END + 170, // "Uploading 38 files..."
  uploadEnd: TALK_END + 242, // last file lands
  publish: TALK_END + 244, // "Publishing to production..."
  done: TALK_END + 266, // "Deployed ..."
  rollback: TALK_END + 302, // the card has left: the rollback super

  // The CLI hands the site to the edge.
  handoff: TALK_END + 342, // the terminal folds back into the CLI node
  wire: TALK_END + 352, // the wire draws from the CLI to the edge
  edge: TALK_END + 360, // the edge node springs in, files start to flow
  optimizer: TALK_END + 378, // the Optimizer checkbox card springs in
  optimizerCheck: TALK_END + 390, // and its box is ticked

  outro: TALK_END + 430, // the diagram clears for the close
  end: TALK_END + 496, // the logo holds for two seconds
} as const;

// The close: the positioning line, then the logo it ends on.
export const CLOSE_LINE = "Deploy static sites with one command on";
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

// ── Mosaic ───────────────────────────────────────────────────────────────────
// `icon` names a mark in public/frameworks/; a tile without one sets its name.
export const FRAMEWORKS: { name: string; icon?: string }[] = [
  { name: "Analog", icon: "analog" },
  { name: "Angular", icon: "angular" },
  { name: FRAMEWORK, icon: "astro" },
  { name: "Brunch", icon: "brunch" },
  { name: "Ember", icon: "ember" },
  { name: "Next.js", icon: "nextjs" },
  { name: "Nuxt", icon: "nuxt" },
  { name: "Preact", icon: "preact" },
  { name: "Qwik", icon: "qwik" },
  { name: "React", icon: "react" },
  { name: "React Router", icon: "react-router" },
  { name: "SolidStart", icon: "solidstart" },
  { name: "SvelteKit", icon: "sveltekit" },
  { name: "Vite", icon: "vite" },
  { name: "Vue", icon: "vue" },
  { name: "Docusaurus", icon: "docusaurus" },
  { name: "Elder.js" },
  { name: "Eleventy", icon: "eleventy" },
  { name: "Gatsby", icon: "gatsby" },
  { name: "Gridsome", icon: "gridsome" },
  { name: "Hexo", icon: "hexo" },
  { name: "Hugo", icon: "hugo" },
  { name: "Jekyll", icon: "jekyll" },
  { name: "MkDocs", icon: "mkdocs" },
  { name: "Pelican", icon: "pelican" },
  { name: "Sphinx", icon: "sphinx" },
  { name: "Static HTML", icon: "static-html" },
  { name: "VitePress", icon: "vitepress" },
  { name: "Zola", icon: "zola" },
  { name: "Blazor", icon: "blazor" },
];

// The order tiles leave in: right column first so every row's path is clear,
// this run's framework last. Each leaves `FUNNEL_STEP` frames after the one before.
export const FUNNEL_STEP = 0.7;
export const FUNNEL_DUR = 22;
export const PICKED = FRAMEWORKS.findIndex((f) => f.name === FRAMEWORK);

// Files flowing down the wire to the edge, one every few frames.
export const PACKETS = 8;
export const packetAt = (i: number) => T.edge + 4 + i * 5;
export const PACKET_DUR = 22;

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
  { from: 4, to: T.talk - 4, text: "30 frameworks, one deploy command" },
  { from: T.rollback, to: T.handoff + 4, text: "Every deploy kept for rollback" },
];
