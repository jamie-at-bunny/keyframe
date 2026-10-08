// The house sound set, synthesised with Web Audio nodes: oscillators, seeded
// noise, filters and envelopes. Same recipes as scripts/make-sfx.mjs, so the
// sounds are ours, reproducible, and tweakable in code. Every export is a
// Sound you can drop straight into a cue().
import { type Synth, synth } from "@keyframe/engine/audio";

// ── Building blocks ──────────────────────────────────────────────────────────
type Ctx = OfflineAudioContext;

const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;

  return seed / 2 ** 32;
};

const noiseBuffer = (ctx: Ctx, seconds: number, seed: number) => {
  const buf = ctx.createBuffer(1, Math.ceil(seconds * ctx.sampleRate), ctx.sampleRate);
  const r = rng(seed);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = r() * 2 - 1;

  return buf;
};

// Sine with a short attack and an exponential decay. `chirp` starts it a
// little sharp and drops it to pitch in a few milliseconds (a struck body).
export const tone = (
  ctx: Ctx,
  dest: AudioNode,
  {
    at = 0,
    f,
    amp = 1,
    tau,
    attack = 0.001,
    chirp = 0,
  }: { at?: number; f: number; amp?: number; tau: number; attack?: number; chirp?: number },
) => {
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(f * (1 + chirp), at);
  if (chirp) osc.frequency.setTargetAtTime(f, at, 0.004);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(amp, at + attack);
  g.gain.setTargetAtTime(0, at + attack, tau);
  osc.connect(g).connect(dest);
  osc.start(at);
};

// High-passed noise with a fast decay: the tick of a key or a contact.
export const burst = (
  ctx: Ctx,
  dest: AudioNode,
  { at = 0, amp = 1, tau, hp = 2000, seed = 1 }: { at?: number; amp?: number; tau: number; hp?: number; seed?: number },
) => {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, Math.min(1, tau * 12), seed);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(amp, at);
  g.gain.setTargetAtTime(0, at, tau);
  src.connect(filter).connect(g).connect(dest);
  src.start(at);
};

// A soft bell: a few partials, the upper ones dying first.
export const bell = (
  ctx: Ctx,
  dest: AudioNode,
  { at = 0, f, amp = 1, tau }: { at?: number; f: number; amp?: number; tau: number },
) => {
  for (const [k, a] of [
    [1, 1],
    [2, 0.22],
    [3.01, 0.07],
    [4.2, 0.03],
  ])
    tone(ctx, dest, { at, f: f * k, amp: amp * a, tau: tau / k, attack: 0.004 });
};

const lowpass = (ctx: Ctx, fc: number) => {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = fc;
  f.Q.value = 0.5;
  f.connect(ctx.destination);

  return f;
};

// Render, then normalise to a peak and fade the edges so nothing clicks.
export const make = (
  seconds: number,
  build: (ctx: Ctx) => void,
  { peakDb = -3, fadeInMs = 0.5, fadeOutMs = 8, channels = 1 } = {},
): Synth => {
  const raw = synth(seconds, build, channels);

  return async (sampleRate) => {
    const buf = await raw(sampleRate);
    const data = Array.from({ length: buf.numberOfChannels }, (_, c) => buf.getChannelData(c));
    const peak = data.reduce((m, x) => x.reduce((mm, v) => Math.max(mm, Math.abs(v)), m), 0) || 1;
    const gain = 10 ** (peakDb / 20) / peak;
    const a = Math.max(1, Math.round((fadeInMs / 1000) * sampleRate));
    const b = Math.max(1, Math.round((fadeOutMs / 1000) * sampleRate));
    for (const x of data) for (let i = 0; i < x.length; i++) x[i] *= gain * Math.min(1, i / a, (x.length - 1 - i) / b);

    return buf;
  };
};

// ── Recipes ──────────────────────────────────────────────────────────────────
// A low-profile mechanical key: bright contact click, short plastic body, soft
// low thock as it bottoms out, then a quieter click on release.
export const key = ({
  body,
  thock,
  seed,
  bright = 1,
  len = 0.075,
}: {
  body: number;
  thock: number;
  seed: number;
  bright?: number;
  len?: number;
}) =>
  make(len, (ctx) => {
    const out = lowpass(ctx, 9000);
    burst(ctx, out, { amp: 0.55 * bright, tau: 0.0012, hp: 3000, seed });
    tone(ctx, out, { f: body, amp: 0.32, tau: 0.005, chirp: 0.25 });
    tone(ctx, out, { f: thock, amp: 0.5, tau: 0.016, attack: 0.0015 });
    burst(ctx, out, { at: 0.038, amp: 0.12 * bright, tau: 0.001, hp: 3500, seed: seed + 7 });
  });

// UI tick: a tiny bright blip, for a picker step or a finished item.
export const tick = ({ f, seed, len = 0.04, tau = 0.006 }: { f: number; seed: number; len?: number; tau?: number }) =>
  make(len, (ctx) => {
    tone(ctx, ctx.destination, { f, amp: 0.7, tau, attack: 0.0006 });
    tone(ctx, ctx.destination, { f: f * 2.01, amp: 0.15, tau: tau * 0.6, attack: 0.0006 });
    burst(ctx, ctx.destination, { amp: 0.12, tau: 0.0008, hp: 4000, seed });
  });

