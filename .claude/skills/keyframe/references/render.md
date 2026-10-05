# Previewing, rendering and encoding

```
Vite dev server ── render.html?id=<Id> ──▶ headless Chromium tabs (Playwright)
                                              │  window.__keyframe.seek(frame) → CDP screenshot (PNG)
                                              │  window.__keyframe.audio()     → OfflineAudioContext → WAV
                                              ▼
                              render/encode.swift (AVAssetWriter) ──▶ out/<Id>.mp4 / .mov
```

Everything runs locally on macOS. The Swift encoder compiles itself on first use with `swiftc`
(cached in `.cache/`, rebuilt when the source changes).

## Commands

```console
npm run dev                                          # studio: http://localhost:5199/#<Id>@<frame>
npm run render -- <Id>                           # out/<Id>.mp4, 1920x1080 H.264 + AAC
npm run render -- <Id> --scale 1.5               # 3K (2880x1620), the usual compositing master
npm run render -- <Id> --still 120               # one frame as out/<Id>-120.png
npm run render -- <Id> --frames 200-320          # a range only (sound trimmed to match)
npm run render -- <Id> --codec prores --alpha --scale 1.5   # ProRes 4444 .mov with alpha
npm run lint                                         # typecheck
```

| Flag | Default | Notes |
| --- | --- | --- |
| `--out <file>` | `out/<Id>.mp4` (`.mov` for ProRes) | relative to where you ran the command; `.mov` or `.mp4` picks the container |
| `--scale <n>` | 1 | device pixel ratio; content is rasterised at full resolution, not upscaled |
| `--codec` | `h264` | `h264` delivery, `hevc` smaller (and alpha), `prores` editing masters |
| `--alpha` | off | transparent background; needs `hevc` or `prores`. `<Stage>` and the video's `background` step aside |
| `--bitrate <bps>` | 0.2 bits per pixel per frame | H.264 and HEVC only |
| `--concurrency <n>` | 4 | capture tabs in parallel |
| `--props '<json>'` | | override the video's props for this render, e.g. `'{"product":"Bunny DNS"}'`. The studio takes the same as `?props=` in the URL |
| `--no-audio` | | picture only |

ProRes masters carry LPCM audio; H.264 and HEVC carry 256 kbps AAC. All outputs are tagged BT.709.

## Which output

- Social, web, Slack: H.264 at 1x. An 18s 1080p video renders in about 6 to 8 seconds.
- Handing to an editor for compositing: `--scale 1.5 --codec prores`, add `--alpha` if it goes over other footage.
- Transparent overlay for a web page or Keynote: `--codec hevc --alpha` (plays in Safari and QuickTime).

## Checking a render

Look at it. Extract frames and Read them, and confirm the streams:

```console
ffprobe -v error -show_entries stream=codec_name,width,height,nb_frames,pix_fmt,sample_rate:format=duration -of compact out/<Id>.mp4
ffmpeg -loglevel error -y -i out/<Id>.mp4 -vf "select=eq(n\,120)" -vframes 1 out/check-120.png
```

(ffmpeg here is only a checking tool; the pipeline does not use it.) `nb_frames` must equal the
video's `durationInFrames`. ffmpeg cannot decode the alpha layer of HEVC with alpha, so check alpha on
a ProRes render (`pix_fmt` should be `yuva444p12le`).

## Known limit: audio is not byte-identical

Pictures render byte-identically for the same input. Audio does not quite: Chromium's offline
renderer adds a node's inputs together in a varying order, so wherever sounds overlap, a handful of
samples land 1 bit apart between renders (around -135 dBFS, inaudible). A video with no
overlapping sounds renders identical audio. Don't use an audio checksum to detect changes. Byte
identity would mean mixing outside Web Audio.

## When it goes wrong

| Symptom | Cause and fix |
| --- | --- |
| `No video "<Id>" in videos.ts` | register the video in `videos.ts`, and match the `id` in `defineVideo` |
| a page error printed with `[page]` | the scene threw; open `#<Id>@<frame>` in the studio to see it |
| frames differ from the studio, flicker, or change between renders | something is not a pure function of the frame: `Date.now`, `Math.random`, CSS animation or transition, state carried across frames. See the frame rule in SKILL.md |
| missing image or wrong font in some frames | the asset loaded outside the engine: use `<Img src={asset(...)}>`, or wrap the promise in `waitFor()` |
| `frame is WxH, expected ...` | the page did not lay out at the video size; check `width`/`height` in `defineVideo` |
| `h264 has no alpha channel` | add `--codec hevc` or `--codec prores` |
| `Executable doesn't exist ... ms-playwright` | `npx playwright install chromium` |
| encoder build fails | needs Xcode command line tools (`xcode-select --install`) |
| slow | raise `--concurrency` (one tab per two cores is about right), or render `--frames` while iterating |

## How the pieces fit (for changes to the pipeline)

- `engine/bridge.tsx` mounts the video in `render.html` and exposes `window.__keyframe`: `meta`,
  `seek(frame)` (a synchronous React commit, then waits for fonts, images and anything in
  `waitFor()`), and `audio(from, to)` (base64 WAV).
- `render/render.mjs` starts Vite in-process, opens tabs with `Emulation.setDeviceMetricsOverride`
  for the scale (Playwright's own `deviceScaleFactor` does not reach CDP capture), captures with
  `Page.captureScreenshot`, and streams length-prefixed PNGs to the encoder in frame order.
- `render/encode.swift` reads the stream, reinterprets each untagged PNG as sRGB (otherwise
  ImageIO colour-converts and the navy shifts), draws into BGRA pixel buffers, and feeds video and
  audio inputs concurrently to `AVAssetWriter`.
- The studio (`engine/studio.tsx`) and the renderer both draw through `<Frame>`, which applies
  `engine/frame.css`, a small base reset (border-box, line-height 1.5, block images).
