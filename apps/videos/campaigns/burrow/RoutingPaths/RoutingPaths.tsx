import { Card, Dot, EdgeNode, Headline, Hi, Label, Svg, Trace } from "@keyframe/components";
import { useFrame } from "@keyframe/engine/time";
import { BRAND, enter, INK, progress, RAIL, travel } from "@keyframe/kit";
import { BurrowStage, type Chrome } from "../Stage";
import { directA, ORIGIN } from "../theme";
import { T } from "./data";

const EDGE = { x: 300, y: 540, size: 150 };
const ORIGIN_CARD = { x: 1620, y: 540, w: 300, h: 128 };
const BACKBONE = { x: 770, y: 760 };
const REGION = { x: 1230, y: 760 };

// Both routes run edge -> origin. The lower one passes behind the two bunny.net
// cards, so a request riding it disappears into each and comes out the far side.
// Both leave the edge tile from its right side, clear of its pill label.
const TOP = "M 375 520 H 400 Q 440 520 440 480 V 340 Q 440 300 480 300 H 1580 Q 1620 300 1620 340 V 476";
const LOW = "M 375 560 H 400 Q 440 560 440 600 V 720 Q 440 760 480 760 H 1580 Q 1620 760 1620 720 V 604";

const TRAFFIC_EVERY = 14;
const TRAFFIC_TRAVEL = 60;
const PROBE_EVERY = 60; // one probe every 2 s
const PROBE_TRAVEL = 45;

const launches = (from: number, to: number, every: number) => {
  const out: number[] = [];
  for (let s = from; s <= to; s += every) out.push(s);
  return out;
};

const TRAFFIC = launches(T.traffic, T.lastLaunch, TRAFFIC_EVERY).map((at) => ({
  at,
  // Traffic moves to the lower route once, then moves back.
  low: at >= T.toLow && at < T.toTop,
}));
const PROBES = launches(T.probes, T.lastLaunch, PROBE_EVERY);

export const RoutingPaths: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();

  const top = progress(frame, T.top, 40);
  const low = progress(frame, T.low, 60);
  const onLow = progress(frame, T.toLow, 30) - progress(frame, T.toTop, 30);

  return (
    <BurrowStage {...chrome}>
      <Svg>
        <Trace d={TOP} progress={top} color={directA(0.45)} width={3} />
        <Trace d={LOW} progress={low} color={RAIL} width={3} />
        <path d={LOW} fill="none" stroke={BRAND} strokeWidth={3} opacity={onLow * 0.8} />

        {TRAFFIC.map(({ at, low: isLow }) => (
          <Dot key={at} d={isLow ? LOW : TOP} p={travel(frame, at, TRAFFIC_TRAVEL)} color={INK} r={7} trail={0.008} />
        ))}
        {/* Burrow never stops measuring the direct path */}
        {PROBES.map((at) => (
          <Dot key={at} d={TOP} p={travel(frame, at, PROBE_TRAVEL)} color={BRAND} r={9} trail={0.01} />
        ))}
      </Svg>

      <Label x={960} y={262} size={30} color={INK} style={enter(frame, T.topLabel)}>
        Healthy path
      </Label>
      <Label x={960} y={866} size={30} color={INK} style={enter(frame, T.lowLabel)}>
        When that path degrades
      </Label>

      <EdgeNode cx={EDGE.x} cy={EDGE.y} at={T.nodes} />
      <Card
        cx={ORIGIN_CARD.x}
        cy={ORIGIN_CARD.y}
        w={ORIGIN_CARD.w}
        h={ORIGIN_CARD.h}
        accent={ORIGIN}
        label="Your origin"
        at={T.nodes + 6}
      />
      <Card
        cx={BACKBONE.x}
        cy={BACKBONE.y}
        w={380}
        h={96}
        accent={BRAND}
        label="bunny.net backbone"
        size={28}
        at={T.backbone}
        active={onLow}
      />
      <Card
        cx={REGION.x}
        cy={REGION.y}
        w={310}
        h={96}
        accent={BRAND}
        label="bunny.net region"
        size={28}
        at={T.region}
        active={onLow}
      />

      <Headline top={140} size={44} style={enter(frame, T.probes)}>
        <Hi color={BRAND}>Burrow</Hi> measures the direct path continuously
      </Headline>
    </BurrowStage>
  );
};
