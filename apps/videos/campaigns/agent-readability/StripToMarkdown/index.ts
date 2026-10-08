// 11s, boilerplate falls away, content becomes Markdown.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../kit";
import { T } from "./data";
import { StripToMarkdown } from "./StripToMarkdown";

export default defineVideo({
  id: "AgentStripToMarkdown",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: StripToMarkdown,
  props: CHROME,
});
