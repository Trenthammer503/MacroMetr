"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Food, LogEntry, MealId, todayKey } from "./foods";

export function useDayLog(uid: string) {
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    const day = todayKey();
    const q = query(
      collection(db, "users", uid, "log"),
      where("day", "==", day),
    );
    const unsub = onSnapshot(q, (snap) => {
      const entries: LogEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        entries.push({
          id: d.id,
          mealId: data.mealId,
          foodId: data.foodId,
          servings: data.servings,
          loggedAt: data.loggedAt ?? 0,
          customFood: data.customFood ?? undefined,
        });
      });
      entries.sort((a, b) => a.loggedAt - b.loggedAt);
      setLog(entries);
    });
    return () => unsub();
  }, [uid]);

  return { log };
}

export async function logFood(
  uid: string,
  mealId: MealId,
  foodId: string,
  servings: number,
  customFood?: Food,
) {
  await addDoc(collection(db, "users", uid, "log"), {
    day: todayKey(),
    mealId,
    foodId,
    servings,
    loggedAt: Date.now(),
    createdAt: serverTimestamp(),
    ...(customFood ? { customFood } : {}),
  });
}

export async function removeLogEntry(uid: string, entryId: string) {
  await deleteDoc(doc(db, "users", uid, "log", entryId));
}
