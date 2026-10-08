// 29.8s: the 30 starter frameworks funnel into the CLI, a 10s hold on the lit CLI node for a
// talking head (HOLD in data.ts), then `bunny sites deploy` builds, uploads and
// publishes an Astro site line for line, and the CLI hands it to the edge, with sound.
// SitesDeploy ticks the Optimizer box; SitesDeployPlain leaves it out.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { T } from "./data";
import { SitesDeploy } from "./SitesDeploy";
import { sound } from "./sound";

const sitesDeploy = (id: string, optimizer: boolean) =>
  defineVideo({
    id,
    ...STAGE,
    durationInFrames: T.end,
    background: BG,
    Component: SitesDeploy,
    props: { optimizer },
    sound: sound(optimizer),
  });

export const SitesDeployPlain = sitesDeploy("SitesDeployPlain", false);

export default sitesDeploy("SitesDeploy", true);
