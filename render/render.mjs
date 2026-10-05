// Render a Keyframe video: Vite serves it, headless Chromium (Playwright) seeks and
// captures every frame, Web Audio mixes the sound offline, and AVFoundation
// encodes the lot.
//
//   npm run render -- <Id> [options]
//
//   --out <file>        default out/<Id>.mp4 in this package (.mov for prores)
//   --scale <n>         device pixel ratio; 1.5 turns 1920x1080 into 3K
//   --codec <c>         h264 (default) | hevc | prores
//   --alpha             transparent background (hevc or prores)
//   --bitrate <bps>     default 0.2 bits per pixel per frame
//   --frames <a-b>      render a range only (inclusive)
//   --still <n>         write one frame as a PNG and stop
//   --concurrency <n>   browser tabs capturing in parallel (default 4)
//   --props '<json>'    override the video's props, e.g. '{"product":"Bunny DNS"}'
//   --no-audio          picture only
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, ".."); // the Keyframe package
// npm runs scripts from the package root; resolve --out against where the
// command was typed instead.
const CWD = process.env.INIT_CWD ?? process.cwd();

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--") && !isValue(a));
function isValue(a) {
  const i = args.indexOf(a);

  return i > 0 && args[i - 1].startsWith("--") && !["--alpha", "--no-audio"].includes(args[i - 1]);
}
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);

  return i >= 0 ? args[i + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

if (!id) {
  console.error(
    "usage: npm run render -- <Id> [--out file] [--scale 1.5] [--codec h264|hevc|prores] [--alpha] [--still n]",
  );
  process.exit(1);
}
const scale = Number(opt("scale", "1"));
const codec = opt("codec", "h264");
const alpha = has("alpha");
const still = opt("still");
const concurrency = Math.max(1, Number(opt("concurrency", "4")));
const props = opt("props");
if (props) {
  try {
    JSON.parse(props);
  } catch {
    console.error(`--props is not valid JSON: ${props}`);
    process.exit(1);
  }
}
const EXT = { h264: ".mp4", hevc: ".mp4", prores: ".mov" };
const defaultOut = path.join(ROOT, "out", still !== undefined ? `${id}-${still}.png` : `${id}${EXT[codec] ?? ".mp4"}`);
const out = opt("out") ? path.resolve(CWD, opt("out")) : defaultOut;
if (alpha && codec === "h264" && still === undefined) {
  console.error("--alpha needs --codec hevc or prores (h264 has no alpha channel)");
  process.exit(1);
}

// ── Encoder ──────────────────────────────────────────────────────────────────
// Compiled once with swiftc and cached by source hash.
const encoderBinary = () => {
  const src = path.join(HERE, "encode.swift");
  const hash = createHash("sha1").update(readFileSync(src)).digest("hex").slice(0, 12);
  const bin = path.join(ROOT, ".cache", `encode-${hash}`);
  if (!existsSync(bin)) {
    mkdirSync(path.dirname(bin), { recursive: true });
    process.stderr.write("Building the AVFoundation encoder... ");
    execFileSync("swiftc", ["-O", "-swift-version", "5", src, "-o", bin], { stdio: ["ignore", "ignore", "inherit"] });
    process.stderr.write("done\n");
  }

  return bin;
};

// ── Progress ─────────────────────────────────────────────────────────────────
const started = Date.now();
const report = (done, total) => {
  const secs = (Date.now() - started) / 1000;
  const fps = done / Math.max(secs, 0.001);
  const bar = "█".repeat(Math.round((done / total) * 30)).padEnd(30, "░");
  process.stderr.write(`\r  ${bar} ${done}/${total}  ${fps.toFixed(1)} fps  ${secs.toFixed(1)}s `);
};

// ── Run ──────────────────────────────────────────────────────────────────────
const server = await createServer({
  configFile: path.join(ROOT, "vite.config.ts"),
  logLevel: "error",
  server: { port: 0, strictPort: false },
});
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--force-color-profile=srgb"] });

const cleanup = async () => {
  await browser.close().catch(() => {});
  await server.close().catch(() => {});
};

try {
  // A tab with the video mounted at its native size. Probe the size first,
  // then open the capture tabs at exactly that viewport.
  const openTab = async (viewport) => {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error(`\n[page] ${e.message}`));
    page.on("console", (m) => m.type() === "error" && console.error(`\n[console] ${m.text()}`));
    // Device scale through CDP: the context option does not reach CDP capture,
    // and this rasterises at the full resolution rather than upscaling.
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: scale, mobile: false });
    if (alpha) await cdp.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
    await page.goto(
      `${base}render.html?id=${encodeURIComponent(id)}${alpha ? "&alpha" : ""}${props ? `&props=${encodeURIComponent(props)}` : ""}`,
    );
    await page.waitForFunction(() => window.__keyframe || window.__keyframeError, null, { timeout: 60_000 });
    const err = await page.evaluate(() => window.__keyframeError);
    if (err) throw new Error(err);
    const capture = async (frame) => {
      await page.evaluate((f) => window.__keyframe.seek(f), frame);
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "png",
        optimizeForSpeed: true,
        fromSurface: true,
      });

      return Buffer.from(data, "base64");
    };

    return { page, capture, meta: await page.evaluate(() => window.__keyframe.meta) };
  };

  const probe = await openTab({ width: 1920, height: 1080 });
  const { meta } = probe;
  const viewport = { width: meta.width, height: meta.height };
  await probe.page.context().close();

  mkdirSync(path.dirname(out), { recursive: true });

  if (still !== undefined) {
    const tab = await openTab(viewport);
    const frame = Math.max(0, Math.min(meta.durationInFrames - 1, Number(still)));
    writeFileSync(out, await tab.capture(frame));
    console.error(`${path.relative(CWD, out)}  (frame ${frame}, ${meta.width * scale}x${meta.height * scale})`);
  } else {
    const [a, b] = (opt("frames") ?? `0-${meta.durationInFrames - 1}`).split("-").map(Number);
    const first = Math.max(0, a);
    const last = Math.min(meta.durationInFrames - 1, b);
    const total = last - first + 1;
    const W = Math.round(meta.width * scale);
    const H = Math.round(meta.height * scale);
    console.error(`${meta.id}  ${W}x${H}  ${meta.fps}fps  ${total} frames  ${codec}${alpha ? " + alpha" : ""}`);

    const tabs = await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => openTab(viewport)));

    // Sound: the whole mix rendered offline in the page, trimmed to the range.
    let wav;
    if (meta.hasSound && !has("no-audio")) {
      const b64 = await tabs[0].page.evaluate(([from, to]) => window.__keyframe.audio(from, to), [first, last + 1]);
      if (b64) {
        wav = path.join(tmpdir(), `keyframe-${meta.id}-${process.pid}.wav`);
        writeFileSync(wav, Buffer.from(b64, "base64"));
      }
    }

    const encoder = spawn(
      encoderBinary(),
      [
        "--out",
        out,
        "--width",
        String(W),
        "--height",
        String(H),
        "--fps",
        String(meta.fps),
        "--codec",
        codec,
        ...(alpha ? ["--alpha"] : []),
        ...(opt("bitrate") ? ["--bitrate", opt("bitrate")] : []),
        ...(wav ? ["--audio", wav] : []),
      ],
      { stdio: ["pipe", "pipe", "inherit"] },
    );
    const encoded = new Promise((resolve, reject) => {
      encoder.on("error", reject);
      encoder.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`encoder exited with ${code}`))));
    });

    // Tabs capture frames round-robin; the writer hands them to the encoder in
    // order. A tab waits if it gets too far ahead of the writer.
    const ready = new Map();
    let next = first;
    let wake = () => {};
    const AHEAD = concurrency * 4;
    const worker = async (tab, w) => {
      for (let f = first + w; f <= last; f += tabs.length) {
        while (f - next > AHEAD) await new Promise((r) => setTimeout(r, 5));
        ready.set(f, await tab.capture(f));
        wake();
      }
    };
    const writer = (async () => {
      while (next <= last) {
        const png = ready.get(next);
        if (!png) {
          // woken by the next capture, or a short poll in case one slipped past
          await new Promise((r) => {
            wake = r;
            setTimeout(r, 20);
          });
          continue;
        }
        ready.delete(next);
        const head = Buffer.alloc(4);
        head.writeUInt32BE(png.length);
        if (!encoder.stdin.write(Buffer.concat([head, png]))) await once(encoder.stdin, "drain");
        next++;
        report(next - first, total);
      }
      encoder.stdin.end();
    })();

    await Promise.all([...tabs.map(worker), writer]);
    await encoded;
    if (wav) rmSync(wav, { force: true });
    process.stderr.write("\n");
    console.error(`${path.relative(CWD, out)}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  }
} finally {
  await cleanup();
}
