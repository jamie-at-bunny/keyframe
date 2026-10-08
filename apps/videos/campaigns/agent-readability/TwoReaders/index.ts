// 12s, one URL: HTML for the browser, Markdown for the agent.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { CHROME } from "../kit";
import { T } from "./data";
import { TwoReaders } from "./TwoReaders";

export default defineVideo({
  id: "AgentTwoReaders",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: TwoReaders,
  props: CHROME,
});
