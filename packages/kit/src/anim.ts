// House motion: objects enter on a lively spring, anything that travels or
// draws eases in and out, nothing moves linearly.
import { Easing, interpolate, spring } from "@keyframe/engine/motion";
import { STAGE } from "./tokens";

export const ease = Easing.inOut(Easing.cubic);

// 0..1 over [start, start + dur], eased in and out. Draws, fades, crossfades.
export const progress = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { easing: ease });

// Travel along a path. Softer than `progress`, so a stream of dots glides
// rather than bunching at either end.
export const travel = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { easing: Easing.inOut(Easing.sin) });

// The house entrance spring: overshoots a touch past 1, then settles.
// 0 before `at`, exactly 1 once `dur` frames have passed.
export const pop = (frame: number, at: number, { damping = 13, stiffness = 140, mass = 0.7, dur = 24 } = {}) =>
  frame >= at + dur ? 1 : spring({ frame: frame - at, fps: STAGE.fps, config: { damping, stiffness, mass }, dur });

// Style for something rising into place on a spring value `s` (from pop()):
// it fades up quickly, lifts `dy` px and scales up from `from`.
export const rise = (s: number, dy = 18, from = 0.96) => ({
  opacity: Math.min(1, s * 1.4),
  transform: `translateY(${(1 - s) * dy}px) scale(${from + (1 - from) * s})`,
});

// Spring in at `at` with a lift and a slight scale up. Works on HTML and SVG groups.
export const enter = (frame: number, at: number, dy = 22) => ({
  ...rise(pop(frame, at), dy, 0.9),
  transformBox: "fill-box" as const,
  transformOrigin: "center",
});

// Plain eased fade, for things that should arrive without moving.
export const fade = (frame: number, at: number, dur = 20) => ({ opacity: progress(frame, at, dur) });

// Visible between `start` and `end`, fading at both edges.
export const visible = (frame: number, start: number, end: number, dur = 15) =>
  Math.min(progress(frame, start, dur), 1 - progress(frame, end - dur, dur));
