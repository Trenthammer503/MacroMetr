# macrometr — Features & Progress

A running ledger of what's built, how it's wired, and what's planned. Read this first when starting a new chat so you have shared context with prior sessions.

## Stack

- **Framework**: Next.js 16.2.4 (App Router). See `AGENTS.md` — this is a breaking-change version; consult `node_modules/next/dist/docs/` before assuming any API.
- **React**: 19.2.4
- **Styling**: Tailwind v4 + inline styles via theme palettes (`app/lib/theme.ts` exports `lightTheme` / `darkTheme`) read through the `useTheme()` hook (`app/lib/theme-context.tsx`). No CSS modules.
- **Backend**: Firebase (Auth + Firestore) — config in `app/lib/firebase.ts`.
- **Auth**: Google sign-in only (`app/components/AuthScreen.tsx`, `app/lib/auth-context.tsx`).
- **Lint**: `eslint-config-next`. Run `npm run lint`.

## File map

| Path | Purpose |
|---|---|
| `app/page.tsx` | Renders `<AppShell />`. |
| `app/components/AppShell.tsx` | Top-level routing between auth / today / settings tabs, owns add-sheet + flash/pulse animation state. |
| `app/components/TodayScreen.tsx` | Day view: hero ring, macro cards, protein nudge, per-meal item lists. |
| `app/components/CalendarSheet.tsx` | Slide-up month grid heatmap opened from the date label on Today; tap a day to jump to it. |
| `app/components/AddSheet.tsx` | Bottom-sheet food picker with search, recents, detail/serving step, **and quick-add custom food form**. |
| `app/components/SettingsScreen.tsx` | Appearance toggle (light/dark) + goal editing + sign-out. |
| `app/components/CalorieHero.tsx`, `CalorieRing.tsx`, `MacroCard.tsx`, `FoodRow.tsx`, `AnimatedNumber.tsx`, `TabBar.tsx` | Presentational. |
| `app/lib/foods.ts` | Food/meal/log type defs, hard-coded `FOODS` catalog, `computeTotals`, `entryFood` lookup helper. |
| `app/lib/use-day-log.ts` | `useDayLog` (subscribes to one day), `useMonthLogs` (subscribes to a date range, grouped by day), `logFood`, `removeLogEntry`. |
| `app/lib/use-goals.ts` | `useGoals` (per-user kcal/macro targets). |
| `app/lib/use-theme-mode.ts` | `useThemeMode` + `saveThemeMode` — Firestore-backed `"light" \| "dark"` preference. |
| `app/lib/theme-context.tsx` | `ThemeProvider` + `useTheme()` hook — exposes the active palette. |
| `app/lib/auth-context.tsx`, `firebase.ts`, `theme.ts` | Plumbing. |

## Firestore layout

```
users/{uid}/log/{entryId}
  day: "YYYY-MM-DD"      // local-date key, see todayKey()
  mealId: "breakfast" | "lunch" | "dinner" | "snack"
  foodId: string         // catalog id ("f1"..) OR "custom_<timestamp>" for quick-adds
  servings: number
  loggedAt: number       // ms epoch (used for ordering)
  createdAt: serverTimestamp
  customFood?: Food      // inline snapshot when foodId starts with "custom_"

users/{uid}/goals/current
  kcal, protein, carbs, fat

users/{uid}/settings/appearance
  mode: "light" | "dark"   // dark restores the warm #221A17 palette
```

## Implemented features

- **Google sign-in** with auth gate in `AppShell`.
- **Today view**: animated calorie hero + ring, macro cards (P/C/F) with pulse on log, "short on protein" nudge, per-meal entry list with inline kcal and remove button.
- **Goals**: editable in Settings, stored per user.
- **Add sheet** (bottom-sheet): meal selector, search across `FOODS`, recents list, food detail with serving stepper (±0.5).
- **Macro flash + pulse** on log: dominant macro tints the screen briefly and pulses its card.
- **Quick add custom food** *(new)*: dashed entry at the top of the add list opens a manual form (name, serving label, kcal, P/C/F). Logged with `foodId = "custom_<ts>"` and a `customFood` snapshot stored on the entry — no library/catalog write. Reads use `entryFood(entry)` which prefers the snapshot, falling back to the static catalog.
- **Day rollover**: `todayKey()` is local-date based; `useDayLog` re-subscribes when uid or day changes (note: it does **not** re-subscribe at midnight — see Known gaps).
- **Date navigation** *(new)*: `AppShell` owns a `day` key (defaults to today). `TodayScreen` header has prev/next chevrons and a tappable label that jumps back to today when off. `useDayLog(uid, day)` and `logFood(uid, day, …)` are parameterized — logging on a non-today screen writes to that day. Helpers in `foods.ts`: `parseDayKey`, `shiftDayKey`, `formatDayLabel`.
- **Dark mode toggle** *(new)*: Light/Dark segmented control in Settings. Restores the original warm-dark palette (`#221A17` background, lime/orange accents) from earlier commits. Persisted per-user in Firestore (`users/{uid}/settings/appearance`) via `useThemeMode`/`saveThemeMode`; entire UI re-themes instantly through `ThemeProvider`. Auth screen always renders light (no uid yet).
- **Calendar sheet** *(new)*: slide-up bottom sheet (`CalendarSheet.tsx`) opened from the date label on Today. Month grid; each cell tinted by kcal-hit % vs `goals.kcal` (uses `theme.accent` so it re-tints in dark mode). Today cell outlined; selected `day` outlined more strongly. Tapping a cell sets `day` and closes the sheet. Backed by `useMonthLogs(uid, start, end)` which range-queries `where("day", ">=", start), where("day", "<=", end)`. Month nav via `shiftMonth`/`monthRange` helpers in `foods.ts`.

## Known gaps / next candidates

- **No persisted custom-food library**. Quick-adds are one-off snapshots. If users repeat the same custom item, a `users/{uid}/foods` collection + appearing in search would be the next step.
- **Recents are hard-coded** (`RECENT_IDS` in `foods.ts`) — not user-specific and don't include custom foods.
- **Day rollover at midnight**: subscription doesn't refresh while sitting on "today"; user must reload (or tap a nav arrow and back).
- **No edit on existing log entry** (only delete + re-add).
- **Catalog is static** in code, not in Firestore.
- **No tests** (no test runner configured).
- **No PWA / offline** support.

## Conventions worth remembering

- All visual styling pulls from the active palette via `const { theme } = useTheme()` — don't import `theme` statically and don't introduce new colors/fonts directly. Any new color must be added to *both* `lightTheme` and `darkTheme` in `app/lib/theme.ts`.
- Components are `"use client"` by default; server components are not used yet.
- Inline-snapshot pattern (used for custom foods): when a log entry references data outside the static catalog, store a copy on the entry. Avoids dangling refs when the source is edited or deleted.
- Keep `LogEntry` shape backward-compatible — old entries without `customFood` must keep resolving via `foodById`.

## How to update this file

When you ship a feature, add a one-liner under **Implemented features** (or move one out of **Known gaps**). When you discover a constraint or convention worth preserving across chats, jot it under **Conventions**. Keep entries terse — this is an index, not a changelog.
