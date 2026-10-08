// Brand type, served from kit/fonts (the Google Fonts files, OFL) so
// renders never touch the network. Importing this module starts the loads and
// holds the first frame until every weight is ready.
import "./fonts/fonts.css";
import { waitFor } from "@keyframe/engine/assets";

// No generic fallback: glyphs outside the latin subset (the terminal's
// ⠋ █ ░ ✔ ❯) fall back to the system's own choice.
export const FONT = "Rubik";
export const MONO = "'JetBrains Mono'";

waitFor(
  Promise.all([
    ...[400, 500, 600, 700].map((w) => document.fonts.load(`${w} 32px Rubik`)),
    ...[400, 700].map((w) => document.fonts.load(`${w} 32px 'JetBrains Mono'`, "⠋█░✔❯")),
  ]),
);
