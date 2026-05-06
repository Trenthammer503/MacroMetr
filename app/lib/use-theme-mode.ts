"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ThemeMode } from "./theme";

export function useThemeMode(uid: string | null) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (!uid) {
      setMode("light");
      return;
    }
    const ref = doc(db, "users", uid, "settings", "appearance");
    const unsub = onSnapshot(ref, (snap) => {
      const next = snap.exists() ? (snap.data().mode as ThemeMode) : "light";
      setMode(next === "dark" ? "dark" : "light");
    });
    return () => unsub();
  }, [uid]);

  return { mode };
}

export async function saveThemeMode(uid: string, mode: ThemeMode) {
  const ref = doc(db, "users", uid, "settings", "appearance");
  await setDoc(ref, { mode }, { merge: true });
}
