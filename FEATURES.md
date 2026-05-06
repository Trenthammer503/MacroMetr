# macrometr — Features & Progress

A running ledger of what's built, how it's wired, and what's planned. Read this first when starting a new chat so you have shared context with prior sessions.

## Stack

- **Framework**: Next.js 16.2.4 (App Router). See `AGENTS.md` — this is a breaking-change version; consult `node_modules/next/dist/docs/` before assuming any API.
- **React**: 19.2.4
- **Styling**: Tailwind v4 + inline styles via a central `theme` object (`app/lib/theme.ts`). No CSS modules.
- **Backend**: Firebase (Auth + Firestore) — config in `app/lib/firebase.ts`.
- **Auth**: Google sign-in only (`app/components/AuthScreen.tsx`, `app/lib/auth-context.tsx`).
- **Lint**: `eslint-config-next`. Run `npm run lint`.

## File map

| Path | Purpose |
|---|---|
| `app/page.tsx` | Renders `<AppShell />`. |
| `app/components/AppShell.tsx` | Top-level routing between auth / today / settings tabs, owns add-sheet + flash/pulse animation state. |
| `app/components/TodayScreen.tsx` | Day view: hero ring, macro cards, protein nudge, per-meal item lists. |
| `app/components/AddSheet.tsx` | Bottom-sheet food picker with search, recents, detail/serving step, **and quick-add custom food form**. |
| `app/components/SettingsScreen.tsx` | Goal editing + sign-out. |
| `app/components/CalorieHero.tsx`, `CalorieRing.tsx`, `MacroCard.tsx`, `FoodRow.tsx`, `AnimatedNumber.tsx`, `TabBar.tsx` | Presentational. |
| `app/lib/foods.ts` | Food/meal/log type defs, hard-coded `FOODS` catalog, `computeTotals`, `entryFood` lookup helper. |
| `app/lib/use-day-log.ts` | `useDayLog` (subscribes to today's entries), `logFood`, `removeLogEntry`. |
| `app/lib/use-goals.ts` | `useGoals` (per-user kcal/macro targets). |
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
```

## Implemented features

- **Google sign-in** with auth gate in `AppShell`.
- **Today view**: animated calorie hero + ring, macro cards (P/C/F) with pulse on log, "short on protein" nudge, per-meal entry list with inline kcal and remove button.
- **Goals**: editable in Settings, stored per user.
- **Add sheet** (bottom-sheet): meal selector, search across `FOODS`, recents list, food detail with serving stepper (±0.5).
- **Macro flash + pulse** on log: dominant macro tints the screen briefly and pulses its card.
- **Quick add custom food** *(new)*: dashed entry at the top of the add list opens a manual form (name, serving label, kcal, P/C/F). Logged with `foodId = "custom_<ts>"` and a `customFood` snapshot stored on the entry — no library/catalog write. Reads use `entryFood(entry)` which prefers the snapshot, falling back to the static catalog.
- **Day rollover**: `todayKey()` is local-date based; `useDayLog` re-subscribes when uid changes (note: it does **not** re-subscribe at midnight — see Known gaps).

## Known gaps / next candidates

- **No persisted custom-food library**. Quick-adds are one-off snapshots. If users repeat the same custom item, a `users/{uid}/foods` collection + appearing in search would be the next step.
- **Recents are hard-coded** (`RECENT_IDS` in `foods.ts`) — not user-specific and don't include custom foods.
- **No date navigation** — only "today" is viewable/editable.
- **Day rollover at midnight**: subscription doesn't refresh; user must reload.
- **No edit on existing log entry** (only delete + re-add).
- **Catalog is static** in code, not in Firestore.
- **No tests** (no test runner configured).
- **No PWA / offline** support.

## Conventions worth remembering

- All visual styling pulls from `theme` — don't introduce new colors/fonts directly.
- Components are `"use client"` by default; server components are not used yet.
- Inline-snapshot pattern (used for custom foods): when a log entry references data outside the static catalog, store a copy on the entry. Avoids dangling refs when the source is edited or deleted.
- Keep `LogEntry` shape backward-compatible — old entries without `customFood` must keep resolving via `foodById`.

## How to update this file

When you ship a feature, add a one-liner under **Implemented features** (or move one out of **Known gaps**). When you discover a constraint or convention worth preserving across chats, jot it under **Conventions**. Keep entries terse — this is an index, not a changelog.
