// Sound for StreamImport, from the kit's Web Audio set. Every cue keys off the
// same beat frames as the picture, so retiming a beat in data.ts moves its
// sound with it.
import { type Cue, cue } from "@keyframe/engine/audio";
import { CHECKS, KEY_ENTER, KEY_SPACE, KEYS, PROGRESS, SUCCESS, SWISH, TICK, WHOOSH, wobble } from "@keyframe/kit/sfx";
import { COMMAND, doneAt, T, typedAt, VIDEOS, WELCOME } from "./data";

// The cue volumes set the balance; LEVEL sets the whole mix, 3 dB down.
const LEVEL = Math.SQRT1_2;

const CUES: Cue[] = [
  // Typing: four key voices in rotation, a deeper space bar, then return.
  ...typedAt.map((at, i) =>
    COMMAND[i] === " "
      ? cue(at, KEY_SPACE, 0.62, { frames: 4 })
      : cue(at, KEYS[(i * 3) % 4], 0.6 + wobble(i), { frames: 4 }),
  ),
  cue(T.enter, KEY_ENTER, 0.72, { frames: 4 }),

  // The source picker: a tick per step, return to pick.
  ...T.srcMoves.map((at) => cue(at, TICK, 0.45, { frames: 3 })),
  cue(T.srcPick - 6, KEY_ENTER, 0.66, { frames: 4 }),

  // The camera moves to the plan.
  cue(T.summary - 8, SWISH, 0.2, { frames: 15 }),

  // Return on "Import 48 videos into bunny.net?", then a swish as the camera pulls wide.
  cue(T.confirmAnswer - 4, KEY_ENTER, 0.66, { frames: 4 }),
  cue(T.engine - 2, SWISH, 0.24, { frames: 15 }),

  // A quiet tick per finished video, climbing in pitch as the import fills.
  // Late completions can share a frame; one tick each, so they never stack louder.
  ...VIDEOS.flatMap((_, k) =>
    k > 0 && doneAt(k) === doneAt(k - 1)
      ? []
      : [cue(doneAt(k), PROGRESS[Math.min(5, Math.floor((k / VIDEOS.length) * 6))], 0.22, { frames: 3 })],
  ),

  // 48 of 48: the chime lands with the card's check.
  cue(T.lastDone + 2, SUCCESS, 0.62, { frames: 48 }),

  // Into the welcome, and a rising ping as each checklist item ticks.
  cue(T.outro - 4, WHOOSH, 0.38, { frames: 25 }),
  ...WELCOME.items.map((at, i) => cue(at + WELCOME.checkDelay, CHECKS[i], 0.5, { frames: 28 })),
];

export const SOUND = CUES.map((c) => ({ ...c, volume: (c.volume ?? 1) * LEVEL }));
