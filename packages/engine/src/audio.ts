// Sound, through Web Audio. A video's sound is a list of cues on the same frame
// numbers as the picture. The studio schedules them live on an AudioContext;
// the renderer mixes the exact same graph in an OfflineAudioContext and hands
// the encoder a WAV. One code path, so the preview is the master.

// A sound is a file in public/ ("sfx/tick.wav") or a synth that builds a
// buffer (see synth() below). Define synths once at module level: the buffer
// is cached against the function.
export type Synth = (sampleRate: number) => Promise<AudioBuffer>;
export type Sound = string | Synth;

export type Cue = {
  at: number; // frame the sound starts on
  sound: Sound;
  volume?: number; // linear gain, 1 = as recorded
  frames?: number; // cut off after this many frames (with a short fade)
  rate?: number; // playback rate; also shifts pitch
  pan?: number; // -1 left .. 1 right
  offset?: number; // seconds into the sound to start from
};

export const cue = (at: number, sound: Sound, volume = 1, opts: Omit<Cue, "at" | "sound" | "volume"> = {}): Cue => ({
  at,
  sound,
  volume,
  ...opts,
});

// ── Buffers ──────────────────────────────────────────────────────────────────
// AudioBuffers belong to no context, so one decode serves preview and render.
const files = new Map<string, Promise<AudioBuffer>>();
const synths = new WeakMap<Synth, Map<number, Promise<AudioBuffer>>>();

const load = (sound: Sound, sampleRate: number): Promise<AudioBuffer> => {
  if (typeof sound === "string") {
    let p = files.get(sound);
    if (!p) {
      const url = `${import.meta.env.BASE_URL}${sound.replace(/^\//, "")}`;
      p = fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`sound ${sound}: HTTP ${r.status}`);

          return r.arrayBuffer();
        })
        .then((b) => new OfflineAudioContext(1, 1, 48000).decodeAudioData(b));
      files.set(sound, p);
    }

    return p;
  }
  const byRate = synths.get(sound) ?? new Map<number, Promise<AudioBuffer>>();
  synths.set(sound, byRate);
  const p = byRate.get(sampleRate) ?? sound(sampleRate);
  byRate.set(sampleRate, p);

  return p;
};

export const loadCues = async (cues: Cue[], sampleRate: number) => {
  const map = new Map<Sound, AudioBuffer>();
  await Promise.all([...new Set(cues.map((c) => c.sound))].map(async (s) => map.set(s, await load(s, sampleRate))));

  return map;
};

// ── Scheduling ───────────────────────────────────────────────────────────────
// Start every cue still sounding at `fromFrame`, with the timeline's
// `fromFrame` landing at context time `when`. Returns a stop function.
export const schedule = (
  ctx: BaseAudioContext,
  dest: AudioNode,
  cues: Cue[],
  buffers: Map<Sound, AudioBuffer>,
  fps: number,
  fromFrame = 0,
  when = ctx.currentTime,
) => {
  const from = fromFrame / fps;
  const sources: AudioBufferSourceNode[] = [];
  for (const c of cues) {
    const buffer = buffers.get(c.sound);
    if (!buffer) continue;
    const rate = c.rate ?? 1;
    const start = c.at / fps;
    const natural = start + (buffer.duration - (c.offset ?? 0)) / rate;
    const end = c.frames === undefined ? natural : Math.min(natural, (c.at + c.frames) / fps);
    if (end <= from) continue;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const gain = ctx.createGain();
    const vol = c.volume ?? 1;
    let node: AudioNode = src.connect(gain);
    if (c.pan) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = c.pan;
      node = node.connect(pan);
    }
    node.connect(dest);

    const t0 = when + Math.max(0, start - from);
    const t1 = when + (end - from);
    gain.gain.setValueAtTime(vol, t0);
    if (c.frames !== undefined && end < natural) {
      // A hard cut clicks; 6ms is inaudible as a fade.
      gain.gain.setValueAtTime(vol, Math.max(t0, t1 - 0.006));
      gain.gain.linearRampToValueAtTime(0, t1);
    }
    src.start(t0, (c.offset ?? 0) + Math.max(0, from - start) * rate);
    src.stop(t1);
    sources.push(src);
  }

  return () => {
    for (const s of sources) s.stop();
  };
};

// ── Offline mix ──────────────────────────────────────────────────────────────
// Frames [from, to) of the timeline, mixed to a stereo buffer.
export const mix = async (cues: Cue[], fps: number, from: number, to: number, sampleRate = 48000) => {
  const length = Math.ceil(((to - from) / fps) * sampleRate);
  const ctx = new OfflineAudioContext(2, length, sampleRate);
  const buffers = await loadCues(cues, sampleRate);
  schedule(ctx, ctx.destination, cues, buffers, fps, from, 0);

  return ctx.startRendering();
};

// 16-bit stereo PCM WAV.
export const toWav = (buf: AudioBuffer) => {
  const ch = [buf.getChannelData(0), buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0)];
  const n = buf.length;
  const out = new DataView(new ArrayBuffer(44 + n * 4));
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  out.setUint32(4, 36 + n * 4, true);
  str(8, "WAVE");
  str(12, "fmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 2, true);
  out.setUint32(24, buf.sampleRate, true);
  out.setUint32(28, buf.sampleRate * 4, true);
  out.setUint16(32, 4, true);
  out.setUint16(34, 16, true);
  str(36, "data");
  out.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++)
    for (const c of ch) {
      out.setInt16(o, Math.round(Math.max(-1, Math.min(1, c[i])) * 32767), true);
      o += 2;
    }

  return new Uint8Array(out.buffer);
};

// ── Synths ───────────────────────────────────────────────────────────────────
// Build a sound from Web Audio nodes: `build` wires up a graph on an offline
// context and the result is rendered once into a buffer.
export const synth =
  (seconds: number, build: (ctx: OfflineAudioContext) => void, channels = 1): Synth =>
  (sampleRate) => {
    const ctx = new OfflineAudioContext(channels, Math.ceil(seconds * sampleRate), sampleRate);
    build(ctx);

    return ctx.startRendering();
  };
