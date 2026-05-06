"use client";

import { theme } from "../lib/theme";

export function CalorieRing({
  consumed,
  target,
  size = 120,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const stroke = 10;
  const r = size / 2 - stroke / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1.4, consumed / Math.max(1, target));
  const filled = Math.min(1, pct) * c;
  const over = consumed > target;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)", overflow: "visible" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme.track}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={over ? theme.f : theme.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - filled}
          style={{
            transition: "stroke-dashoffset 800ms cubic-bezier(.34,1.56,.64,1), filter 220ms",
            filter: over ? `drop-shadow(0 0 6px ${theme.f})` : "none",
          }}
        />
        {over && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={theme.f}
            strokeWidth={stroke - 4}
            strokeLinecap="round"
            opacity={0.55}
            strokeDasharray={c}
            strokeDashoffset={c - Math.min(c, (pct - 1) * c)}
          />
        )}
        {[0.25, 0.5, 0.75].map((frac, i) => {
          const a = frac * 2 * Math.PI;
          const xo = cx + Math.cos(a) * (r + stroke / 2 + 4);
          const yo = cy + Math.sin(a) * (r + stroke / 2 + 4);
          const xi = cx + Math.cos(a) * (r + stroke / 2 - 2);
          const yi = cy + Math.sin(a) * (r + stroke / 2 - 2);
          return (
            <line
              key={i}
              x1={xi}
              y1={yi}
              x2={xo}
              y2={yo}
              stroke={theme.inkMute}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 22,
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {Math.round(pct * 100)}
          <span style={{ fontSize: 11, marginLeft: 1 }}>%</span>
        </div>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 9,
            fontWeight: 600,
            color: theme.inkMute,
            letterSpacing: 0.8,
            marginTop: 4,
            textTransform: "uppercase",
          }}
        >
          of goal
        </div>
      </div>
    </div>
  );
}
