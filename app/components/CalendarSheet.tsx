"use client";

import { useMemo, useState } from "react";
import { useTheme } from "../lib/theme-context";
import {
  Goals,
  computeTotals,
  monthRange,
  shiftMonth,
  todayKey,
} from "../lib/foods";
import { useMonthLogs } from "../lib/use-day-log";

type Props = {
  uid: string;
  goals: Goals;
  selectedDay: string;
  onSelectDay: (key: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Convert "#RRGGBB" to rgba(r,g,b,a). Falls back to the hex string if it
// can't parse (so palette tweaks won't crash the calendar).
function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CalendarSheet({
  uid,
  goals,
  selectedDay,
  onSelectDay,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const [anchor, setAnchor] = useState<string>(selectedDay);
  const { start, end, monthLabel, weeks } = useMemo(
    () => monthRange(anchor),
    [anchor],
  );
  const { byDay } = useMonthLogs(uid, start, end);
  const today = todayKey();

  const navBtnStyle: React.CSSProperties = {
    appearance: "none",
    border: `0.5px solid ${theme.border}`,
    background: theme.surface,
    color: theme.inkSoft,
    width: 36,
    height: 36,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "rgba(10,10,10,0.32)",
          animation: "mmcal-fade 180ms ease-out",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: theme.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 -16px 48px rgba(10,10,10,0.18)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92dvh",
          animation: "mmcal-slide 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <div
          style={{
            padding: "12px 0 8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 5,
              background: theme.borderStrong,
              borderRadius: 3,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "4px 20px 16px",
          }}
        >
          <button
            onClick={() => setAnchor((a) => shiftMonth(a, -1))}
            aria-label="Previous month"
            style={navBtnStyle}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 11,
                fontWeight: 600,
                color: theme.inkMute,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Jump to date
            </div>
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 24,
                fontWeight: 600,
                color: theme.ink,
                letterSpacing: -0.6,
                marginTop: 2,
              }}
            >
              {monthLabel}
            </div>
          </div>
          <button
            onClick={() => setAnchor((a) => shiftMonth(a, 1))}
            aria-label="Next month"
            style={navBtnStyle}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M5 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <div style={{ padding: "0 20px", overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 6,
            }}
          >
            {WEEKDAYS.map((w, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontFamily: theme.fontDisplay,
                  fontSize: 10,
                  fontWeight: 600,
                  color: theme.inkMute,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  padding: "4px 0",
                }}
              >
                {w}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 6,
              paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {weeks.flat().map((key, idx) => {
              if (!key) {
                return <div key={idx} style={{ aspectRatio: "1 / 1.1" }} />;
              }
              const entries = byDay.get(key) ?? [];
              const totals = computeTotals(entries);
              const goalKcal = goals.kcal > 0 ? goals.kcal : 1;
              const pct = Math.min(totals.kcal / goalKcal, 1);
              const fillAlpha = entries.length ? 0.15 + pct * 0.7 : 0;
              const isToday = key === today;
              const isSelected = key === selectedDay;
              const dayNum = Number(key.slice(8, 10));

              return (
                <button
                  key={key}
                  onClick={() => onSelectDay(key)}
                  aria-label={`Select ${key}`}
                  style={{
                    appearance: "none",
                    aspectRatio: "1 / 1.1",
                    border: isSelected
                      ? `1.5px solid ${theme.ink}`
                      : isToday
                        ? `1px solid ${theme.ink}`
                        : `0.5px solid ${theme.border}`,
                    borderRadius: 10,
                    background: entries.length
                      ? withAlpha(theme.accent, fillAlpha)
                      : theme.surface,
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "space-between",
                    fontFamily: theme.fontDisplay,
                    color: theme.ink,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "left",
                      lineHeight: 1,
                    }}
                  >
                    {dayNum}
                  </span>
                  {entries.length > 0 && (
                    <span
                      style={{
                        fontFamily: theme.fontMono,
                        fontSize: 9,
                        color: theme.inkSoft,
                        textAlign: "right",
                        lineHeight: 1,
                      }}
                    >
                      {Math.round(totals.kcal)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes mmcal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mmcal-slide {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
