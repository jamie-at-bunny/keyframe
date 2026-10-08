import { Fill } from "@keyframe/engine/time";
import { Device, type DeviceName, ILLUSTRATIONS, Illustration, type IllustrationName } from "@keyframe/illustrations";
import { BRAND, FAINT, FONT, MONO, MUTED, ON_DARK, RADIUS } from "@keyframe/kit";
import { SHEET } from "./data";

const NAMES = Object.keys(ILLUSTRATIONS) as IllustrationName[];
const isDevice = (name: IllustrationName): name is DeviceName => "screen" in ILLUSTRATIONS[name];

// Fit the art inside a cell, whichever side is tighter.
const fitWidth = (name: IllustrationName) => {
  const art = ILLUSTRATIONS[name];

  return Math.min(SHEET.art.w, (SHEET.art.h * art.width) / art.height);
};

// A reference sheet, not a marketing video: every illustration by name, with
// live content filling each device screen so the screen fit can be checked.
export const Illustrations = () => (
  <Fill style={{ padding: SHEET.pad, fontFamily: FONT }}>
    <div style={{ color: MUTED, fontSize: 24, fontWeight: 500, marginBottom: 20 }}>
      @keyframe/illustrations · {NAMES.length} pieces · <span style={{ color: BRAND }}>orange</span> is a live screen
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${SHEET.columns}, 1fr)`, gap: SHEET.gap }}>
      {NAMES.map((name) => {
        const width = fitWidth(name);

        return (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: 12,
              background: ON_DARK.surface,
              borderRadius: RADIUS.md,
            }}
          >
            <div style={{ height: SHEET.art.h, display: "flex", alignItems: "center" }}>
              {isDevice(name) ? (
                <Device name={name} width={width} screenBackground={BRAND}>
                  <div
                    style={{
                      margin: "auto",
                      color: ON_DARK.bg,
                      fontFamily: MONO,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    screen
                  </div>
                </Device>
              ) : (
                <Illustration name={name} width={width} />
              )}
            </div>
            <div style={{ color: isDevice(name) ? BRAND : FAINT, fontFamily: MONO, fontSize: 17 }}>{name}</div>
          </div>
        );
      })}
    </div>
  </Fill>
);
