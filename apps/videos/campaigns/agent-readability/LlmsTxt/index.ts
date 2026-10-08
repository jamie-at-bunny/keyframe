// 14s, pages in, Processing to Generated, serving switched on.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../kit";
import { T } from "./data";
import { LlmsTxt } from "./LlmsTxt";

export default defineVideo({
  id: "AgentLlmsTxt",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: LlmsTxt,
  props: CHROME,
});
