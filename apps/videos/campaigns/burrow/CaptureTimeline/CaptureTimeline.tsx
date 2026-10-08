import { CHART, ChartCard, ChartStat, ChartTag } from "@keyframe/components";
import { Easing, interpolate } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { enter, fade, LIGHT, pop, visible } from "@keyframe/kit";
import {
  BURROW_VIA_UK_MEDIAN_MS,
  burrowSeries,
  CAPTURE_HOURS,
  DIRECT_MEDIAN_MS,
  directSeries,
  type Point,
  REROUTE_N,
  reroutes,
  timeTicks,
} from "../data";
import { BurrowStage, type Chrome } from "../Stage";

// A dashboard chart card on the navy stage. On white the zones take the light
// set of the same hues. Reroutes are dark grey rings, as the dashboard draws its
// third series: yellow sits too close to the Burrow orange on white.
const INK = {
  direct: LIGHT.blue[4], // #1870C6
  burrow: LIGHT.orange[5], // #FF7854
  reroute: LIGHT.grey[6], // #364E65
};

const CARD = { x: 150, y: 124, w: 1620, h: 836 };

// Plot area in card coordinates. 0..500 ms maps to 720..300; values above 500
// clamp to the top gridline.
const X0 = 160;
const X1 = CARD.w - CHART.pad;
const Y0 = 720;
const Y1 = 300;
const MAX_MS = 500;

const x = (t: number) => X0 + t * (X1 - X0);
const y = (ms: number) => Y0 - (Math.min(ms, MAX_MS) / MAX_MS) * (Y0 - Y1);

// The playhead sweeps the full capture over 10 s, then the chart holds.
const DRAW_START = 40;
const DRAW_END = 340;

const playheadAt = (frame: number) =>
  interpolate(frame, [DRAW_START, DRAW_END], [0, 1], { easing: Easing.inOut(Easing.quad) });

// First frame at which the playhead has reached each reroute.
const ringFrames = reroutes.map((r) => {
  for (let f = DRAW_START; f <= DRAW_END; f++) if (playheadAt(f) >= r.t) return f;
  return DRAW_END;
});
const FIRST_RING = Math.min(...ringFrames);

// Polyline of the series up to the playhead, interpolated at the cut.
const pathUpTo = (series: Point[], head: number) => {
  const pts: string[] = [];
  for (let i = 0; i < series.length; i++) {
    const p = series[i];
    if (p.t <= head) {
      pts.push(`${x(p.t).toFixed(1)},${y(p.ms).toFixed(1)}`);
      continue;
    }
    const prev = series[i - 1];
    if (prev) {
      const k = (head - prev.t) / (p.t - prev.t);
      pts.push(`${x(head).toFixed(1)},${y(prev.ms + (p.ms - prev.ms) * k).toFixed(1)}`);
    }
    break;
  }
  return pts.join(" ");
};

const Series: React.FC<{ series: Point[]; head: number; color: string }> = ({ series, head, color }) => (
  <polyline
    points={pathUpTo(series, head)}
    fill="none"
    stroke={color}
    strokeWidth={CHART.line}
    strokeLinejoin="round"
    strokeLinecap="round"
  />
);

export const CaptureTimeline: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();
  const head = playheadAt(frame);
  const axes = fade(frame, 16);

  return (
    <BurrowStage {...chrome}>
      <ChartCard {...CARD} title="Median time to first byte, UK client to New York origin" style={enter(frame, 4, 30)}>
        <div style={{ position: "absolute", left: CHART.pad, top: 142, display: "flex", gap: 110 }}>
          <ChartStat
            color={INK.direct}
            label="Direct zone"
            value={`${DIRECT_MEDIAN_MS.toFixed(1)} ms`}
            tag={<ChartTag>median</ChartTag>}
            style={enter(frame, 20)}
          />
          <ChartStat
            color={INK.burrow}
            label="Burrow zone, via UK"
            value={`${BURROW_VIA_UK_MEDIAN_MS.toFixed(1)} ms`}
            tag={<ChartTag>median</ChartTag>}
            style={enter(frame, 28)}
          />
          {/* the count arrives with the first ring */}
          <ChartStat
            color={INK.reroute}
            ring
            label="Reroutes"
            value={`${REROUTE_N}`}
            tag={<ChartTag>in {CAPTURE_HOURS} hours</ChartTag>}
            style={enter(frame, FIRST_RING)}
          />
        </div>

        <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0 }}>
          <g style={axes} fontSize={22} fill={CHART.axis}>
            {[0, 100, 200, 300, 400, 500].map((ms) => (
              <g key={ms}>
                <line x1={X0} y1={y(ms)} x2={X1} y2={y(ms)} stroke={CHART.grid} strokeWidth={2} strokeLinecap="round" />
                <text x={X0 - 22} y={y(ms) + 8} textAnchor="end">
                  {ms} ms
                </text>
              </g>
            ))}
            {timeTicks.map((tick) => (
              <g key={tick.t}>
                <text x={x(tick.t)} y={Y0 + 44} textAnchor="middle">
                  {tick.time}
                </text>
                {tick.date && (
                  <text x={x(tick.t)} y={Y0 + 76} textAnchor="middle" fill={CHART.label} fontWeight={600}>
                    {tick.date}
                  </text>
                )}
              </g>
            ))}
            <text x={X1} y={Y0 + 76} textAnchor="end">
              UTC
            </text>
          </g>

          {head > 0 && (
            <>
              <Series series={directSeries} head={head} color={INK.direct} />
              <Series series={burrowSeries} head={head} color={INK.burrow} />
            </>
          )}

          {/* playhead, gone once the sweep ends */}
          <line
            x1={x(head)}
            y1={Y1}
            x2={x(head)}
            y2={Y0}
            stroke={LIGHT.grey[2]}
            strokeWidth={2}
            opacity={visible(frame, DRAW_START, DRAW_END + 15)}
          />

          {/* reroutes: pop past full size on a springy bounce, then settle */}
          {reroutes.map((r, i) => {
            const age = frame - ringFrames[i];
            if (age < 0) return null;
            const s = interpolate(pop(frame, ringFrames[i], { damping: 9, stiffness: 180, dur: 22 }), [0, 1], [0.3, 1]);
            const cx = x(r.t);
            const cy = y(r.ms);
            return (
              <circle
                key={r.at}
                cx={cx}
                cy={cy}
                r={10}
                fill={CHART.card}
                stroke={INK.reroute}
                strokeWidth={3}
                opacity={Math.min(1, age / 5)}
                transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}
              />
            );
          })}
        </svg>
      </ChartCard>
    </BurrowStage>
  );
};
