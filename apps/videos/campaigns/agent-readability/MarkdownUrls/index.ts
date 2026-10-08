// 7s, /docs/ to /docs/index.md, /about to /about.index.md.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../kit";
import { T } from "./data";
import { MarkdownUrls } from "./MarkdownUrls";

export default defineVideo({
  id: "AgentMarkdownUrls",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: MarkdownUrls,
  props: CHROME,
});
