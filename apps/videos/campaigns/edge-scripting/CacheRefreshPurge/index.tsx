// ~11s: one URL that serves (GET), rebuilds (POST) and purges (DELETE) its own cached payload.

import { CodeWalkthrough, walkthroughDuration } from "@keyframe/components";
import { defineVideo } from "@keyframe/engine/time";
import { BG, PRODUCTS, STAGE } from "@keyframe/kit";
import { CACHE_PURGE_CODE, CACHE_PURGE_STEP_LEN, CACHE_PURGE_STEPS } from "./data";

const CacheRefreshPurge = () => (
  <CodeWalkthrough
    eyebrow={PRODUCTS.edgeScripting}
    title="Refresh & purge"
    subtitle="One URL that serves, rebuilds and clears its own cached payload."
    fileName="index.ts"
    code={CACHE_PURGE_CODE}
    steps={CACHE_PURGE_STEPS}
    stepLen={CACHE_PURGE_STEP_LEN}
    fontSize={21}
    lineHeight={25}
    panelWidth={980}
    panelTop={272}
  />
);

export default defineVideo({
  id: "CacheRefreshPurge",
  ...STAGE,
  durationInFrames: walkthroughDuration(CACHE_PURGE_STEPS.length, CACHE_PURGE_STEP_LEN),
  background: BG,
  Component: CacheRefreshPurge,
});
