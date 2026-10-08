// Every illustration, by name, at its native size (the SVG's viewBox). A device
// frame also carries its screen: the rectangle in viewBox units that <Device>
// fills with live content, rounded by `r` or cut to the outline `d` when the
// glass is curved. Measured from the screen shape in each SVG.
import backdropStreaks from "./svg/backdrop-streaks.svg";
import browser from "./svg/browser.svg";
import checklist from "./svg/checklist.svg";
import codeWindow from "./svg/code-window.svg";
import dashboard from "./svg/dashboard.svg";
import deskScene from "./svg/desk-scene.svg";
import documentArt from "./svg/document.svg";
import folderScene from "./svg/folder-scene.svg";
import laptop from "./svg/laptop.svg";
import laptopAngled from "./svg/laptop-angled.svg";
import monitor from "./svg/monitor.svg";
import monitorWide from "./svg/monitor-wide.svg";
import phone from "./svg/phone.svg";
import profileCard from "./svg/profile-card.svg";
import screenAngled from "./svg/screen-angled.svg";
import screenHanging from "./svg/screen-hanging.svg";
import tabletAngled from "./svg/tablet-angled.svg";
import tv from "./svg/tv.svg";
import tvCrt from "./svg/tv-crt.svg";
import tvRetro from "./svg/tv-retro.svg";
import videoLibrary from "./svg/video-library.svg";
import videoPlayer from "./svg/video-player.svg";

export type Screen = { x: number; y: number; w: number; h: number; r?: number; d?: string };

type Entry = { src: string; width: number; height: number; screen?: Screen };

export const ILLUSTRATIONS = {
  "backdrop-streaks": { src: backdropStreaks, width: 956, height: 500 },
  browser: { src: browser, width: 331, height: 202, screen: { x: 7.1, y: 24.4, w: 317.6, h: 170.1, r: 7.8 } },
  checklist: { src: checklist, width: 369, height: 439 },
  "code-window": {
    src: codeWindow,
    width: 546,
    height: 333,
    screen: { x: 11.2, y: 39.6, w: 523.6, h: 280.5, r: 12.8 },
  },
  dashboard: { src: dashboard, width: 207, height: 321 },
  "desk-scene": { src: deskScene, width: 954, height: 500 },
  document: { src: documentArt, width: 216, height: 281 },
  "folder-scene": { src: folderScene, width: 956, height: 500 },
  laptop: { src: laptop, width: 493, height: 271, screen: { x: 71.3, y: 12.4, w: 349.6, h: 225.7, r: 11.8 } },
  "laptop-angled": { src: laptopAngled, width: 365, height: 260 },
  monitor: { src: monitor, width: 380, height: 342, screen: { x: 11.8, y: 12.2, w: 356.1, h: 235.8, r: 10.1 } },
  "monitor-wide": { src: monitorWide, width: 657, height: 491, screen: { x: 20.1, y: 18.4, w: 616, h: 365.9, r: 0 } },
  phone: { src: phone, width: 252, height: 452, screen: { x: 6.9, y: 7, w: 237.8, h: 437.6, r: 18.3 } },
  "profile-card": { src: profileCard, width: 257, height: 136 },
  "screen-angled": { src: screenAngled, width: 375, height: 279 },
  "screen-hanging": {
    src: screenHanging,
    width: 591,
    height: 446,
    screen: { x: 20.8, y: 53.5, w: 549.1, h: 371.1, r: 14.6 },
  },
  "tablet-angled": { src: tabletAngled, width: 686, height: 475 },
  tv: { src: tv, width: 717, height: 493, screen: { x: 7.1, y: 7, w: 702.4, h: 398.1, r: 0 } },
  "tv-crt": {
    src: tvCrt,
    width: 644,
    height: 572,
    screen: {
      x: 62.9,
      y: 51.5,
      w: 517.2,
      h: 401.2,
      d: "M72.45 90.07C74.53 78.4 83.52 69.34 94.93 67.47C128.46 61.95 208.69 51.48 334 51.48C452.2 51.48 518.62 60.8 548.14 66.48C559.58 68.68 568.39 78.1 570.06 89.94C573.95 117.48 580.07 174.69 580.07 261.66C580.07 342.52 575.16 391.48 571.56 416.45C569.78 428.85 560.21 438.52 548.1 440.11C514.02 444.57 437.13 452.66 327.27 452.66C217.41 452.66 133.01 444.85 96.92 440.71C84.74 439.31 74.99 429.73 73.08 417.29C68.91 390.11 62.86 335.18 62.86 245.36C62.86 155.54 68.33 113.19 72.45 90.07Z",
    },
  },
  "tv-retro": {
    src: tvRetro,
    width: 653,
    height: 477,
    screen: {
      x: 52.6,
      y: 43,
      w: 404.7,
      h: 324.8,
      d: "M437.38 71.35C434.78 66.23 430.07 62.59 424.56 61.41C401.77 56.51 331.71 42.98 253.21 42.98C157.8 42.98 104.51 56.73 84.6 63.23C78.8 65.13 74.28 69.81 72.42 75.77C65.84 96.95 50.98 152.34 52.73 215.89C54.4 276.7 63.59 318.63 68.13 335.93C69.71 341.96 74 346.86 79.69 349.04C97.12 355.69 143.41 367.82 249.17 367.82C354.93 367.82 406.41 359.43 423.56 355.24C429.09 353.89 433.74 350.03 436.16 344.75C442.88 330.12 454.82 292.94 457.02 210.91C459.27 126.53 445.24 86.78 437.38 71.35Z",
    },
  },
  "video-library": {
    src: videoLibrary,
    width: 300,
    height: 208,
    screen: { x: 10.8, y: 27.7, w: 201.7, h: 132.7, r: 9.2 },
  },
  "video-player": {
    src: videoPlayer,
    width: 300,
    height: 313,
    screen: { x: 16.1, y: 40.4, w: 269.1, h: 199.1, r: 8.7 },
  },
} as const satisfies Record<string, Entry>;
