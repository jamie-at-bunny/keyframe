import { Card, Chip, EdgeNode, Label, mapBox, onMap, Svg, Trace, WORLD_MAP } from "@keyframe/components";
import { asset, Img } from "@keyframe/engine/assets";
import { interpolate } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { enter, pop, progress } from "@keyframe/kit";
import { BURROW_N, BURROW_VIA_UK_N, DIRECT_N, REROUTE_N, REROUTE_POPS } from "../data";
import { BurrowStage, type Chrome } from "../Stage";
import { ORIGIN, originA, REROUTE, ZONE } from "../theme";
import { T } from "./data";

// The world map, zoomed so London and New York sit ~1000 px apart.
const MAP = mapBox(-648, 1071, 4598);
// At this zoom the projection's small fitting error shows, so
// the artwork is nudged until both coastlines meet the surveyed points.
const ART = { dx: 40, dy: 30 };

type Pt = { x: number; y: number };
const UK = onMap(MAP, 51.51, -0.13);
const NYC = onMap(MAP, 40.71, -74.01);

// Where the rerouted requests left bunny.net, surveyed onto the map. The NY PoP
// sits a touch east of the origin so the two marks stay distinct.
const POP_AT: Record<string, Pt> = {
  NY: { x: NYC.x + 30, y: NYC.y + 10 },
  BO: onMap(MAP, 42.36, -71.06),
  ASB: onMap(MAP, 39.04, -77.49),
};
const POPS = REROUTE_POPS.filter((p) => POP_AT[p.pop]);

// Quadratic arcs from the UK edge. The Burrow arc sits just inside the direct
// arc so both stay visible while sharing the same route.
const DIRECT_CTRL = { x: 960, y: 150 };
const BURROW_CTRL = { x: 960, y: 196 };
const BACKBONE_CTRL = { x: 1000, y: 560 };

const arc = (c: Pt, end: Pt) => `M ${UK.x} ${UK.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpPt = (a: Pt, b: Pt, p: number) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });

const DIRECT = arc(DIRECT_CTRL, NYC);
const BURROW = arc(BURROW_CTRL, NYC);

export const RerouteMap: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();

  const direct = progress(frame, T.direct, 45);
  const burrow = progress(frame, T.burrow, 45);
  // The arc swings across on a spring, so it overshoots a touch and settles.
  const shift = pop(frame, T.shift, { damping: 14, stiffness: 90, mass: 0.9, dur: T.land - T.shift });
  const landed = frame >= T.land;
  const ring = interpolate(pop(frame, T.land, { damping: 9, stiffness: 180, dur: 22 }), [0, 1], [0.3, 1]);

  return (
    <BurrowStage {...chrome}>
      <Img
        src={asset(WORLD_MAP)}
        style={{
          position: "absolute",
          left: MAP.x + ART.dx,
          top: MAP.cy - MAP.h / 2 + ART.dy,
          width: MAP.w,
          height: MAP.h,
          maxWidth: "none", // the global img reset would shrink it to the frame
          opacity: 0.3 * progress(frame, T.map, 26),
        }}
      />

      <Svg>
        <Trace d={DIRECT} progress={direct} color={ZONE.direct} width={4} />
        <g>
          <Trace d={BURROW} progress={burrow} color={ZONE.burrow} width={4} />
          {/* the rerouted requests peel off onto the backbone, one arc per PoP */}
          {frame >= T.shift &&
            POPS.map((p) => (
              <path
                key={p.pop}
                d={arc(lerpPt(BURROW_CTRL, BACKBONE_CTRL, shift), lerpPt(NYC, POP_AT[p.pop], shift))}
                fill="none"
                stroke={ZONE.burrow}
                strokeWidth={p.count === POPS[0].count ? 4 : 2.5}
                strokeLinecap="round"
              />
            ))}
        </g>

        {/* bunny.net PoPs beside the origin, each with its short hop in */}
        <g opacity={progress(frame, T.pops, 18)}>
          {POPS.map((p) => {
            const at = POP_AT[p.pop];
            return (
              <g key={p.pop}>
                <line
                  x1={at.x}
                  y1={at.y}
                  x2={NYC.x}
                  y2={NYC.y}
                  stroke={ZONE.burrow}
                  strokeWidth={2}
                  opacity={landed ? 0.8 : 0}
                />
                <circle cx={at.x} cy={at.y} r={7} fill={ZONE.burrow} />
              </g>
            );
          })}
        </g>
        {landed && (
          <circle
            cx={POP_AT.NY.x}
            cy={POP_AT.NY.y}
            r={16}
            fill="none"
            stroke={REROUTE}
            strokeWidth={3}
            transform={`translate(${POP_AT.NY.x} ${POP_AT.NY.y}) scale(${ring}) translate(${-POP_AT.NY.x} ${-POP_AT.NY.y})`}
          />
        )}

        {/* New York origin */}
        <g style={enter(frame, T.nodes)}>
          <line x1={NYC.x} y1={NYC.y} x2={NYC.x} y2={728} stroke={originA(0.6)} strokeWidth={2} />
          <circle cx={NYC.x} cy={NYC.y} r={10} fill={ORIGIN} />
        </g>
      </Svg>

      <Card cx={NYC.x} cy={776} w={330} h={96} accent={ORIGIN} label="New York origin" size={30} at={T.nodes} />
      <EdgeNode cx={UK.x} cy={UK.y} size={96} at={T.nodes} label="UK edge" />

      {/* counts beside their arcs */}
      <Chip cx={960} cy={262} accent={ZONE.direct} style={enter(frame, T.directLabel)}>
        Direct · {DIRECT_N} of {DIRECT_N} via UK
      </Chip>
      <Chip cx={1100} cy={440} accent={ZONE.burrow} style={enter(frame, T.burrowLabel)}>
        Burrow · {BURROW_VIA_UK_N} of {BURROW_N} via UK
      </Chip>
      <Chip cx={1110} cy={620} accent={ZONE.burrow} style={enter(frame, T.rerouteLabel)}>
        Burrow · {REROUTE_N} of {BURROW_N} via bunny.net backbone
      </Chip>
      <Label x={1110} y={684} size={26} style={enter(frame, T.rerouteLabel + 6)}>
        {POPS.map((p) => `${p.pop} ${p.count}`).join(" · ")}
      </Label>
    </BurrowStage>
  );
};
