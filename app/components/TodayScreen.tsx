"use client";

import { theme } from "../lib/theme";
import {
  Goals,
  LogEntry,
  MEALS,
  MealId,
  Totals,
  entryFood,
  formatDayLabel,
  todayKey,
} from "../lib/foods";
import { CalorieHero } from "./CalorieHero";
import { CalorieRing } from "./CalorieRing";
import { MacroCard } from "./MacroCard";

type Props = {
  log: LogEntry[];
  totals: Totals;
  goals: Goals;
  pulse: "p" | "c" | "f" | null;
  day: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onJumpToday: () => void;
  onAddMeal: (mealId: MealId) => void;
  onRemoveEntry: (entryId: string) => void;
};

export function TodayScreen({
  log,
  totals,
  goals,
  pulse,
  day,
  onPrevDay,
  onNextDay,
  onJumpToday,
  onAddMeal,
  onRemoveEntry,
}: Props) {
  const proteinShort = Math.max(0, goals.protein - totals.p);
  const { primary, secondary } = formatDayLabel(day);
  const isToday = day === todayKey();

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
          onClick={onPrevDay}
          aria-label="Previous day"
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
            {secondary}
          </div>
          <button
            onClick={isToday ? undefined : onJumpToday}
            disabled={isToday}
            aria-label={isToday ? undefined : "Jump to today"}
            style={{
              appearance: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              marginTop: 2,
              fontFamily: theme.fontDisplay,
              fontSize: 28,
              fontWeight: 600,
              color: theme.ink,
              letterSpacing: -0.8,
              cursor: isToday ? "default" : "pointer",
            }}
          >
            {primary}
          </button>
        </div>
        <button onClick={onNextDay} aria-label="Next day" style={navBtnStyle}>
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
          background: theme.surface,
          border: `0.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: 20,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <CalorieHero consumed={totals.kcal} target={goals.kcal} />
          <CalorieRing consumed={totals.kcal} target={goals.kcal} size={120} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <MacroCard
          label="Protein"
          value={totals.p}
          target={goals.protein}
          color={theme.p}
          pulse={pulse === "p"}
        />
        <MacroCard
          label="Carbs"
          value={totals.c}
          target={goals.carbs}
          color={theme.c}
          pulse={pulse === "c"}
        />
        <MacroCard
          label="Fat"
          value={totals.f}
          target={goals.fat}
          color={theme.f}
          pulse={pulse === "f"}
        />
      </div>

      {proteinShort > 0 && (
        <div
          style={{
            background: theme.surfaceAlt,
            borderRadius: theme.radius,
            padding: "14px 16px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 36,
              background: theme.p,
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 14,
                fontWeight: 600,
                color: theme.ink,
                letterSpacing: -0.2,
              }}
            >
              You&apos;re {proteinShort}g short on protein.
            </div>
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 12,
                color: theme.inkSoft,
                marginTop: 2,
              }}
            >
              A scoop of whey gets you most of the way there.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 11,
          fontWeight: 600,
          color: theme.inkMute,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Meals
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MEALS.map((m) => {
          const items = log.filter((e) => e.mealId === m.id);
          const mealKcal = items.reduce(
            (acc, e) => acc + (entryFood(e)?.kcal ?? 0) * e.servings,
            0,
          );
          return (
            <div
              key={m.id}
              style={{
                background: theme.surface,
                border: `0.5px solid ${theme.border}`,
                borderRadius: theme.radius,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: items.length ? 8 : 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: theme.surfaceAlt,
                    color: theme.inkSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: theme.fontMono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                  }}
                >
                  {m.code}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: theme.fontDisplay,
                      fontSize: 16,
                      fontWeight: 600,
                      color: theme.ink,
                      letterSpacing: -0.2,
                    }}
                  >
                    {m.label}
                  </div>
                  {items.length === 0 ? (
                    <div
                      style={{
                        fontFamily: theme.fontDisplay,
                        fontSize: 12,
                        color: theme.inkMute,
                        marginTop: 1,
                      }}
                    >
                      Nothing logged yet
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: theme.fontMono,
                        fontSize: 11,
                        color: theme.inkMute,
                        marginTop: 2,
                      }}
                    >
                      {items.length} item{items.length > 1 ? "s" : ""} ·{" "}
                      {Math.round(mealKcal)} kcal
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onAddMeal(m.id)}
                  style={{
                    appearance: "none",
                    border: "none",
                    background: theme.accent,
                    color: theme.accentInk,
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label={`Add to ${m.label}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path
                      d="M7 2v10M2 7h10"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              {items.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    marginLeft: 34,
                  }}
                >
                  {items.map((e) => {
                    const f = entryFood(e);
                    if (!f) return null;
                    return (
                      <div
                        key={e.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontFamily: theme.fontDisplay,
                          fontSize: 13,
                          color: theme.inkSoft,
                          padding: "4px 0",
                          gap: 8,
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.name}
                          {e.servings !== 1 ? ` ×${e.servings}` : ""}
                        </span>
                        <span
                          style={{
                            fontFamily: theme.fontMono,
                            fontSize: 12,
                            color: theme.inkMute,
                          }}
                        >
                          {Math.round(f.kcal * e.servings)}
                        </span>
                        <button
                          onClick={() => onRemoveEntry(e.id)}
                          aria-label="Remove entry"
                          style={{
                            appearance: "none",
                            border: "none",
                            background: "transparent",
                            color: theme.inkMute,
                            cursor: "pointer",
                            padding: 4,
                            lineHeight: 0,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12">
                            <path
                              d="M2 2l8 8M10 2l-8 8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
