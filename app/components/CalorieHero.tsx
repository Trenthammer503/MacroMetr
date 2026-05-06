"use client";

import { useTheme } from "../lib/theme-context";
import { AnimatedNumber } from "./AnimatedNumber";

export function CalorieHero({ consumed, target }: { consumed: number; target: number }) {
  const { theme } = useTheme();
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 11,
          fontWeight: 600,
          color: theme.inkMute,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {over ? "Over by" : "Calories left"}
      </div>
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 56,
          fontWeight: 700,
          color: over ? theme.f : theme.ink,
          letterSpacing: -2.5,
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        <AnimatedNumber value={over ? consumed - target : remaining} />
      </div>
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 13,
          fontWeight: 500,
          color: theme.inkSoft,
          marginTop: 6,
        }}
      >
        <AnimatedNumber value={consumed} /> / {target.toLocaleString()} kcal
      </div>
    </div>
  );
}
