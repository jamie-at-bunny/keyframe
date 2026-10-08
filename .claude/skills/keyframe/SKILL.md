---
name: keyframe
description: Make, edit, sound and render bunny.net marketing videos with Keyframe, the bunny.net video pipeline: React and HTML draw each frame, Web Audio supplies the sound, headless Chromium (Playwright) captures the frames and AVFoundation encodes them. Use for any new animated scene, title card, CLI walkthrough, product clip or reel, for changing an existing video, adding or tuning sound effects, previewing, rendering or exporting (MP4, 3K, ProRes, transparent alpha), or debugging a render. Carries the bunny.net house style.
---

# bunny.net videos

Short (5 to 20s) animated scenes for bunny.net marketing. A video is a React component that draws one frame from the current frame number. The repo is an npm workspaces monorepo with its own engine, kit, components and renderer, and depends on no video framework. All paths below are relative to the repo root; npm scripts run from there.

Read the reference for the task at hand:

| Task | Read |
| --- | --- |
| Building a scene: which shared component or helper to use | [references/kit.md](references/kit.md) |
| Adding or tuning sound | [references/sound.md](references/sound.md) |
| Previewing, rendering, encoding, delivering, debugging a render | [references/render.md](references/render.md) |

Worked examples: `apps/videos/campaigns/cli/StreamImport` (CLI walkthrough with a camera, live card, welcome and sound; read it before building anything big), `apps/videos/campaigns/edge-scripting/CacheRefreshPurge` (a guided code walkthrough), `apps/videos/campaigns/burrow` (diagram scenes on `Svg`, `Trace`, `Dot`, `EdgeNode` and cards, plus a chart built from real capture data), `apps/videos/campaigns/brand/Bumper` (product bumpers) and `apps/videos/campaigns/brand/TitleCard` (the starter to copy).

## Layout

```
packages/
  engine/                   @keyframe/engine: the runtime and the renderer
    src/                    time.tsx, motion.ts, assets.ts, audio.ts, studio.tsx, bridge.tsx
    render/                 render.mjs (Vite + Playwright, the keyframe-render bin), encode.swift (AVFoundation)
  kit/src/                  @keyframe/kit: brand foundations, no components
    palette.ts shape.ts     THE brand colour and corner source (do not copy hex values elsewhere)
    tokens.ts anim.ts       stage roles, fonts, motion helpers
    products.ts             official product names
    sfx.ts                  the house sound set ("@keyframe/kit/sfx")
    fonts/                  Rubik and JetBrains Mono, local
  components/src/           @keyframe/components: Stage Super Card Check chart path terminal code Window brand Bumper
  illustrations/src/        @keyframe/illustrations: device frames, windows and scenes (svg/ plus catalogue.ts)
apps/videos/                @keyframe/videos: the app the studio and renderer serve
  videos.ts                 registry: { id, campaign, load } for every video
  studio.ts bridge.ts       entries for index.html and render.html, handing the registry to the engine
  public/                   brand art (logos, mascot, map)
  campaigns/<campaign>/<Name>/
    index.ts                defineVideo({...}) default export
    data.ts                 beats (T), copy, account values
    <Name>.tsx              the scene
    sound.ts                cues (optional)
  out/                      renders and stills
```

## Make a bumper

A bumper is the bunny.net wordmark dead centre with the product at the foot, and optionally a product logo beside (`logoPlacement: "before"`) or above (`"above"`) the name. Themes: `navy` (default), `light`, `green` (chroma key). 5s, with one sound: a swell of air that peaks as the wordmark lands. The product arrives in silence.

- One-off, no code: `npm run render -- StreamBumper --props '{"product":"Bunny DNS","productLogo":"products/dns.svg"}'`
- Kept: add `export const DnsBumper = bumper({ id: "DnsBumper", product: PRODUCTS.dns, productLogo: "products/dns.svg" })` to `apps/videos/campaigns/brand/Bumper/index.ts` and its id to the bumper list in `apps/videos/videos.ts`.

Product logos are files in `apps/videos/public/` (SVG preferred). Check the still: a wide wordmark logo usually wants `"above"` with a smaller `productLogoSize`.

## Make a new video

1. Copy `apps/videos/campaigns/brand/TitleCard/` to `apps/videos/campaigns/<campaign>/<Name>/` and rename.
2. Write `data.ts` first: a `T` object of beat frames (the whole timeline at a glance), then copy and values. Everything on screen and every sound keys off `T`, so retiming is a one-line change.
3. Build the scene in `<Name>.tsx` from kit tokens and components.
4. Register it in `apps/videos/videos.ts` under its campaign.
5. Check stills (below), add sound, render.

```ts
// index.ts
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { T } from "./data";
import { SOUND } from "./sound";
import { MyScene } from "./MyScene";

export default defineVideo({ id: "MyScene", ...STAGE, durationInFrames: T.end, background: BG, Component: MyScene, sound: SOUND });
```

## The one rule: a frame is a pure function of `useFrame()`

The renderer seeks frames out of order across several browser tabs, so every frame must render correctly on its own.

- Read time only from `useFrame()` (and `useVideo()` for size, fps, duration). Inside `<Sequence from>` the frame is local.
- No `Date.now()`, `performance.now()`, `Math.random()`, `setTimeout`, `requestAnimationFrame`, CSS transitions, CSS `@keyframes`, `<video autoplay>` or GIFs. For randomness use a seeded hash of an index (`wobble()` in `packages/kit/src/sfx.ts`).
- No state that accumulates across frames (`useState`, `useRef` counters). Derive everything from the frame. If something depends on the past (a smoothed camera target), recompute it from the last N frames as `groupFocus()` does in `packages/components/src/terminal.tsx`.
- Images go through `<Img src={asset("file.svg")}>` from `@keyframe/engine/assets` so the frame waits for decode. Files live in `apps/videos/public/`.
- Anything else async (fetched JSON, a canvas you draw into): wrap the promise in `waitFor()`.

