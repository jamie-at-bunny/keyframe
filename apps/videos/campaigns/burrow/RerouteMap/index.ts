// 14s, UK edge to New York origin, the 31 reroutes.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../Stage";
import { T } from "./data";
import { RerouteMap } from "./RerouteMap";

export default defineVideo({
  id: "RerouteMap",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: RerouteMap,
  props: CHROME,
});
