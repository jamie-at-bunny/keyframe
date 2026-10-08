// Beats, in frames.
export const T = {
  nodes: 10,
  top: 25,
  topLabel: 60,
  low: 80,
  backbone: 100,
  region: 118,
  lowLabel: 140,
  traffic: 70,
  probes: 150,
  toLow: 300,
  toTop: 420,
  // Last launches land by 530; 530..600 is the held still.
  lastLaunch: 470,
  end: 600,
} as const;
