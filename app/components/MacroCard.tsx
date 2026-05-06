"use client";

import { theme } from "../lib/theme";

type Props = {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
  pulse?: boolean;
};

export function MacroCard({
  label,
  value,
  target,
  color,
  unit = "g",
  pulse = false,
}: Props) {
  const W = 92;
  const H = 78;
  const cx = W / 2;
  const cy = H * 0.92;
  const r = Math.min(W, H * 1.6) / 2 - 8;
  const stroke = 9;

  const pct = Math.min(1.4, value / Math.max(1, target));
  const overshoot = value > target;
  const grams = Math.round(value);
  const remaining = Math.max(0, target - value);

  const arcLen = Math.PI * r;
  const filled = Math.min(1, pct) * arcLen;

  const x1 = cx - r;
  const y1 = cy;
  const x2 = cx + r;
  const y2 = cy;
  const trackPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: theme.radius,
        padding: "14px 10px 12px",
        border: `0.5px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          alignSelf: "flex-start",
          marginLeft: 2,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 10,
            fontWeight: 700,
            color: theme.inkSoft,
            letterSpacing: 0.7,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <path
            d={trackPath}
            fill="none"
            stroke={theme.track}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen}`}
            strokeDashoffset={arcLen - filled}
            style={{
              transition:
                "stroke-dashoffset 800ms cubic-bezier(.34,1.56,.64,1), filter 220ms, transform 220ms",
              filter: overshoot
                ? `drop-shadow(0 0 6px ${color})`
                : pulse
                  ? `drop-shadow(0 0 4px ${color})`
                  : "none",
              transform: pulse ? "scale(1.03)" : "scale(1)",
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
          {overshoot && (
            <path
              d={trackPath}
              fill="none"
              stroke={color}
              strokeWidth={stroke - 4}
              strokeLinecap="round"
              opacity={0.55}
              strokeDasharray={`${arcLen}`}
              strokeDashoffset={arcLen - Math.min(arcLen, (pct - 1) * arcLen)}
            />
          )}
          {[0.25, 0.5, 0.75].map((frac, i) => {
            const a = Math.PI * (1 - frac);
            const xo = cx + Math.cos(a) * (r + 5);
            const yo = cy - Math.sin(a) * (r + 5);
            const xi = cx + Math.cos(a) * (r - 3);
            const yi = cy - Math.sin(a) * (r - 3);
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
          <circle cx={x1} cy={y1} r={2} fill={theme.inkMute} opacity={0.6} />
          <circle cx={x2} cy={y2} r={2} fill={theme.inkMute} opacity={0.6} />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 2,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: theme.fontMono,
              fontSize: 20,
              fontWeight: 700,
              color: theme.ink,
              letterSpacing: -0.6,
              lineHeight: 1,
            }}
          >
            {grams}
            <span style={{ fontSize: 10, color: theme.inkMute, marginLeft: 1 }}>{unit}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          fontFamily: theme.fontMono,
          fontSize: 10,
          fontWeight: 500,
          color: theme.inkMute,
          letterSpacing: 0.2,
        }}
      >
        {overshoot ? (
          <span style={{ color: theme.f }}>
            +{Math.round(value - target)}
            {unit} over
          </span>
        ) : (
          <span>
            {remaining}
            {unit} left
          </span>
        )}
      </div>
    </div>
  );
}
