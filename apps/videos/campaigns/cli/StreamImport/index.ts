// 18s: `bunny stream import`, Cloudflare Stream to Bunny Stream, line for line, with sound.
import { defineVideo } from "@keyframe/engine/time";
import { BG, STAGE } from "@keyframe/kit";
import { T } from "./data";
import { StreamImport } from "./StreamImport";
import { SOUND } from "./sound";

export default defineVideo({
  id: "StreamImport",
  ...STAGE,
  durationInFrames: T.end,
  background: BG,
  Component: StreamImport,
  sound: SOUND,
});
