import { inkA, MONO, ON_DARK } from "./tokens";

// The title bar every editor and terminal panel shares: neutral dots and a
// centred file or path name on the raised surface.
export const TITLE_BAR_H = 52;

export const TitleBar: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      height: TITLE_BAR_H,
      background: ON_DARK.raised,
      borderBottom: `1px solid ${inkA(0.1)}`,
      display: "flex",
      alignItems: "center",
      position: "relative",
    }}
  >
    <div style={{ position: "absolute", left: 22, display: "flex", gap: 9 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 13, height: 13, borderRadius: 999, background: inkA(0.22) }} />
      ))}
    </div>
    <div style={{ width: "100%", textAlign: "center", fontFamily: MONO, fontSize: 18, color: inkA(0.55) }}>{title}</div>
  </div>
);
