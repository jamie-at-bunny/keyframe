// render.html's entry: the render target the Playwright renderer drives.
import { mountBridge } from "@keyframe/engine/bridge";
import { VIDEOS } from "./videos";

mountBridge(VIDEOS);
