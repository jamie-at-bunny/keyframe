// Sound for SitesDeploy, from the kit's Web Audio set. Every cue keys off the
// same beat frames as the picture, so retiming a beat in data.ts moves its
// sound with it.
import { type Cue, cue } from "@keyframe/engine/audio";
import { CHECKS, KEY_ENTER, KEY_SPACE, KEYS, PROGRESS, SUCCESS, SWISH, TICK, WHOOSH, wobble } from "@keyframe/kit/sfx";
import { BUILD_LOG, buildLineAt, COMMAND, FILES, PACKET_DUR, PACKETS, packetAt, T, typedAt, uploadedAt } from "./data";
import { PICKED_LANDS } from "./diagram";

// The cue volumes set the balance; LEVEL sets the whole mix, 3 dB down.
const LEVEL = Math.SQRT1_2;

const CUES: Cue[] = [
  // The mosaic: a tick as this run's framework lights, a swish as the tiles
  // stream off, and a soft tick as the last one lands in the CLI.
  cue(T.pick, TICK, 0.4, { frames: 3 }),
  cue(T.funnel - 2, SWISH, 0.22, { frames: 15 }),
  cue(PICKED_LANDS, TICK, 0.36, { frames: 3 }),
  cue(T.term - 2, SWISH, 0.2, { frames: 15 }),

  // Typing: four key voices in rotation, a deeper space bar, then return.
  ...typedAt.map((at, i) =>
    COMMAND[i] === " "
      ? cue(at, KEY_SPACE, 0.62, { frames: 4 })
      : cue(at, KEYS[(i * 3) % 4], 0.6 + wobble(i), { frames: 4 }),
  ),
  cue(T.enter, KEY_ENTER, 0.72, { frames: 4 }),

  // Return on the build prompt, then a soft tick per line of build log.
  cue(T.buildAnswer - 4, KEY_ENTER, 0.66, { frames: 4 }),
  ...BUILD_LOG.map((_, i) => cue(buildLineAt(i), TICK, 0.28, { frames: 3 })),

  // The camera moves to the deploy.
  cue(T.outDir - 8, SWISH, 0.2, { frames: 15 }),

  // A quiet tick per uploaded file, climbing in pitch as the upload fills.
  // Files that land on the same frame share one tick, so they never stack louder.
  ...Array.from({ length: FILES }, (_, k) => k).flatMap((k) =>
    k > 0 && uploadedAt(k) === uploadedAt(k - 1)
      ? []
      : [cue(uploadedAt(k), PROGRESS[Math.min(5, Math.floor((k / FILES) * 6))], 0.22, { frames: 3 })],
  ),

  // Live: the chime lands with the card's check.
  cue(T.done, SUCCESS, 0.62, { frames: 48 }),

  // The terminal folds into the CLI, and each file lands on the edge.
  cue(T.handoff - 2, SWISH, 0.2, { frames: 15 }),
  ...Array.from({ length: PACKETS }, (_, i) =>
    cue(packetAt(i) + PACKET_DUR, PROGRESS[Math.min(5, i)], 0.18, { frames: 3 }),
  ),

  // Into the close.
  cue(T.outro - 4, WHOOSH, 0.38, { frames: 25 }),
];

// Optimizer ticked: its own check.
const OPTIMIZER: Cue[] = [cue(T.optimizerCheck, CHECKS[1], 0.5, { frames: 12 })];

export const sound = (optimizer: boolean) =>
  [...CUES, ...(optimizer ? OPTIMIZER : [])].map((c) => ({ ...c, volume: (c.volume ?? 1) * LEVEL }));
