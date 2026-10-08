// A one-frame reference sheet of @keyframe/illustrations, for the studio.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { T } from "./data";
import { Illustrations } from "./Illustrations";

export default defineVideo({
  id: "Illustrations",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: Illustrations,
});
