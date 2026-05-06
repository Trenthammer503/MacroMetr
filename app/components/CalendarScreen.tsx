"use client";

import { useMemo, useState } from "react";
import { theme } from "../lib/theme";
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
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarScreen({
  uid,
  goals,
  selectedDay,
  onSelectDay,
}: Props) {
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
    <div style={{ padding: "8px 20px 120px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
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
            Calendar
          </div>
          <div
            style={{
              fontFamily: theme.fontDisplay,
              fontSize: 28,
              fontWeight: 600,
              color: theme.ink,
              letterSpacing: -0.8,
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
                  ? `rgba(212, 255, 58, ${fillAlpha})`
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
  );
}
