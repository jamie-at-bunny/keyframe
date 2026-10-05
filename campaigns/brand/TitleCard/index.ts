// 4s: the starter title card. Copy this folder to begin a new video.
import { cue } from "@keyframe/engine/audio";
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHECKS, WHOOSH } from "@keyframe/kit/sfx";
import { T } from "./data";
import { TitleCard } from "./TitleCard";

export default defineVideo({
  id: "TitleCard",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: TitleCard,
  sound: [cue(T.title - 6, WHOOSH, 0.35), cue(T.sub + 4, CHECKS[0], 0.3)],
});