## House style

These are standing preferences. If a brief contradicts them, flag the conflict before you follow it.

- **Stage**: flat brand navy (`BG`, `#0E233F`), Rubik, `<Stage eyebrow="..." logo>` for the orange spaced-caps eyebrow and the bunny.net wordmark bottom centre. No radial lifts or background glows.
- **Colour**: only from `packages/kit/src/palette.ts`. `ON_DARK` roles on navy (`surface` cards, `raised` chips and title bars, `text`, `muted`, `brand` orange, one accent per hue); `LIGHT` on light stages. Orange marks the subject, blue does structure. A missing role gets added to `ON_DARK`, never hardcoded in a scene.
- **Corners**: `RADIUS` only. `md` 10 for cards, tiles and panels; `sm` 6 for chips, tags, pills and buttons (never a full pill); `xs` 3 for accent bars. Only dots and markers are round.
- **Shadows**: only where something lifts (cards, tiles), always `SHADOW` / `ON_DARK.shadow`, darker than the stage and never coloured. Accent bars, dots, rails and markers carry no shadow and no glow.
- **Charts**: the dashboard look from `packages/components/src/chart.tsx` (white `ChartCard`, `ChartStat` row, light gridlines, 2 to 3px round-joined lines), not a bespoke dark chart.
- **Motion**: entrances on the house spring via `pop()` / `enter()` (damping 13, stiffness 140, mass 0.7, slight overshoot). Travel and draws use `progress()` or `travel()`, eased in and out. Nothing linear.
- **Pacing**: tight. Something enters by frame ~4, no dead holds beyond what the edit needs, everything has landed by about five seconds into a 10s clip and then holds for reading.
- **Text**: sparse and short. Supers (`<Super>`) say what you get, not what the command does, with no trailing period, and never repeat a label already on screen. Keep the lower third clear when voiceover subtitles may sit there.
- **Truth**: CLI and product output on screen must be the real output (copy it from the source), with only account values made up. Say where it came from in a comment at the top of `data.ts`.

### On-screen copy

Copy is written as a developer at bunny.net speaking to developers.

- **Product names** come from `PRODUCTS` in `packages/kit/src/products.ts`, never typed out, so the official spelling holds (`Bunny Stream`, `Magic Containers`, `bunny.net CLI`). Check a new name against a current bunny.net source before adding it.
- **bunny.net** is always lowercase, so keep it out of anything set in capitals (the eyebrow is uppercase). Name the product there instead.
- **Sentence case** for titles and supers: "Refresh & purge", not "Refresh & Purge".
- **No bunny puns or mascot language** ("hop", "burrow" as wordplay), no excitement, no "fast", "powerful" or "seamless" without a number from a source. Say what the product does.
- **Plain and specific**: active verbs, British English, three plain dots (never `…`), no exclamation marks, no em or en dashes. Avoid "not X but Y" contrasts and rhetorical questions.
- When Jamie's `jamie-writer` skill is installed, run its `check_style.py` over long copy (step bodies, descriptions).

## Patterns worth reusing

- **Beats in one place**: `T` in `data.ts`, derived schedules as functions of it (`typing()`, `doneAt(k)`).
- **Camera**: a list of shots `{ at, dur, scale, group }`; each eases in over `dur` with `progress()`, lerping scale and focus from the previous pose, plus a small `drift` so the frame never sits dead still. See `StreamImport.tsx`.
- **Dim what is not in use**: a `lit(row)` function that blends the previous shot's brightness to the current one over 12 frames.
- **Handover**: the outgoing element leaves before the next arrives (never two stacked), with just enough overlap that the stage is never blank.
- **Reels**: wrap each scene in `<Sequence from={...} dur={...}>`, start each a few frames early, and give inner `<Stage fadeIn={0} fadeOut={0}>` when the parent crossfades.

## Check your work

Do not hand back a video you have not looked at.

```console
npm run dev                                   # studio at http://localhost:5199/#<Id>@<frame>
npm run render -- <Id> --still 120            # apps/videos/out/<Id>-120.png, then Read the PNG
npm run lint                                  # tsc and Biome; npm run format to fix
```

Grab stills at each beat in `T` (and just after), Read them, and check spacing, overlaps, clipped text, colours against the palette, and that nothing is mid-flight that should have landed. Then render the full video and check it as described in [references/render.md](references/render.md).

The root scripts forward to the `@keyframe/videos` workspace (`npm run dev -w @keyframe/videos`). If this repo is itself nested in a larger one, that root may expose them under other names; check its `package.json`.

## Where new code goes

- A token, colour role, motion helper, product name or sound: `@keyframe/kit`. The kit has no React components.
- A visual piece more than one video uses: `@keyframe/components`, imported as `import { Stage } from "@keyframe/components"`.
- An illustration or device frame: `@keyframe/illustrations`. Drop the SVG in `svg/` with a plain kebab-case name and add its row to `catalogue.ts`; a device also gets its `screen`, measured from the screen shape in the SVG. Check it on the `Illustrations` sheet in the studio.
- Clock, assets, audio, studio or renderer: `@keyframe/engine`.
- Anything one campaign uses: that campaign's folder.

Dependencies run one way: engine, then kit, then components and illustrations, then the app. Packages export their TypeScript source directly (see `exports` in each `package.json`), so there is no build step.
