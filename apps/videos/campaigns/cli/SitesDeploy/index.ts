// 15.6s: `bunny sites deploy`, an Astro site built, uploaded and published, line for line, with sound.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { T } from "./data";
import { SitesDeploy } from "./SitesDeploy";
import { SOUND } from "./sound";

export default defineVideo({
  id: "SitesDeploy",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: SitesDeploy,
  sound: SOUND,
});
