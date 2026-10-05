# The kit (`@keyframe/kit`)

Everything here is shared across videos. Read the source for details; this is the map.
New shared pieces go in `kit/` and get a row here. Pieces shared by one campaign's videos only
stay in that campaign.

## Tokens (`kit/tokens.ts`)

| Export | What |
| --- | --- |
| `STAGE` | `{ width: 1920, height: 1080, fps: 30 }`, spread into `defineVideo` |
| `BG` `SURFACE` `RAISED` | navy stage, card/panel fill, chip/title bar/active fill |
| `INK` `MUTED` `FAINT` `RAIL` | type, secondary type (66%), tertiary (40%), hairlines (18%) |
| `BRAND` | bunny orange `#FF784D` |
| `ON_DARK` | all dark-stage roles, including `green` `blue` `yellow` `red` and `shadow` |
| `LIGHT` `DARK` `shade()` `MAIN` | the full palette, six hues by eight steps (`kit/palette.ts`) |
| `withAlpha(hex, a)` `inkA(a)` `brandA(a)` | translucency |
| `RADIUS` | `xs` 3, `sm` 6, `md` 10 |
| `PRODUCTS` `ProductName` | official product names (`kit/products.ts`); name products through this, never a typed-out string |
| `SHADOW` | the one card shadow |
| `FONT` `MONO` | `"Rubik"`, `"'JetBrains Mono'"` (local files in `kit/fonts/`) |

## Motion (`kit/anim.ts`, `engine/motion.ts`)

| Export | Use |
| --- | --- |
| `progress(frame, start, dur)` | 0..1 eased in and out (cubic). Fades, draws, crossfades, camera moves |
| `travel(frame, start, dur)` | 0..1 softer (sine). Dots and packets along paths |
| `pop(frame, at, { dur = 24 })` | house spring 0..1 with overshoot. Scale and position of entrances |
| `enter(frame, at, dy = 22)` | style object: fade, lift `dy`, scale 0.9 to 1. Spread into `style` |
| `rise(s, dy = 18, from = 0.96)` | the same style from a spring value you already have (`pop()`), for heroes and panels |
| `fade(frame, at, dur)` | style object, opacity only |
| `visible(frame, start, end, dur)` | 0..1 with a fade at both ends |
| `interpolate(v, in[], out[], { easing, left, right })` | general mapping, clamps by default |
| `Easing.inOut(Easing.cubic)`, `Easing.bezier(...)`, `Easing.out(...)` | curves |
| `spring({ frame, fps, config, dur })` | the raw spring, closed form |
| `lerp`, `clamp` | |

## Engine (`engine/time.tsx`, `engine/assets.ts`)

| Export | Use |
| --- | --- |
| `defineVideo({ id, width, height, fps, durationInFrames, Component, background?, sound? })` | a video module's default export |
| `useFrame()` | current frame (local inside a `Sequence`) |
| `useVideo()` | `{ width, height, fps, durationInFrames, transparent }` |
| `<Sequence from dur?>` | shift time for a block; unmounted outside its range |
| `<Fill style?>` | absolute full-frame flex column |
| `<Img src={asset("x.svg")}>` | image that holds the frame until decoded |
| `waitFor(promise)` | hold capture until something async is ready |

## Components

| Component | Notes |
| --- | --- |
| `<Stage eyebrow? logo? background? fadeIn=18 fadeOut=16>` | the navy stage; steps aside in alpha renders |
| `<Bumper product? productLogo? logoPlacement? productLogoSize? theme?>` `bumper({ id, ...props })` | wordmark centre, product at the foot; `bumper()` returns a ready video with sound |
| `<Super from to text top=70 size=56>` | the rise-and-unblur super in the top band |
| `<BunnyLogo variant="light"/"dark" width>` `<ShieldMascot width/height>` | brand art from `public/` |
| `<Card cx cy w h accent label sub? at active?>` | steel card with accent bar, springs in at `at` |
| `<Pill cx top>` | small orange label |
| `<Chip cx cy accent ring?>` | legend/count chip with a dot or ring |
| `<Check at color?>` `<CheckTile at>` `<CheckItem at delay>` | the drawn check, its tile, a checklist row |
| `<ChartCard x y w h title>` `<ChartStat color label value tag?>` `<ChartTag tone>` `CHART` | dashboard charts |
| `<CodeWalkthrough eyebrow title subtitle fileName code steps fontSize? lineHeight? panelTop? stepLen?>` `walkthroughDuration(steps, stepLen)` | guided code walkthrough: editor left, highlight glides block to block, commentary right. Tokens `k s f p t` from `@keyframe/kit/code`, coloured by `SYNTAX` |
| `<TitleBar title>` `TITLE_BAR_H` | the dotted title bar shared by editor and terminal panels |
| `<Trace d progress color width?>` `<Dot d p color>` `pointOnPath(d, p)` `pathLength(d)` | SVG draw-ons and dots along paths |

## Terminal (`kit/terminal.tsx`)

For CLI videos. A `Row` is `{ key, from, until?, lines?, group, render }`: it grows in at `from`,
and if `until` is set it is redrawn away then (the way `prompts` and `ora` replace their line).
`group` is what a camera frames and what stays lit.

| Export | Use |
| --- | --- |
| `<Terminal rows title lit?>` | the panel (1560x800 at `TERM`), scrolls to keep the newest line in view |
| `TERM` | panel geometry: `width height bar padX padTop line fontSize` |
| `s(text, color, bold)` `Segs` `line(segs)` `TERM_COLOR` | coloured text runs |
| `typing(text, start)` | frame each character lands (2 frames a char, 5 after a space) |
| `<Caret busy>` | solid while typing, blinking while waiting |
| `ask()` `answered()` `<Select message choices moves pick>` | `prompts` library states and its arrow-key picker |
| `spinner(text)` | ora's dots spinner as a row renderer |
| `table(rows)` `bar(fraction)` | cli-table3 text style, 20-cell progress bar |
| `layout(rows, frame)` `groupBox()` `groupFocus()` | where rows sit, for cameras and dimming |

## Sound (`@keyframe/kit/sfx`)

`KEYS[0..3]` `KEY_SPACE` `KEY_ENTER` `TICK` `PROGRESS[0..5]` `SUCCESS` `CHECKS[0..1]` `SWISH`
`WHOOSH` `REVEAL` `wobble(i)`, plus the recipes `key()` `tick()` `whoosh()` `reveal()` and primitives `tone()`
`burst()` `bell()`. See [sound.md](sound.md).
