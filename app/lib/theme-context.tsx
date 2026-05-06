"use client";

import { createContext, useContext, ReactNode } from "react";
import { Theme, ThemeMode, themes, lightTheme } from "./theme";

type ThemeContextValue = { theme: Theme; mode: ThemeMode };

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: "light",
});

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
