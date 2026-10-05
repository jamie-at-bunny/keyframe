# Sound

Sound is data: a list of cues on the same frame numbers as the picture. The studio plays them live through an `AudioContext`; the renderer mixes the identical graph in an `OfflineAudioContext` and the encoder muxes the WAV. What you hear in the studio is the master, sample for sample.

```ts
// sound.ts
import { cue, type Cue } from "@keyframe/engine/audio";
import { KEYS, KEY_ENTER, SUCCESS, SWISH, wobble } from "@keyframe/kit/sfx";
import { T, typedAt } from "./data";

export const SOUND: Cue[] = [
  ...typedAt.map((at, i) => cue(at, KEYS[(i * 3) % 4], 0.6 + wobble(i), { frames: 4 })),
  cue(T.enter, KEY_ENTER, 0.72, { frames: 4 }),
  cue(T.reveal - 8, SWISH, 0.2),
  cue(T.done + 2, SUCCESS, 0.62, { frames: 48 }),
];
```

Then pass `sound: SOUND` to `defineVideo`. Worked example: `campaigns/cli/StreamImport/sound.ts`.

## Cues

`cue(at, sound, volume = 1, { frames?, rate?, pan?, offset? })`

- `at`: start frame. Key it off a beat in `T`, never a literal, so retiming the picture moves the sound.
- `sound`: a synth from `@keyframe/kit/sfx`, your own `synth()`, or a path in `public/` (`"sfx/whoosh.wav"`, any format Chromium decodes: wav, mp3, m4a, ogg).
- `volume`: linear gain. Effects sit around 0.2 to 0.7.
- `frames`: cut off after this many frames, with a 6ms fade so it never clicks. Use it to keep a long tail from bleeding into the next beat.
- `rate`: playback rate (also pitch). `pan`: -1 to 1. `offset`: seconds into the sound.

A music bed or voiceover is one long cue at frame 0 (`cue(0, "music.mp3", 0.15)`). For a bed that ducks, split it into cues with `offset`, or write a synth that applies the envelope.

## The house set (`@keyframe/kit/sfx`)

| Sound | Use | Typical volume |
| --- | --- | --- |
| `KEYS[0..3]` | typing; rotate `(i * 3) % 4` and add `wobble(i)` so it never machine-guns | 0.6 |
| `KEY_SPACE` `KEY_ENTER` | space bar, return | 0.62, 0.7 |
| `TICK` | a picker step, a toggle | 0.45 |
| `PROGRESS[0..5]` | one per finished item, climbing in pitch as something fills | 0.22 |
| `SUCCESS` | the moment it is done: two bell notes a fifth apart | 0.6 |
| `CHECKS[0..1]` | checklist ticks, rising | 0.5 |
| `SWISH` | a camera move, a panel sliding | 0.2 to 0.25 |
| `WHOOSH` | a scene change | 0.35 to 0.4 |
| `REVEAL` | a hero landing (the bumper's wordmark): broad stereo air peaking 0.4s in, with a low bloom. Start it 12 frames before the landing; `reveal({ peak, len })` for other timings | 0.3 to 0.35 |

## Designing a sound

Build it from Web Audio nodes in `kit/sfx.ts` (or the campaign folder if it is one-off), using the primitives there:

```ts
import { burst, make, tone } from "@keyframe/kit/sfx";
export const BLIP = make(0.12, (ctx) => {
  tone(ctx, ctx.destination, { f: 1760, amp: 0.7, tau: 0.02, attack: 0.001 });
  burst(ctx, ctx.destination, { amp: 0.1, tau: 0.001, hp: 4000, seed: 3 });
});
```

- `make(seconds, build, { peakDb, fadeInMs, fadeOutMs })` renders the graph once, normalises it and fades the edges. `synth()` in the engine is the same without the post-processing.
- `tone()` is a sine (or any `OscillatorType`) with an attack and exponential decay; `chirp` drops it into pitch like a struck body. `burst()` is seeded, high-passed noise for clicks and contacts. `bell()` stacks decaying partials. `whoosh()` sweeps a band-pass over noise.
- Define sounds at module level. The rendered buffer is cached against the function, so a sound built inside a component or a `.map` callback is rebuilt every time.
- Seed every noise source. `Math.random()` would make each render sound different.

## Taste

- **Sparse.** Sound the moments the eye is already on: input, a reveal, a completion. Not every element that enters, and not a second hit for text that follows a hero (a bumper's product name lands silent).
- **Quiet.** Effects support the picture; the loudest thing should be the payoff (`SUCCESS`, a final `WHOOSH`). The StreamImport mix peaks around -9 dB with a mean near -29 dB, which is a good target for effects-only clips.
- **Never stacked.** Two identical sounds on one frame read as one louder sound. Drop duplicates (StreamImport skips completions that share a frame).
- **Varied.** Repeats get a different voice or `wobble(i)` on volume.
- **Early, slightly.** A whoosh or swish leads its motion by 2 to 8 frames so the swell peaks as the move does. Clicks land on the frame.
- **Tails cut.** Give `frames` to anything that would ring into the next beat.

## Check it

Play it in the studio (`npm run dev`, space to play, M to mute). After rendering, check level and timing:

```console
ffmpeg -i out/<Id>.mp4 -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"
ffmpeg -i out/<Id>.mp4 -af "silencedetect=n=-45dB:d=0.02" -vn -f null - 2>&1 | grep silence_end
```

`silence_end` times are onsets: frame `at` should land at `at / fps` seconds. `max_volume` must stay below 0 dB (clipping).
