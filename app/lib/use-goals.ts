"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_GOALS, Goals } from "./foods";

export function useGoals(uid: string) {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);

  useEffect(() => {
    const ref = doc(db, "users", uid, "settings", "goals");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setGoals({
          kcal: d.kcal ?? DEFAULT_GOALS.kcal,
          protein: d.protein ?? DEFAULT_GOALS.protein,
          carbs: d.carbs ?? DEFAULT_GOALS.carbs,
          fat: d.fat ?? DEFAULT_GOALS.fat,
        });
      } else {
        setGoals(DEFAULT_GOALS);
      }
    });
    return () => unsub();
  }, [uid]);

  return { goals };
}

export async function saveGoals(uid: string, goals: Goals) {
  const ref = doc(db, "users", uid, "settings", "goals");
  await setDoc(ref, goals, { merge: true });
}
