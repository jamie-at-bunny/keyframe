// The registry: every video the studio lists and the renderer can find, by id.
// Each entry lazy-loads its module, whose default export is a defineVideo().
import type { Entry } from "@keyframe/engine/time";

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
  { id: "SitesDeploy", campaign: "CLI", load: () => import("./campaigns/cli/SitesDeploy") },
  {
    id: "SitesDeployPlain",
    campaign: "CLI",
    load: () => import("./campaigns/cli/SitesDeploy").then((m) => ({ default: m.SitesDeployPlain })),
  },

  // ── Burrow Smart Routing ──
  // Cut in between screen recordings; eyebrow and wordmark off unless --props asks.
  ...(["CacheSplit", "RoutingPaths", "RerouteMap", "CaptureTimeline"] as const).map((id) => ({
    id,
    campaign: "Burrow",
    load: () => import(`./campaigns/burrow/${id}/index.ts`),
  })),

  // ── Agent Readability ──
  ...(["TwoReaders", "StripToMarkdown", "MarkdownUrls", "LlmsTxt"] as const).map((name) => ({
    id: `Agent${name}`,
    campaign: "Agent Readability",
    load: () => import(`./campaigns/agent-readability/${name}/index.ts`),
  })),

  // ── Library ──
  { id: "Illustrations", campaign: "Library", load: () => import("./campaigns/library/Illustrations") },
];
