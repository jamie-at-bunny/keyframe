// Beats and copy. Everything on screen and every sound keys off T.
import { PRODUCTS } from "@keyframe/kit";

export const T = {
  title: 10,
  sub: 24,
  end: 120, // 4s
} as const;

// Name the product through PRODUCTS, keep claims to what the product does,
// and leave bunny.net out of the eyebrow (it renders in capitals).
export const COPY = {
  eyebrow: PRODUCTS.edgeScripting,
  title: "Run code at the edge",
  sub: "JavaScript and TypeScript, deployed to the bunny.net network",
};
