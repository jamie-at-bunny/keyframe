// Every number shown on screen is derived here from capture-data.json: a 40
// hour capture of a UK client fetching a New York origin through two Pull
// Zones, one with Burrow Smart Routing and one direct. Nothing is made up.
import data from "./capture-data.json";

export type Point = { t: number; ms: number };
export type Reroute = Point & { pop: string; at: string };

export const meta = data.meta;
export const directSeries: Point[] = data.series.direct;
export const burrowSeries: Point[] = data.series.burrow;
export const reroutes: Reroute[] = data.reroutes;

// Successful samples per zone. The direct zone has Burrow disabled, so every
// one of its requests left the UK edge.
export const DIRECT_N = data.stats.direct.n;
export const BURROW_VIA_UK_N = data.stats.burrowViaUk.n;
export const REROUTE_N = data.reroutes.length;
export const BURROW_N = BURROW_VIA_UK_N + REROUTE_N;

// Egress PoPs for the rerouted requests, most frequent first.
export const REROUTE_POPS: { pop: string; count: number }[] = Object.entries(
  data.reroutes.reduce<Record<string, number>>((acc, r) => {
    acc[r.pop] = (acc[r.pop] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([pop, count]) => ({ pop, count }))
  .sort((a, b) => b.count - a.count || a.pop.localeCompare(b.pop));

// Median TTFB per zone. The Burrow figure covers requests that left the UK
// edge; the 31 rerouted ones are counted separately.
export const DIRECT_MEDIAN_MS = data.stats.direct.median;
export const BURROW_VIA_UK_MEDIAN_MS = data.stats.burrowViaUk.median;

// Median TTFB gap between the zones on the UK path, rounded to whole ms.
export const MEDIAN_GAP_MS = Math.round(Math.abs(data.stats.burrowViaUk.median - data.stats.direct.median));

// Whole hours of the capture window, for "N reroutes in N hours".
export const CAPTURE_HOURS = Math.floor(data.meta.hours);

const startMs = Date.parse(data.meta.startUtc);
const endMs = Date.parse(data.meta.endUtc);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Wall clock tick marks every 6 hours (UTC) inside the capture window.
export const timeTicks = (() => {
  const step = 6 * 3600 * 1000;
  const ticks: { t: number; time: string; date: string | null }[] = [];
  for (let ms = Math.ceil(startMs / step) * step; ms <= endMs; ms += step) {
    const d = new Date(ms);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const date = d.getUTCHours() === 0 ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : null;
    ticks.push({ t: (ms - startMs) / (endMs - startMs), time: `${hh}:00`, date });
  }
  return ticks;
})();
