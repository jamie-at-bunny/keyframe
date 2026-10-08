// Every line the terminal prints, on cue. Built from the kit's terminal
// pieces; the wording is the CLI's own (see data.ts).

import { answered, ask, TERM_COLOR as C, Caret, line, type Row, Segs, s, spinner } from "@keyframe/components";
import { useFrame } from "@keyframe/engine/time";
import {
  BUILD,
  BUILD_ASK,
  BUILD_LOG,
  buildLineAt,
  COMMAND,
  DEPLOY_ID,
  FILES,
  HOST,
  OUT_DIR,
  SIZE,
  T,
  typedAt,
  uploadedCount,
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

// The CLI logger: ℹ in bunny orange, ✓ in green, dim in gray.
const info = (text: string) => line([s("ℹ ", C.brand), s(text)]);

// The upload spinner opens on the file count, then the progress callback
// rewrites it as each file lands.
const uploading = (frame: number, from: number) => {
  const done = uploadedCount(frame);
  const text = done === 0 ? `Uploading ${FILES} files...` : `Uploading ${done}/${FILES} files (${SIZE} total)...`;

  return spinner(text)(frame, from);
};

export const ROWS: Row[] = [
  { key: "cmd", from: 0, group: "cmd", render: () => <Command /> },
  {
    key: "site-load",
    from: T.siteLoad,
    until: T.buildAsk,
    group: "cmd",
    render: spinner("Loading linked site..."),
  },
  { key: "build-done", from: T.buildAnswer, group: "build", render: line(answered(BUILD_ASK, "…", "yes")) },
  {
    key: "build-ask",
    from: T.buildAsk,
    until: T.buildAnswer,
    group: "build",
    render: () => (
      <>
        <Segs segs={ask(BUILD_ASK, [s("(Y/n)", C.gray)])} />
        <Caret busy={false} />
      </>
    ),
  },
  { key: "build-run", from: T.build, group: "build", render: info(`Running build: ${BUILD}`) },
  ...BUILD_LOG.map(
    ({ time, tag, text }, i): Row => ({
      key: `log-${i}`,
      from: buildLineAt(i),
      group: "build",
      render: line(time ? [s(`${time} `, C.gray), s(`${tag} `, C.cyan), s(text)] : [s(text)]),
    }),
  ),
  { key: "out-dir", from: T.outDir, group: "ship", render: info(`Deploying detected output directory: ${OUT_DIR}`) },
  { key: "hash", from: T.hash, until: T.upload, group: "ship", render: spinner("Hashing files...") },
  { key: "upload", from: T.upload, until: T.publish, group: "ship", render: uploading },
  { key: "publish", from: T.publish, until: T.done, group: "ship", render: spinner("Publishing to production...") },
  {
    key: "done",
    from: T.done,
    group: "ship",
    render: line([s("✓ ", C.green), s(`Deployed ${DEPLOY_ID} (${FILES} files, ${SIZE}).`)]),
  },
  { key: "prod", from: T.done + 4, group: "ship", render: info(`Production: https://${HOST}`) },
  { key: "not-found", from: T.done + 8, group: "ship", render: info("Not-found page: 404.html.") },
  { key: "gap", from: T.done + 12, group: "ship", render: () => null },
  {
    key: "hint",
    from: T.done + 14,
    group: "ship",
    render: line([s("  Add a custom production domain: bunny sites domains add <domain>", C.gray)]),
  },
];
