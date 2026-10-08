# Keyframe

Short animated videos for bunny.net marketing. React and HTML draw each
frame, sound is mixed with Web Audio, headless Chromium (Playwright) captures the frames, and a
small Swift tool encodes them with AVFoundation. It is an npm workspaces monorepo: the engine, the
brand kit and the shared components are separate packages, and the videos are an app built on them.

Needs macOS (for AVFoundation and `swiftc`, from the Xcode command line tools) and Node 22.

```console
npm install
npx playwright install chromium     # once, the browser that captures frames

npm run dev                         # studio at http://localhost:5199: scrub, play with sound
npm run render -- StreamImport      # apps/videos/out/StreamImport.mp4
npm run render -- StreamImport --scale 1.5 --codec prores --alpha   # 3K ProRes 4444 with alpha
npm run render -- StreamImport --still 200                          # one frame as a PNG
npm run render -- StreamBumper --props '{"product":"Bunny DNS"}'    # a one-off bumper
npm run lint                        # typecheck and Biome
npm run format                      # format and sort imports
```

The first render compiles the encoder (about five seconds) and caches it in `apps/videos/.cache/`.

## Layout

```
packages/
  engine/       @keyframe/engine: frame clock, springs and easing, assets, Web Audio, studio, render
                bridge, and the renderer (render.mjs with Vite + Playwright, encode.swift with AVFoundation)
  kit/          @keyframe/kit: palette and corners, fonts, stage tokens, motion helpers, product names,
                the synthesised sound set
  components/   @keyframe/components: stage, supers, cards, checks, charts, SVG traces, the CLI
                terminal, code walkthroughs, bumpers
  illustrations/ @keyframe/illustrations: device frames with live screens, windows, cards and scenes
apps/
  videos/       @keyframe/videos: the registry (videos.ts), campaigns, brand art (public/), the studio
```

Dependencies run one way: engine, kit, components and illustrations, then the app. Packages export their TypeScript
source directly, so there is no build step; Vite and tsc read it through the workspace links.

`packages/kit/src/palette.ts` and `packages/kit/src/shape.ts` are the single source of brand colour and corner radii.

| Video | Length | What it is |
| --- | --- | --- |
| `TitleCard` | 4s | the starter: eyebrow, title, line, wordmark, two sounds. Copy it to begin |
| `StreamImport` | 18s | `bunny stream import`, line for line, with a camera, a live progress card and sound |
| `CacheRefreshPurge` | 11s | Edge Scripting code walkthrough: serve, rebuild and purge one cached URL |
| `CacheSplit` `RoutingPaths` `RerouteMap` `CaptureTimeline` | 12 to 20s | Burrow Smart Routing diagrams and the 40 hour capture chart, every number from `capture-data.json` |
| `AgentTwoReaders` `AgentStripToMarkdown` `AgentMarkdownUrls` `AgentLlmsTxt` | 7 to 14s | Agent Readability: Markdown for AI agents, its URLs, and generated llms.txt |
| `Illustrations` | 1 frame | reference sheet of every illustration, with live content in each device screen |
| `BunnyBumper` `StreamBumper` `ShieldBumper` `ShieldBumperGreen` | 5s | bumpers: the wordmark centre, product name and optional product logo at the foot |

## Working with Claude

The `keyframe` skill in [`.claude/skills/keyframe`](./.claude/skills/keyframe) teaches
Claude Code the whole workflow: house style, the shared kit, sound design and rendering. Claude Code picks it up automatically in this folder. To use it elsewhere, copy the
`keyframe` folder into that project's `.claude/skills/` (or `~/.claude/skills/` for every
project). Ask for what you want ("a 10s clip showing ...") and it will build, check stills and render.
