# Keyframe

Short animated videos for bunny.net marketing. React and HTML draw each
frame, sound is mixed with Web Audio, headless Chromium (Playwright) captures the frames, and a
small Swift tool encodes them with AVFoundation. It is a self-contained package: copy this folder
into its own repo and it works the same.

Needs macOS (for AVFoundation and `swiftc`, from the Xcode command line tools) and Node 22.

```console
npm install
npx playwright install chromium     # once, the browser that captures frames

npm run dev                         # studio at http://localhost:5199: scrub, play with sound
npm run render -- StreamImport      # out/StreamImport.mp4
npm run render -- StreamImport --scale 1.5 --codec prores --alpha   # 3K ProRes 4444 with alpha
npm run render -- StreamImport --still 200                          # one frame as a PNG
npm run render -- StreamBumper --props '{"product":"Bunny DNS"}'    # a one-off bumper
npm run lint                        # typecheck and Biome
npm run format                      # format and sort imports
```

The first render compiles the encoder (about five seconds) and caches it in `.cache/`.

## Layout

```
videos.ts       the registry: every video by id and campaign
engine/         the runtime: frame clock, springs and easing, assets, Web Audio, studio, render bridge
kit/            shared brand pieces: palette and corners, fonts, stage, supers, cards, checks,
                charts, SVG traces, the CLI terminal, the synthesised sound set
public/         brand art: logos, mascot, map
campaigns/      the videos, by campaign
render/         render.mjs (Vite + Playwright) and encode.swift (AVFoundation)
```

`kit/palette.ts` and `kit/shape.ts` are the single source of brand colour and corner radii.

| Video | Length | What it is |
| --- | --- | --- |
| `TitleCard` | 4s | the starter: eyebrow, title, line, wordmark, two sounds. Copy it to begin |
| `StreamImport` | 18s | `bunny stream import`, line for line, with a camera, a live progress card and sound |
| `CacheRefreshPurge` | 11s | Edge Scripting code walkthrough: serve, rebuild and purge one cached URL |
| `BunnyBumper` `StreamBumper` `ShieldBumper` `ShieldBumperGreen` | 5s | bumpers: the wordmark centre, product name and optional product logo at the foot |

## Working with Claude

The `keyframe` skill in [`.claude/skills/keyframe`](./.claude/skills/keyframe) teaches
Claude Code the whole workflow: house style, the shared kit, sound design and rendering. Claude Code picks it up automatically in this folder. To use it elsewhere, copy the
`keyframe` folder into that project's `.claude/skills/` (or `~/.claude/skills/` for every
project). Ask for what you want ("a 10s clip showing ...") and it will build, check stills and render.
