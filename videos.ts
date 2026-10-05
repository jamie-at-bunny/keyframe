// The registry: every video the studio lists and the renderer can find, by id.
// Each entry lazy-loads its module, whose default export is a defineVideo().
import type { Video } from "./engine/time";

export type Entry = { id: string; campaign: string; load: () => Promise<{ default: Video }> };

export const VIDEOS: Entry[] = [
  // ── Brand ──
  { id: "TitleCard", campaign: "Brand", load: () => import("./campaigns/brand/TitleCard") },
  ...(["BunnyBumper", "StreamBumper", "ShieldBumper", "ShieldBumperGreen"] as const).map((id) => ({
    id,
    campaign: "Brand",
    load: () => import("./campaigns/brand/Bumper").then((m) => ({ default: m[id] })),
  })),

  // ── Edge Scripting ──
  {
    id: "CacheRefreshPurge",
    campaign: "Edge Scripting",
    load: () => import("./campaigns/edge-scripting/CacheRefreshPurge"),
  },

  // ── CLI ──
  { id: "StreamImport", campaign: "CLI", load: () => import("./campaigns/cli/StreamImport") },
];
