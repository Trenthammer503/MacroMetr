"use client";

import { useMemo, useState } from "react";
import { useTheme } from "../lib/theme-context";
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
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [targetMeal, setTargetMeal] = useState<MealId>(mealId);
  const [customOpen, setCustomOpen] = useState(false);

  const matches: Food[] = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return FOODS.filter((f) => f.name.toLowerCase().includes(q));
    }
    return RECENT_IDS.map((id) => foodById(id)!).filter(Boolean);
  }, [query]);

  if (customOpen) {
    return (
      <CustomFoodForm
        mealId={targetMeal}
        setMealId={setTargetMeal}
        onBack={() => setCustomOpen(false)}
        onLog={async (food) => {
          await onLog(food, 1, targetMeal);
        }}
      />
    );
  }

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
        <button
          onClick={() => setCustomOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            background: theme.surface,
            border: `0.5px dashed ${theme.borderStrong}`,
            borderRadius: theme.radius,
            cursor: "pointer",
            color: theme.ink,
            fontFamily: theme.fontDisplay,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: -0.2,
            marginTop: 4,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: theme.accent,
              color: theme.accentInk,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span style={{ flex: 1, textAlign: "left" }}>Quick add custom food</span>
          <span
            style={{
              fontFamily: theme.fontMono,
              fontSize: 11,
              color: theme.inkMute,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Manual
          </span>
        </button>

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
  const { theme } = useTheme();
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

function CustomFoodForm({
  mealId,
  setMealId,
  onBack,
  onLog,
}: {
  mealId: MealId;
  setMealId: (m: MealId) => void;
  onBack: () => void;
  onLog: (food: Food) => Promise<void> | void;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("1 serving");
  const [kcal, setKcal] = useState("");
  const [p, setP] = useState("");
  const [c, setC] = useState("");
  const [f, setF] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const num = (s: string) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const kcalN = num(kcal);
  const valid = name.trim().length > 0 && kcalN > 0;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    const food: Food = {
      // eslint-disable-next-line react-hooks/purity
      id: `custom_${Date.now()}`,
      name: name.trim(),
      unit: unit.trim() || "1 serving",
      kcal: kcalN,
      p: num(p),
      c: num(c),
      f: num(f),
    };
    await onLog(food);
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    appearance: "none",
    border: `0.5px solid ${theme.border}`,
    background: theme.surface,
    borderRadius: 14,
    padding: "12px 14px",
    fontFamily: theme.fontDisplay,
    fontSize: 15,
    color: theme.ink,
    outline: "none",
    letterSpacing: -0.2,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: theme.fontDisplay,
    fontSize: 11,
    fontWeight: 600,
    color: theme.inkMute,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  };

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
            fontFamily: theme.fontDisplay,
            fontSize: 28,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.8,
            marginBottom: 18,
          }}
        >
          Quick add
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>Name</div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homemade chili"
              style={fieldStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Serving</div>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="1 bowl, 100g, etc."
              style={fieldStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Calories</div>
            <input
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              inputMode="decimal"
              placeholder="kcal"
              style={fieldStyle}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div>
              <div style={labelStyle}>Protein (g)</div>
              <input
                value={p}
                onChange={(e) => setP(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                style={fieldStyle}
              />
            </div>
            <div>
              <div style={labelStyle}>Carbs (g)</div>
              <input
                value={c}
                onChange={(e) => setC(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                style={fieldStyle}
              />
            </div>
            <div>
              <div style={labelStyle}>Fat (g)</div>
              <input
                value={f}
                onChange={(e) => setF(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 32px", background: theme.bg }}>
        <button
          onClick={submit}
          disabled={!valid || submitting}
          style={{
            width: "100%",
            appearance: "none",
            border: "none",
            padding: "18px",
            background: valid ? theme.accent : theme.surfaceAlt,
            color: valid ? theme.accentInk : theme.inkMute,
            borderRadius: 999,
            fontFamily: theme.fontDisplay,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: valid ? "pointer" : "not-allowed",
            boxShadow: valid ? `0 8px 24px ${theme.accent}66` : "none",
          }}
        >
          {valid
            ? `Log ${Math.round(kcalN)} kcal → ${MEAL_LABELS[mealId]}`
            : "Add a name and calories"}
        </button>
      </div>
    </div>
  );
}
