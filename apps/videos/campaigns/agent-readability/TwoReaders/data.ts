// Beats, in frames.
export const T = {
  browser: 6,
  agent: 12,
  edge: 18,
  url: 28,
  browserReq: 40,
  htmlRes: 72,
  htmlCard: 96,
  // one second's hold on the finished page before the agent's turn
  agentReq: 160,
  mdRes: 192,
  mdCard: 216,
  mdType: 228,
  end: 360,
} as const;
