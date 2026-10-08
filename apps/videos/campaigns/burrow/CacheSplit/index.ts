// 12s, cache hit vs the long leg to the origin.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../Stage";
import { CacheSplit } from "./CacheSplit";
import { T } from "./data";

export default defineVideo({
  id: "CacheSplit",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: CacheSplit,
  props: CHROME,
});
