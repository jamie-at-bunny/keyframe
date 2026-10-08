import { Card, Chip, Dot, EdgeNode, Label, Svg, Trace } from "@keyframe/components";
import { useFrame } from "@keyframe/engine/time";
import { enter, MONO, progress, RAIL } from "@keyframe/kit";
import { AgentStage, Bar, type Chrome, HTML, MD, MdLine, Panel } from "../kit";
import { T } from "./data";

// One URL, two readers: a browser gets the page, an agent asking for
// text/markdown gets clean Markdown from the same Pull Zone.
const BROWSER = { x: 260, y: 360 };
const AGENT = { x: 260, y: 760 };
const EDGE = { x: 860, y: 560, size: 150 };
const OUT = { x: 1240, w: 560 };
const HTML_Y = 190;
const MD_Y = 630;
const CARD_H = 290;

const IN_X = EDGE.x - EDGE.size / 2;
const OUT_X = EDGE.x + EDGE.size / 2;
const BROWSER_REQ = `M 390 ${BROWSER.y} H 560 Q 600 ${BROWSER.y} 600 ${BROWSER.y + 40} V 520 Q 600 ${EDGE.y} 640 ${EDGE.y} H ${IN_X}`;
const AGENT_REQ = `M 390 ${AGENT.y} H 560 Q 600 ${AGENT.y} 600 ${AGENT.y - 40} V 600 Q 600 ${EDGE.y} 640 ${EDGE.y} H ${IN_X}`;
const HTML_RES = `M ${OUT_X} ${EDGE.y} H 1080 Q 1120 ${EDGE.y} 1120 520 V ${HTML_Y + CARD_H / 2 + 40} Q 1120 ${HTML_Y + CARD_H / 2} 1160 ${HTML_Y + CARD_H / 2} H ${OUT.x}`;
const MD_RES = `M ${OUT_X} ${EDGE.y} H 1080 Q 1120 ${EDGE.y} 1120 600 V ${MD_Y + CARD_H / 2 - 40} Q 1120 ${MD_Y + CARD_H / 2} 1160 ${MD_Y + CARD_H / 2} H ${OUT.x}`;

const MD_LINES = [
  "# Getting started",
  "Install the SDK, then send a request.",
  "## Install",
  "- [Quickstart](https://.../quickstart)",
  "- [API reference](https://.../api)",
];

// The rendered page: browser bar, nav, hero, copy, an image and a sidebar.
const HtmlPage: React.FC<{ at: number }> = ({ at }) => {
  const frame = useFrame();
  const bars: Array<[number, number, number, number, number?]> = [
    [24, 76, 90, 14, 0.3],
    [300, 76, 60, 14],
    [376, 76, 60, 14],
    [452, 76, 60, 14],
    [24, 118, 300, 26, 0.34],
    [24, 160, 340, 12],
    [24, 182, 300, 12],
    [24, 204, 320, 12],
    [392, 118, 144, 104, 0.1],
  ];
  return (
    <Panel x={OUT.x} y={HTML_Y} w={OUT.w} h={CARD_H} tag="text/html" accent={HTML} style={enter(frame, at)}>
      {bars.map(([x, y, w, h, a], i) => (
        <div key={i} style={{ opacity: progress(frame, at + 6 + i * 2, 12) }}>
          <Bar x={x} y={y} w={w} h={h} a={a} />
        </div>
      ))}
    </Panel>
  );
};

const MarkdownDoc: React.FC<{ at: number; typeAt: number }> = ({ at, typeAt }) => {
  const frame = useFrame();
  // Two characters a frame, line after line.
  let budget = Math.max(0, frame - typeAt) * 2;
  return (
    <Panel x={OUT.x} y={MD_Y} w={OUT.w} h={CARD_H} tag="text/markdown" accent={MD} style={enter(frame, at)}>
      <div style={{ padding: "16px 28px" }}>
        {MD_LINES.map((l) => {
          const chars = budget;
          budget = Math.max(0, budget - l.length);
          return <MdLine key={l} text={l} chars={chars} />;
        })}
      </div>
    </Panel>
  );
};

export const TwoReaders: React.FC<Chrome> = (chrome) => {
  const frame = useFrame();
  const browserReq = progress(frame, T.browserReq, 30);
  const htmlRes = progress(frame, T.htmlRes, 30);
  const agentReq = progress(frame, T.agentReq, 30);
  const mdRes = progress(frame, T.mdRes, 30);

  return (
    <AgentStage {...chrome}>
      <Svg>
        <Trace d={BROWSER_REQ} progress={browserReq} color={RAIL} width={3} />
        <Trace d={HTML_RES} progress={htmlRes} color={RAIL} width={3} />
        <Trace d={AGENT_REQ} progress={agentReq} color={RAIL} width={3} />
        <Trace d={MD_RES} progress={mdRes} color={RAIL} width={3} />
        <Dot d={BROWSER_REQ} p={browserReq} color={HTML} />
        <Dot d={HTML_RES} p={htmlRes} color={HTML} />
        <Dot d={AGENT_REQ} p={agentReq} color={MD} />
        <Dot d={MD_RES} p={mdRes} color={MD} />
      </Svg>

      <Card cx={BROWSER.x} cy={BROWSER.y} w={260} h={110} accent={HTML} label="Browser" at={T.browser} />
      <Card cx={AGENT.x} cy={AGENT.y} w={260} h={110} accent={MD} label="AI agent" at={T.agent} />
      <EdgeNode cx={EDGE.x} cy={EDGE.y} at={T.edge} label="Your Pull Zone" />
      <Label x={EDGE.x} y={432} size={26} style={{ fontFamily: MONO, ...enter(frame, T.url) }}>
        /docs/getting-started
      </Label>

      <Chip cx={570} cy={300} accent={HTML} style={enter(frame, T.browserReq - 4)}>
        <span style={{ fontFamily: MONO, fontSize: 24 }}>Accept: text/html</span>
      </Chip>
      <Chip cx={600} cy={820} accent={MD} style={enter(frame, T.agentReq - 4)}>
        <span style={{ fontFamily: MONO, fontSize: 24 }}>Accept: text/markdown</span>
      </Chip>

      <HtmlPage at={T.htmlCard} />
      <MarkdownDoc at={T.mdCard} typeAt={T.mdType} />
    </AgentStage>
  );
};
