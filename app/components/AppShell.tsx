"use client";

import { useMemo, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useDayLog, logFood, removeLogEntry } from "../lib/use-day-log";
import { useGoals } from "../lib/use-goals";
import { Food, MealId, computeTotals, todayKey, shiftDayKey } from "../lib/foods";
import { theme } from "../lib/theme";
import { AuthScreen } from "./AuthScreen";
import { TodayScreen } from "./TodayScreen";
import { SettingsScreen } from "./SettingsScreen";
import { TabBar, Tab } from "./TabBar";
import { AddSheet } from "./AddSheet";

export function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          color: theme.inkMute,
          fontFamily: theme.fontDisplay,
          fontSize: 13,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <SignedInApp uid={user.uid} email={user.email} />;
}

function SignedInApp({ uid, email }: { uid: string; email: string | null }) {
  const [tab, setTab] = useState<Tab>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [addMeal, setAddMeal] = useState<MealId>("snack");
  const [pulse, setPulse] = useState<"p" | "c" | "f" | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [day, setDay] = useState<string>(() => todayKey());

  const { log } = useDayLog(uid, day);
  const { goals } = useGoals(uid);
  const totals = useMemo(() => computeTotals(log), [log]);

  const handleLog = async (food: Food, servings: number, mealId: MealId) => {
    const isCustom = food.id.startsWith("custom_");
    await logFood(uid, day, mealId, food.id, servings, isCustom ? food : undefined);

    const pCal = food.p * servings * 4;
    const cCal = food.c * servings * 4;
    const fCal = food.f * servings * 9;
    const dominant: "p" | "c" | "f" =
      pCal >= cCal && pCal >= fCal ? "p" : cCal >= fCal ? "c" : "f";
    setPulse(dominant);
    window.setTimeout(() => setPulse(null), 700);

    const flashColor =
      dominant === "p" ? theme.p : dominant === "c" ? theme.c : theme.f;
    setFlash(flashColor);
    window.setTimeout(() => setFlash(null), 400);

    setAddOpen(false);
  };

  const openAdd = (mealId: MealId = "snack") => {
    setAddMeal(mealId);
    setAddOpen(true);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: theme.bg,
        color: theme.ink,
        fontFamily: theme.fontDisplay,
        position: "relative",
        paddingBottom: 72,
      }}
    >
      {tab === "home" && (
        <TodayScreen
          log={log}
          totals={totals}
          goals={goals}
          pulse={pulse}
          day={day}
          onPrevDay={() => setDay((d) => shiftDayKey(d, -1))}
          onNextDay={() => setDay((d) => shiftDayKey(d, 1))}
          onJumpToday={() => setDay(todayKey())}
          onAddMeal={openAdd}
          onRemoveEntry={(id) => {
            void removeLogEntry(uid, id);
          }}
        />
      )}
      {tab === "settings" && (
        <SettingsScreen uid={uid} email={email} goals={goals} />
      )}

      <TabBar tab={tab} setTab={setTab} onAdd={() => openAdd("snack")} />

      {addOpen && (
        <AddSheet
          mealId={addMeal}
          onClose={() => setAddOpen(false)}
          onLog={handleLog}
        />
      )}

      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            pointerEvents: "none",
            background: flash,
            opacity: 0,
            animation: "mmflash 400ms ease-out",
          }}
        />
      )}
      <style>{`
        @keyframes mmflash {
          0% { opacity: 0; }
          30% { opacity: 0.18; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
