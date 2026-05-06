export type Theme = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  border: string;
  borderStrong: string;
  p: string;
  c: string;
  f: string;
  accent: string;
  accentInk: string;
  radius: number;
  track: string;
  fontDisplay: string;
  fontMono: string;
  chip: string;
  chipInk: string;
};

export const lightTheme: Theme = {
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
};

export const darkTheme: Theme = {
  bg: "#221A17",
  surface: "#2B211D",
  surfaceAlt: "rgba(255,255,255,0.06)",
  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.78)",
  inkMute: "rgba(255,255,255,0.56)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  p: "#2868F0",
  c: "#B7F34B",
  f: "#FF7A59",
  accent: "#B7F34B",
  accentInk: "#0A0A0A",
  radius: 22,
  track: "rgba(255,255,255,0.08)",
  fontDisplay: '"Geist", -apple-system, system-ui, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, monospace',
  chip: "#B7F34B",
  chipInk: "#0A0A0A",
};

export type ThemeMode = "light" | "dark";

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const theme = lightTheme;
