// 20s, healthy path, backbone alternative, continuous probes.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../Stage";
import { T } from "./data";
import { RoutingPaths } from "./RoutingPaths";

export default defineVideo({
  id: "RoutingPaths",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: RoutingPaths,
  props: CHROME,
});
