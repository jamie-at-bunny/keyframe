// 17s, the 40 hour capture, drawn left to right.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../Stage";
import { CaptureTimeline } from "./CaptureTimeline";
import { T } from "./data";

export default defineVideo({
  id: "CaptureTimeline",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: CaptureTimeline,
  props: CHROME,
});
