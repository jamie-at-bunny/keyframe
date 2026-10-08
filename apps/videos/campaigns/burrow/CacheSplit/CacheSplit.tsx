import { Card, Dot, EdgeNode, Headline, Hi, Label, Svg, Trace } from "@keyframe/components";
import { interpolate } from "@keyframe/engine/motion";
import { useFrame } from "@keyframe/engine/time";
import { BRAND, enter, INK, inkA, progress, RADIUS, RAIL, SURFACE, travel } from "@keyframe/kit";
import { BurrowStage, type Chrome } from "../Stage";
import { ORIGIN } from "../theme";
import { T } from "./data";

// Geometry. The edge return spans x 450 -> 200 (250 px); the origin leg spans
// x 555 -> 1500 (945 px), more than three times as wide.
const Y = 560;
const VISITOR = { x: 200, w: 170, h: 150 };
const EDGE = { x: 480, size: 150 };
const ORIGIN_CARD = { x: 1650, w: 300, h: 128 };

const REQUEST = `M ${VISITOR.x + VISITOR.w / 2} ${Y} H ${EDGE.x - EDGE.size / 2}`;
const HIT = `M 450 ${Y - EDGE.size / 2} V 400 H ${VISITOR.x} V ${Y - VISITOR.h / 2}`;
const MISS = `M ${EDGE.x + EDGE.size / 2} ${Y} H ${ORIGIN_CARD.x - ORIGIN_CARD.w / 2}`;

const Visitor: React.FC<{ at: number }> = ({ at }) => {
  const frame = useFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: VISITOR.x - VISITOR.w / 2,
        top: Y - VISITOR.h / 2,
        width: VISITOR.w,
        height: VISITOR.h,
        boxSizing: "border-box",
        borderRadius: RADIUS.md,
        background: SURFACE,
        border: `1px solid ${inkA(0.14)}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        ...enter(frame, at),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: INK }} />
        <div style={{ width: 40, height: 20, borderRadius: "20px 20px 5px 5px", background: INK }} />
      </div>
      <span style={{ color: inkA(0.7), fontSize: 26, fontWeight: 500 }}>Visitor</span>
    </div>
  );
};

export const CacheSplit: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();

  const request = progress(frame, T.request, 30);
  const hit = progress(frame, T.hit, 30);
  // The long leg takes three times as long as the others, so it reads as distance.
  const miss = travel(frame, T.miss, 90);
  const hitOpacity = interpolate(progress(frame, T.dim, 30), [0, 1], [1, 0.3]);
  const bracket = progress(frame, T.caption, 30);

  return (
    <BurrowStage {...chrome}>
      <Svg>
        <Trace d={REQUEST} progress={request} color={RAIL} width={3} />
        <Trace d={MISS} progress={miss} color={RAIL} width={3} />
        <g opacity={hitOpacity}>
          <Trace d={HIT} progress={hit} color={RAIL} width={3} />
          <Dot d={HIT} p={hit} color={INK} />
        </g>
        <Dot d={REQUEST} p={request} color={INK} />
        <Dot d={MISS} p={miss} color={INK} trail={0.004} />

        {/* the leg Burrow works on */}
        <path
          d="M 590 522 V 506 H 1466 V 522"
          fill="none"
          stroke={BRAND}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={bracket}
        />
      </Svg>

      <Visitor at={T.nodes} />
      <EdgeNode cx={EDGE.x} cy={Y} at={T.nodes + 6} />
      <Card
        cx={ORIGIN_CARD.x}
        cy={Y}
        w={ORIGIN_CARD.w}
        h={ORIGIN_CARD.h}
        accent={ORIGIN}
        label="Your origin"
        at={T.origin}
      />

      <div style={{ opacity: hitOpacity }}>
        <Label x={325} y={352} style={enter(frame, T.hitLabel)}>
          Cache hit
        </Label>
      </div>
      <Label x={1028} y={610} style={enter(frame, T.missLabel)}>
        Cache miss
      </Label>

      <Headline top={416} style={{ left: 136, ...enter(frame, T.caption) }}>
        <Hi color={BRAND}>Burrow</Hi> works on this leg
      </Headline>
    </BurrowStage>
  );
};