// Air past the mic: noise through a band pass that sweeps up and back down,
// swelling to a peak a little past halfway.
export const whoosh = ({
  len,
  from,
  to,
  seed,
  q = 1.1,
}: {
  len: number;
  from: number;
  to: number;
  seed: number;
  q?: number;
}) =>
  make(
    len,
    (ctx) => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, len, seed);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = q;
      const env = ctx.createGain();
      const peakAt = 0.58;
      const steps = 64;
      const freq = new Float32Array(steps);
      const gain = new Float32Array(steps);
      for (let i = 0; i < steps; i++) {
        const p = i / (steps - 1);
        const s =
          p < peakAt ? Math.sin((p / peakAt) * (Math.PI / 2)) : Math.cos(((p - peakAt) / (1 - peakAt)) * (Math.PI / 2));
        freq[i] = from * (to / from) ** s;
        gain[i] = s * s;
      }
      bp.frequency.setValueCurveAtTime(freq, 0, len);
      env.gain.setValueCurveAtTime(gain, 0, len);
      src.connect(bp).connect(env).connect(lowpass(ctx, 7000));
      src.start(0);
    },
    { fadeInMs: 2, fadeOutMs: 30 },
  );

// A reveal: broad stereo air that swells into the moment something lands
// (`peak` seconds in), then settles, with a soft low bloom underneath for
// weight. Wide and low rather than a narrow sweep, so it reads as air moving,
// not a squeak. Start the cue `peak` seconds before the landing.
export const reveal = ({ len = 1.2, peak = 0.4, seed = 21 } = {}) =>
  make(
    len,
    (ctx) => {
      const out = lowpass(ctx, 5200);
      const merge = ctx.createChannelMerger(2);
      merge.connect(out);
      // Swell: an eased rise to the peak, then an exponential settle.
      const steps = 128;
      const env = new Float32Array(steps);
      for (let i = 0; i < steps; i++) {
        const t = (i / (steps - 1)) * len;
        env[i] = t < peak ? Math.sin((t / peak) * (Math.PI / 2)) ** 3 : Math.exp(-(t - peak) / 0.2);
      }
      // Two decorrelated noise beds, one per side, for width.
      for (const ch of [0, 1]) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(ctx, len, seed + ch * 17);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 0.55;
        bp.frequency.setValueAtTime(260, 0);
        bp.frequency.exponentialRampToValueAtTime(1500, peak);
        bp.frequency.exponentialRampToValueAtTime(420, len);
        const g = ctx.createGain();
        g.gain.setValueCurveAtTime(env, 0, len);
        src.connect(bp).connect(g).connect(merge, 0, ch);
        src.start(0);
      }
      // The bloom: a low sine that eases in just ahead of the landing and decays.
      const bloom = ctx.createGain();
      bloom.connect(out);
      tone(ctx, bloom, { at: peak - 0.05, f: 62, amp: 0.55, tau: 0.24, attack: 0.05, chirp: 0.35 });
    },
    { channels: 2, peakDb: -3, fadeInMs: 4, fadeOutMs: 80 },
  );

// ── The set ──────────────────────────────────────────────────────────────────
// Four keys with slightly different voices, so typing never machine-guns.
export const KEYS = [
  { body: 2400, thock: 190 },
  { body: 2650, thock: 205 },
  { body: 2250, thock: 182 },
  { body: 2550, thock: 198 },
].map((k, i) => key({ ...k, seed: 11 + i * 13 }));
export const KEY_SPACE = key({ body: 1500, thock: 150, seed: 91, len: 0.09 });
export const KEY_ENTER = key({ body: 1700, thock: 128, seed: 97, bright: 1.2, len: 0.1 });

export const TICK = tick({ f: 2400, seed: 5 });
// Climb through these as something fills, a quiet sense of "nearly there".
export const PROGRESS = [1760, 1976, 2217, 2349, 2637, 2960].map((f, i) => tick({ f, seed: 30 + i, tau: 0.005 }));

// Success: two bell notes a fifth apart, C6 then G6.
export const SUCCESS = make(
  1.6,
  (ctx) => {
    const out = lowpass(ctx, 10000);
    bell(ctx, out, { f: 1046.5, tau: 0.5 });
    bell(ctx, out, { at: 0.085, f: 1567.98, amp: 0.85, tau: 0.6 });
  },
  { fadeInMs: 1, fadeOutMs: 120 },
);
// Checklist pings, rising: E6, then A6.
export const CHECKS = [1318.51, 1760].map((f) =>
  make(0.9, (ctx) => bell(ctx, ctx.destination, { f, tau: 0.32 }), { fadeInMs: 1, fadeOutMs: 80 }),
);

export const SWISH = whoosh({ len: 0.45, from: 500, to: 2600, seed: 7 });
export const WHOOSH = whoosh({ len: 0.8, from: 260, to: 2200, seed: 3, q: 0.9 });
export const REVEAL = reveal();

// Deterministic wobble for repeated sounds, so they never land at one level.
export const wobble = (i: number, depth = 0.16) => (((i * 7919) % 13) / 13 - 0.5) * depth;
