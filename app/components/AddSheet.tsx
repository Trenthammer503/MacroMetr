"use client";

import { useMemo, useState } from "react";
import { theme } from "../lib/theme";
import { Food, FOODS, MealId, RECENT_IDS, foodById } from "../lib/foods";
import { FoodRow } from "./FoodRow";

type Props = {
  mealId: MealId;
  onClose: () => void;
  onLog: (food: Food, servings: number, mealId: MealId) => void | Promise<void>;
};

const MEAL_LABELS: Record<MealId, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function AddSheet(props: Props) {
  return <AddSheetInner key={props.mealId} {...props} />;
}

function AddSheetInner({ mealId, onClose, onLog }: Props) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [targetMeal, setTargetMeal] = useState<MealId>(mealId);

  const matches: Food[] = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return FOODS.filter((f) => f.name.toLowerCase().includes(q));
    }
    return RECENT_IDS.map((id) => foodById(id)!).filter(Boolean);
  }, [query]);

  if (picked) {
    return (
      <FoodDetail
        food={picked}
        mealId={targetMeal}
        setMealId={setTargetMeal}
        servings={servings}
        setServings={setServings}
        onBack={() => {
          setPicked(null);
          setServings(1);
        }}
        onLog={async () => {
          await onLog(picked, servings, targetMeal);
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "12px 0 8px", display: "flex", justifyContent: "center" }}>
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
          padding: "4px 20px 16px",
        }}
      >
        <div>
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
            Adding to
          </div>
          <select
            value={targetMeal}
            onChange={(e) => setTargetMeal(e.target.value as MealId)}
            style={{
              appearance: "none",
              border: "none",
              background: "transparent",
              fontFamily: theme.fontDisplay,
              fontSize: 22,
              fontWeight: 600,
              color: theme.ink,
              letterSpacing: -0.6,
              padding: 0,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {(Object.keys(MEAL_LABELS) as MealId[]).map((m) => (
              <option key={m} value={m}>
                {MEAL_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onClose}
          style={{
            appearance: "none",
            border: "none",
            width: 36,
            height: 36,
            borderRadius: 999,
            background: theme.surfaceAlt,
            color: theme.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div style={{ padding: "0 20px", marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: theme.surface,
            borderRadius: theme.radius,
            border: `0.5px solid ${theme.border}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke={theme.inkMute} strokeWidth="1.5" />
            <path
              d="M11 11l3 3"
              stroke={theme.inkMute}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: theme.fontDisplay,
              fontSize: 16,
              color: theme.ink,
              letterSpacing: -0.2,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                color: theme.inkMute,
                fontSize: 18,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 32px" }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 11,
            fontWeight: 600,
            color: theme.inkMute,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            padding: "12px 0 6px",
          }}
        >
          {query ? `Results for "${query}"` : "Recent · tap to log instantly"}
        </div>
        {matches.map((f) => (
          <FoodRow
            key={f.id}
            food={f}
            onAdd={(food) => onLog(food, 1, targetMeal)}
            onTap={() => {
              setPicked(f);
              setServings(1);
            }}
          />
        ))}
        {matches.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              fontFamily: theme.fontDisplay,
              color: theme.inkMute,
            }}
          >
            Nothing matches &quot;{query}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

function FoodDetail({
  food,
  mealId,
  setMealId,
  servings,
  setServings,
  onBack,
  onLog,
}: {
  food: Food;
  mealId: MealId;
  setMealId: (m: MealId) => void;
  servings: number;
  setServings: (n: number) => void;
  onBack: () => void;
  onLog: () => Promise<void> | void;
}) {
  const k = (food.kcal * servings).toFixed(0);
  const initials = (food.name || "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={onBack}
          style={{
            appearance: "none",
            border: "none",
            background: theme.surfaceAlt,
            color: theme.ink,
            padding: "8px 14px",
            borderRadius: 999,
            fontFamily: theme.fontDisplay,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <select
          value={mealId}
          onChange={(e) => setMealId(e.target.value as MealId)}
          style={{
            appearance: "none",
            border: "none",
            background: "transparent",
            fontFamily: theme.fontDisplay,
            fontSize: 12,
            fontWeight: 600,
            color: theme.inkMute,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {(Object.keys(MEAL_LABELS) as MealId[]).map((m) => (
            <option key={m} value={m}>
              {MEAL_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 24px" }}>
        <div
          style={{
            margin: "24px auto",
            width: 96,
            height: 96,
            borderRadius: 28,
            background: theme.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fontMono,
            fontSize: 28,
            fontWeight: 700,
            color: theme.inkSoft,
            letterSpacing: -0.6,
          }}
        >
          {initials}
        </div>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 28,
            fontWeight: 600,
            color: theme.ink,
            textAlign: "center",
            letterSpacing: -0.8,
          }}
        >
          {food.name}
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 13,
            color: theme.inkMute,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          {food.unit}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "24px 0",
          }}
        >
          <button
            onClick={() => setServings(Math.max(0.5, +(servings - 0.5).toFixed(1)))}
            style={{
              appearance: "none",
              border: "none",
              background: theme.surfaceAlt,
              color: theme.ink,
              width: 44,
              height: 44,
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            −
          </button>
          <div style={{ minWidth: 100, textAlign: "center" }}>
            <div
              style={{
                fontFamily: theme.fontMono,
                fontSize: 36,
                fontWeight: 700,
                color: theme.ink,
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              {servings}×
            </div>
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 11,
                color: theme.inkMute,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              servings
            </div>
          </div>
          <button
            onClick={() => setServings(+(servings + 0.5).toFixed(1))}
            style={{
              appearance: "none",
              border: "none",
              background: theme.accent,
              color: theme.accentInk,
              width: 44,
              height: 44,
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        <div
          style={{
            background: theme.surface,
            border: `0.5px solid ${theme.border}`,
            borderRadius: theme.radius,
            padding: 20,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: 14,
                fontWeight: 600,
                color: theme.inkSoft,
              }}
            >
              Calories
            </div>
            <div
              style={{
                fontFamily: theme.fontMono,
                fontSize: 32,
                fontWeight: 700,
                color: theme.ink,
                letterSpacing: -1,
              }}
            >
              {k}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {(
              [
                { l: "Protein", v: food.p * servings, c: theme.p },
                { l: "Carbs", v: food.c * servings, c: theme.c },
                { l: "Fat", v: food.f * servings, c: theme.f },
              ] as const
            ).map((m) => (
              <div
                key={m.l}
                style={{
                  background: theme.surfaceAlt,
                  padding: 12,
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 4,
                    background: m.c,
                    borderRadius: 2,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: theme.ink,
                    letterSpacing: -0.4,
                  }}
                >
                  {m.v.toFixed(0)}
                  <span style={{ fontSize: 11, color: theme.inkMute }}>g</span>
                </div>
                <div
                  style={{
                    fontFamily: theme.fontDisplay,
                    fontSize: 10,
                    fontWeight: 600,
                    color: theme.inkMute,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {m.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 20px 32px",
          background: theme.bg,
        }}
      >
        <button
          onClick={() => onLog()}
          style={{
            width: "100%",
            appearance: "none",
            border: "none",
            padding: "18px",
            background: theme.accent,
            color: theme.accentInk,
            borderRadius: 999,
            fontFamily: theme.fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: "pointer",
            boxShadow: `0 8px 24px ${theme.accent}66`,
          }}
        >
          Log {k} kcal → {MEAL_LABELS[mealId]}
        </button>
      </div>
    </div>
  );
}
