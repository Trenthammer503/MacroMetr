export const theme = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F2EC",
  ink: "#0A0A0A",
  inkSoft: "#3A3A36",
  inkMute: "#8C8C86",
  border: "rgba(10,10,10,0.08)",
  borderStrong: "rgba(10,10,10,0.14)",
  p: "#3D5AFE",
  c: "#D4FF3A",
  f: "#FF5722",
  accent: "#D4FF3A",
  accentInk: "#0A0A0A",
  radius: 22,
  track: "rgba(10,10,10,0.06)",
  fontDisplay: '"Geist", -apple-system, system-ui, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, monospace',
  chip: "#0A0A0A",
  chipInk: "#FAFAF7",
} as const;

export type Theme = typeof theme;
