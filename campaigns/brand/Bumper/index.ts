// Bumpers: the wordmark centre, the product at the foot. Add a product with
// one bumper({...}) line and an entry in videos.ts, or render any of these
// with --props '{"product":"Bunny DNS"}' for a one-off.
import { bumper, PRODUCTS } from "@keyframe/kit";

// The wordmark alone.
export const BunnyBumper = bumper({ id: "BunnyBumper" });

// A product name, no product logo.
export const StreamBumper = bumper({ id: "StreamBumper", product: PRODUCTS.stream });

// A product logo beside the name.
export const ShieldBumper = bumper({ id: "ShieldBumper", product: PRODUCTS.shield, productLogo: "shield-mascot.svg" });

// The logo stacked above the name, on chroma green for keying over footage.
export const ShieldBumperGreen = bumper({
  id: "ShieldBumperGreen",
  product: PRODUCTS.shield,
  productLogo: "shield-mascot.svg",
  logoPlacement: "above",
  theme: "green",
});
