// Every line the terminal prints, on cue. Built from the kit's terminal
// pieces; the wording is the CLI's own (see data.ts).
import { useFrame } from "@keyframe/engine/time";
import {
  answered,
  ask,
  bar,
  TERM_COLOR as C,
  Caret,
  line,
  type Row,
  Segs,
  Select,
  s,
  spinner,
  table,
} from "@keyframe/kit";
import {
  COMMAND,
  CONCURRENCY,
  doneAt,
  LIBRARY,
  SOURCE,
  SOURCES,
  SUMMARY,
  sourceTitle,
  T,
  typedAt,
  VIDEOS,
} from "./data";

const Command = () => {
  const frame = useFrame();
  const n = typedAt.filter((at) => frame >= at).length;

  return (
    <>
      <Segs segs={[s("$ ", C.brand), s(COMMAND.slice(0, n))]} />
      {frame < T.enter && <Caret busy={n > 0 && n < COMMAND.length} />}
    </>
  );
};

const confirm = `Import 48 videos into ${LIBRARY}?`;

export const ROWS: Row[] = (() => {
  const rows: Row[] = [
    { key: "cmd", from: 0, group: "cmd", render: () => <Command /> },
    {
      key: "lib-load",
      from: T.libLoad,
      until: T.srcAsk,
      group: "cmd",
      render: spinner("Loading linked video library..."),
    },
    {
      key: "src-done",
      from: T.srcPick,
      group: "src",
      render: line(answered("Where are the videos coming from?", "›", sourceTitle(SOURCE))),
    },
    {
      key: "src-ask",
      from: T.srcAsk,
      until: T.srcPick,
      lines: 1 + SOURCES.length,
      group: "src",
      render: () => (
        <Select
          message="Where are the videos coming from?"
          choices={SOURCES.map(sourceTitle)}
          moves={T.srcMoves}
          pick={T.srcPick}
        />
      ),
    },
    {
      key: "check-spin",
      from: T.checkSpin,
      until: T.discoverSpin,
      group: "tail",
      render: spinner(`Checking ${SOURCE} credentials...`),
    },
    {
      key: "disc-spin",
      from: T.discoverSpin,
      until: T.summary,
      group: "tail",
      render: spinner(`Discovering ${SOURCE} content...`),
    },
    { key: "sum-title", from: T.summary, group: "plan", render: line([s(`${SOURCE} to Bunny Stream`, C.brand, true)]) },
    ...table(SUMMARY).map(
      (segs, i): Row => ({ key: `sum-${i}`, from: T.summary + 4 + i * 3, group: "plan", render: line(segs) }),
    ),
    { key: "sum-gap", from: T.summary + 24, group: "plan", render: () => null },
    { key: "go-done", from: T.confirmAnswer, group: "plan", render: line(answered(confirm, "…", "yes")) },
    {
      key: "go-ask",
      from: T.confirmAsk,
      until: T.confirmAnswer,
      group: "plan",
      render: () => (
        <>
          <Segs segs={ask(confirm, [s("(Y/n)", C.gray)])} />
          <Caret busy={false} />
        </>
      ),
    },
    // runMigration's own log lines, through the CLI logger (ℹ in bunny orange, ✓ in green).
    {
      key: "run-0",
      from: T.engine,
      group: "run",
      render: line([s("ℹ ", C.brand), s(`Discovering ${SOURCE} content`)]),
    },
    {
      key: "run-1",
      from: T.engine + 10,
      group: "run",
      render: line([s("✓ ", C.green), s("Found 0 folders and 48 videos")]),
    },
    {
      key: "run-2",
      from: T.engine + 14,
      group: "run",
      render: line([s("ℹ ", C.brand), s("Checking for existing videos in Bunny...")]),
    },
    {
      key: "run-3",
      from: T.engine + 22,
      group: "run",
      render: line([s("ℹ ", C.brand), s(`Importing 48 videos (concurrency: ${CONCURRENCY})`)]),
    },
  ];

  // The pool: three start at once, and each completion frees a slot. After a
  // video completes the CLI prints the bar, then the next video starts.
  const importing = (k: number, at: number): Row => ({
    key: `imp-${k}`,
    from: at,
    group: "run",
    render: line([s("ℹ ", C.brand), s(`Importing: ${VIDEOS[k]}`)]),
  });
  const runLines: Row[] = [];
  for (let k = 0; k < CONCURRENCY; k++) runLines.push(importing(k, T.engine + 26 + k * 2));
  VIDEOS.forEach((name, k) => {
    const at = doneAt(k);
    runLines.push({
      key: `ok-${k}`,
      from: at,
      group: "run",
      render: line([s("✓ ", C.green), s(`Completed: ${name}`)]),
    });
    // Drawn green throughout: the CLI's quota meter turns yellow and red when
    // full, which would read as a failure here.
    runLines.push({
      key: `bar-${k}`,
      from: at + 1,
      group: "run",
      render: line([s(bar((k + 1) / VIDEOS.length), C.green)]),
    });
    if (k + CONCURRENCY < VIDEOS.length) runLines.push(importing(k + CONCURRENCY, at + 2));
  });
  rows.push(...runLines.sort((a, b) => a.from - b.from));

  return rows;
})();
