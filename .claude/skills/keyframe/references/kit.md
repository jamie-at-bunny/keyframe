# The kit and components (`@keyframe/kit`, `@keyframe/components`)

Everything here is shared across videos. Read the source for details; this is the map.
Tokens, motion helpers, product names and sounds go in `packages/kit/src/` (`@keyframe/kit`); shared
visual pieces go in `packages/components/src/` (`@keyframe/components`). Either way they get a row
here. Pieces shared by one campaign's videos only stay in that campaign.

## Tokens (`@keyframe/kit`, `packages/kit/src/tokens.ts`)

| Export | What |
| --- | --- |
| `STAGE` | `{ width: 1920, height: 1080, fps: 30 }`, spread into `defineVideo` |
| `BG` `SURFACE` `RAISED` | navy stage, card/panel fill, chip/title bar/active fill |
| `INK` `MUTED` `FAINT` `RAIL` | type, secondary type (66%), tertiary (40%), hairlines (18%) |
| `BRAND` | bunny orange `#FF784D` |
| `ON_DARK` | all dark-stage roles, including `green` `blue` `yellow` `red` and `shadow` |
| `LIGHT` `DARK` `shade()` `MAIN` | the full palette, six hues by eight steps (`packages/kit/src/palette.ts`) |
| `withAlpha(hex, a)` `inkA(a)` `brandA(a)` | translucency |
| `RADIUS` | `xs` 3, `sm` 6, `md` 10 |
| `PRODUCTS` `ProductName` | official product names (`packages/kit/src/products.ts`); name products through this, never a typed-out string |
| `SHADOW` | the one card shadow |
| `FONT` `MONO` | `"Rubik"`, `"'JetBrains Mono'"` (local files in `packages/kit/src/fonts/`) |

## Motion (`@keyframe/kit` for `anim.ts`, `@keyframe/engine/motion` for the rest)

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
| `interpolateColors(v, in[], colors[])` | colour fades (hex or rgba in, rgba out), clamped; alpha steps in bytes like a browser |
| `Easing.inOut(Easing.cubic)`, `Easing.bezier(...)`, `Easing.out(...)` | curves |
| `spring({ frame, fps, config, dur })` | the raw spring, closed form |
| `lerp`, `clamp` | |

## Engine (`@keyframe/engine/time`, `@keyframe/engine/assets`)

| Export | Use |
| --- | --- |
| `defineVideo({ id, width, height, fps, durationInFrames, Component, background?, sound? })` | a video module's default export |
| `useFrame()` | current frame (local inside a `Sequence`) |
| `useVideo()` | `{ width, height, fps, durationInFrames, transparent }` |
| `<Sequence from dur?>` | shift time for a block; unmounted outside its range |
| `<Fill style?>` | absolute full-frame flex column |
| `<Img src={asset("x.svg")}>` | image that holds the frame until decoded |
| `waitFor(promise)` | hold capture until something async is ready |

## Components (`@keyframe/components`)

| Component | Notes |
| --- | --- |
| `<Stage eyebrow? logo? background? fadeIn=18 fadeOut=16>` | the navy stage; steps aside in alpha renders |
| `<Bumper product? productLogo? logoPlacement? productLogoSize? theme?>` `bumper({ id, ...props })` | wordmark centre, product at the foot; `bumper()` returns a ready video with sound |
| `<Super from to text top=70 size=56>` | the rise-and-unblur super in the top band |
| `<BunnyLogo variant="light"/"dark" width>` `<ShieldMascot width/height>` | brand art from `apps/videos/public/` |
| `<Card cx cy w h accent label sub? at active?>` | steel card with accent bar, springs in at `at` |
| `<Pill cx top>` | small orange label |
| `<Chip cx cy accent ring?>` | legend/count chip with a dot or ring |
| `<Check at color?>` `<CheckTile at>` `<CheckItem at delay>` | the drawn check, its tile, a checklist row |
| `<ChartCard x y w h title>` `<ChartStat color label value tag?>` `<ChartTag tone>` `CHART` | dashboard charts |
| `<CodeWalkthrough eyebrow title subtitle fileName code steps fontSize? lineHeight? panelTop? stepLen?>` `walkthroughDuration(steps, stepLen)` | guided code walkthrough: editor left, highlight glides block to block, commentary right. Tokens `k s f p t` from `@keyframe/components/code`, coloured by `SYNTAX` |
| `<TitleBar title>` `TITLE_BAR_H` | the dotted title bar shared by editor and terminal panels |
| `<Trace d progress color width?>` `<Dot d p color>` `pointOnPath(d, p)` `pathLength(d)` | SVG draw-ons and dots along paths |
| `<Svg>` | full-frame SVG layer in stage pixels, for rails, arcs and marks under the HTML pieces |
| `<Headline top size? style>` `<Hi color>` | bold centred caption; `Hi` colours a run inside it, usually the product in orange |
| `<Label x y size? color?>` | plain centred label at a point |
| `<EdgeNode cx cy at size? label?>` | the bunny.net edge: rabbit mark in an orange framed tile with a pill beneath |
| `mapBox(x, cy, w)` `onMap(box, lat, lon)` `WORLD_MAP` | the world map art and a surveyed projection that puts a city on it |

## Illustrations (`@keyframe/illustrations`)

Flat navy-and-white art in the house illustration style. Browse them all on the `Illustrations`
sheet in the studio (`#Illustrations@0`). Colours inside the art files are the illustrator's, like the logos; colours
in code around them still come from the palette.

| Export | Use |
| --- | --- |
| `<Illustration name width style?>` | the art alone, at `width` px with its own aspect |
| `<Device name width screenBackground? style?>{children}</Device>` | a device frame with `children` laid out in real px inside its screen, clipped to the glass (curved for the CRTs) |
| `screenBox(name, width)` `illustrationHeight(name, width)` | the screen rectangle and the art height in px at a given width, for layout |
| `ILLUSTRATIONS` `IllustrationName` `DeviceName` | the catalogue; `DeviceName` is the names with a screen |

Devices: `browser` `code-window` `laptop` `monitor` `monitor-wide` `phone` `screen-hanging` `tv`
`tv-crt` `tv-retro` `video-library` `video-player`. Art only: `laptop-angled` `tablet-angled`
`screen-angled` (perspective screens, no live content), `checklist` `dashboard` `document`
`profile-card`, and the scenes `backdrop-streaks` `desk-scene` `folder-scene`.

## Terminal (`@keyframe/components`, `packages/components/src/terminal.tsx`)

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
