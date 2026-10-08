// The Burrow stage. These scenes cut in between screen recordings, so they
// carry no fades, and the eyebrow and wordmark are off unless asked for: the
// final edit usually brings its own titles. Toggle them with --props.
import { Stage } from "@keyframe/components";
import { PRODUCTS } from "@keyframe/kit";

export type Chrome = { showTitle?: boolean; showLogo?: boolean };

export const CHROME: Required<Chrome> = { showTitle: false, showLogo: false };

export const BurrowStage: React.FC<Chrome & { children: React.ReactNode }> = ({ showTitle, showLogo, children }) => (
  <Stage eyebrow={showTitle ? PRODUCTS.burrow : undefined} logo={showLogo} fadeIn={0} fadeOut={0}>
    {children}
  </Stage>
);
