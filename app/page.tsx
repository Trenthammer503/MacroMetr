"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

type Entry = {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  createdAt: string;
  updatedAt: string;
};

type DailyLog = {
  id: string;
  date: string;
  entries: Entry[];
  createdAt: string;
  updatedAt: string;
};

type AppData = {
  schemaVersion: 1;
  dailyLogs: Record<string, DailyLog>;
};

type FormState = {
  name: string;
  calories: string;
  protein: string;
  fats: string;
  carbs: string;
};

const emptyForm: FormState = {
  name: "",
  calories: "",
  protein: "",
  fats: "",
  carbs: "",
};

const quickFoods: FormState[] = [
  {
    name: "Greek yogurt",
    calories: "130",
    protein: "18",
    fats: "0",
    carbs: "9",
  },
  {
    name: "Chicken bowl",
    calories: "520",
    protein: "42",
    fats: "14",
    carbs: "55",
  },
  {
    name: "Eggs and toast",
    calories: "340",
    protein: "20",
    fats: "18",
    carbs: "24",
  },
  {
    name: "Protein shake",
    calories: "220",
    protein: "32",
    fats: "4",
    carbs: "12",
  },
];

const KCAL_PER_G = { protein: 4, carbs: 4, fats: 9 } as const;
const APP_STORAGE_KEY = "macrometr:v1";
const LEGACY_ENTRIES_PREFIX = "macrometr:entries:";
const DAILY_CALORIE_GOAL = 2000;

type MacroKey = "protein" | "carbs" | "fats";

const MACROS: Array<{
  key: MacroKey;
  label: string;
  short: string;
  color: string;
  soft: string;
  glow: string;
}> = [
  {
    key: "protein",
    label: "Protein",
    short: "P",
    color: "var(--color-protein)",
    soft: "var(--color-protein-soft)",
    glow: "var(--color-protein-glow)",
  },
  {
    key: "carbs",
    label: "Carbs",
    short: "C",
    color: "var(--color-carbs)",
    soft: "var(--color-carbs-soft)",
    glow: "var(--color-carbs-glow)",
  },
  {
    key: "fats",
    label: "Fats",
    short: "F",
    color: "var(--color-fats)",
    soft: "var(--color-fats-soft)",
    glow: "var(--color-fats-glow)",
  },
];

export default function Home() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDayKey());

  const appStore = useMemo(() => createLocalAppStore(), []);
  const appData = useSyncExternalStore(
    appStore.subscribe,
    appStore.getSnapshot,
    appStore.getServerSnapshot,
  );
  const entries = useMemo(
    () => appData.dailyLogs[selectedDate]?.entries ?? [],
    [appData.dailyLogs, selectedDate],
  );

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
          fats: acc.fats + entry.fats,
          carbs: acc.carbs + entry.carbs,
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 },
      ),
    [entries],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const entry: Entry = {
      id: crypto.randomUUID(),
      date: selectedDate,
      name,
      calories: parseNum(form.calories),
      protein: parseNum(form.protein),
      fats: parseNum(form.fats),
      carbs: parseNum(form.carbs),
      createdAt: now,
      updatedAt: now,
    };

    appStore.setEntriesForDate(selectedDate, [entry, ...entries]);
    setForm(emptyForm);
  }

  function removeEntry(id: string) {
    appStore.setEntriesForDate(
      selectedDate,
      entries.filter((entry) => entry.id !== id),
    );
  }

  function moveSelectedDate(days: number) {
    setSelectedDate((date) => shiftDateKey(date, days));
  }

  return (
    <main className="min-h-dvh overflow-hidden px-4 pb-8 pt-[calc(env(safe-area-inset-top)+14px)] text-[--color-fg]">
      <div className="mx-auto grid w-full max-w-md gap-4 sm:max-w-5xl lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="grid gap-4">
          <Header
            entryCount={entries.length}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onPrevDay={() => moveSelectedDate(-1)}
            onNextDay={() => moveSelectedDate(1)}
            onToday={() => setSelectedDate(getLocalDayKey())}
          />
          <TodayCard totals={totals} />
          <EntryComposer
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
          />
        </div>

        <EntriesSection
          entries={entries}
          onRemove={removeEntry}
          selectedDate={selectedDate}
        />
      </div>
    </main>
  );
}

function Header({
  entryCount,
  selectedDate,
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
}: {
  entryCount: number;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}) {
  return (
    <header className="grid gap-3 sm:flex sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <div className="text-xl font-black tracking-tight">MacroMetr</div>
          <div className="text-xs font-bold text-[--color-muted]">
            {formatDay(selectedDate)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onPrevDay={onPrevDay}
          onNextDay={onNextDay}
          onToday={onToday}
        />
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[--color-outline] bg-[--color-surface] px-3 text-xs font-black tabular-nums text-[--color-fg] shadow-pop-small">
          <span className="h-2 w-2 rounded-full bg-[--color-lime]" />
          {entryCount} logged
        </div>
      </div>
    </header>
  );
}

function DateNavigator({
  selectedDate,
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}) {
  return (
    <div className="inline-flex h-10 items-center gap-1 rounded-full border border-[--color-outline] bg-[--color-surface] p-1 shadow-pop-small">
      <button
        type="button"
        onClick={onPrevDay}
        aria-label="Previous day"
        className="grid h-8 w-8 place-items-center rounded-full text-[--color-fg] transition hover:bg-[--color-bg] active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.7"
          aria-hidden
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <input
        type="date"
        value={selectedDate}
        onChange={(event) => onDateChange(event.target.value || getLocalDayKey())}
        aria-label="Selected log date"
        className="h-8 w-32 rounded-full bg-transparent px-1 text-xs font-black tabular-nums text-[--color-fg] outline-none"
      />
      <button
        type="button"
        onClick={onNextDay}
        aria-label="Next day"
        className="grid h-8 w-8 place-items-center rounded-full text-[--color-fg] transition hover:bg-[--color-bg] active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.7"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onToday}
        className="h-8 rounded-full bg-[--color-fg] px-3 text-xs font-black text-white transition active:scale-95"
      >
        Today
      </button>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="relative grid h-12 w-12 place-items-center rounded-[1.35rem] bg-[--color-fg] text-white shadow-pop">
      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[--color-lime] ring-4 ring-[--color-bg]" />
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        aria-hidden
      >
        <path d="M5 19V8" />
        <path d="M12 19V5" />
        <path d="M19 19v-9" />
      </svg>
    </span>
  );
}

function TodayCard({
  totals,
}: {
  totals: { calories: number; protein: number; fats: number; carbs: number };
}) {
  const proteinKcal = totals.protein * KCAL_PER_G.protein;
  const carbsKcal = totals.carbs * KCAL_PER_G.carbs;
  const fatsKcal = totals.fats * KCAL_PER_G.fats;
  const macroKcal = proteinKcal + carbsKcal + fatsKcal;
  const share = (kcal: number) => (macroKcal > 0 ? (kcal / macroKcal) * 100 : 0);
  const shares = {
    protein: share(proteinKcal),
    carbs: share(carbsKcal),
    fats: share(fatsKcal),
  };

  return (
    <section className="app-card app-card-daily rounded-[2.2rem] p-5 text-white shadow-deep">
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
            Daily board
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[4.3rem] font-black leading-[0.82] tracking-tight tabular-nums sm:text-7xl">
              {Math.round(totals.calories)}
            </span>
            <span className="pb-1.5 text-sm font-black text-white/80">
              / {DAILY_CALORIE_GOAL} kcal
            </span>
          </div>
        </div>

        <CalorieOrb calories={totals.calories} goal={DAILY_CALORIE_GOAL} />
      </div>

      <div className="relative mt-5">
        <DistributionBar shares={shares} hasData={macroKcal > 0} />
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        {MACROS.map((macro) => (
          <MacroStat
            key={macro.key}
            macro={macro}
            grams={totals[macro.key]}
            share={shares[macro.key]}
          />
        ))}
      </div>
    </section>
  );
}

function CalorieOrb({ calories, goal }: { calories: number; goal: number }) {
  const progress = Math.min(Math.round((calories / goal) * 100), 100);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      aria-label={`${Math.round(calories)} of ${goal} calories`}
      className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur"
      role="img"
    >
      <svg viewBox="0 0 100 100" className="absolute h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="var(--color-lime)"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

function DistributionBar({
  shares,
  hasData,
}: {
  shares: Record<MacroKey, number>;
  hasData: boolean;
}) {
  return (
    <div className="flex h-4 overflow-hidden rounded-full bg-white/12 p-1">
      {hasData ? (
        MACROS.map((macro) => (
          <span
            key={macro.key}
            className="bar-segment block h-full min-w-2 rounded-full"
            style={{
              flexGrow: shares[macro.key],
              backgroundColor: macro.color,
              boxShadow: `0 0 18px ${macro.glow}`,
            }}
          />
        ))
      ) : (
        <span className="block h-full w-full rounded-full bg-white/15" />
      )}
    </div>
  );
}

function MacroStat({
  macro,
  grams,
  share,
}: {
  macro: (typeof MACROS)[number];
  grams: number;
  share: number;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/18 bg-black/25 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/78">
          {macro.short}
        </span>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: macro.color, boxShadow: `0 0 14px ${macro.glow}` }}
        />
      </div>
      <div className="mt-2 text-2xl font-black leading-none tabular-nums">
        {round1(grams)}
        <span className="ml-0.5 text-xs font-black text-white/72">g</span>
      </div>
      <div className="mt-1 text-[11px] font-bold tabular-nums text-white/72">
        {Math.round(share)}%
      </div>
    </div>
  );
}

function EntryComposer({
  form,
  setForm,
  onSubmit,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const canSubmit = form.name.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="app-card app-card-add rounded-[2.2rem] p-4 text-white shadow-deep"
    >
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-tight">Quick add</h1>
          <div className="text-xs font-bold text-white/70">
            Tap, type, save, done.
          </div>
        </div>
      </div>

      <QuickFill onSelect={setForm} />

      <Field
        label="Food"
        value={form.name}
        onChange={(value) => setForm({ ...form, name: value })}
        placeholder="What did you eat?"
        autoFocus
      />

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <NumField
          label="Calories"
          unit="kcal"
          value={form.calories}
          onChange={(value) => setForm({ ...form, calories: value })}
        />
        <NumField
          label="Protein"
          unit="g"
          value={form.protein}
          onChange={(value) => setForm({ ...form, protein: value })}
        />
        <NumField
          label="Carbs"
          unit="g"
          value={form.carbs}
          onChange={(value) => setForm({ ...form, carbs: value })}
        />
        <NumField
          label="Fats"
          unit="g"
          value={form.fats}
          onChange={(value) => setForm({ ...form, fats: value })}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="app-button-primary mt-4 inline-flex h-16 w-full items-center justify-center gap-2 rounded-[1.35rem] text-lg font-black transition active:scale-[0.99]"
      >
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.8"
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Add to day
      </button>
    </form>
  );
}

function QuickFill({ onSelect }: { onSelect: (form: FormState) => void }) {
  return (
    <div className="quick-scroll -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 py-1">
      {quickFoods.map((food) => (
        <button
          key={food.name}
          type="button"
          onClick={() => onSelect(food)}
          className="quick-chip shrink-0 rounded-full border border-white/14 bg-white/10 px-3.5 py-2 text-xs font-black leading-none text-white shadow-pop-small transition-colors active:scale-95"
        >
          {food.name}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="mt-2 block">
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/75">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className="app-field-input h-14 w-full rounded-[1.35rem] px-4 text-base font-black outline-none transition"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-white/75">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className="app-field-input h-[58px] w-full rounded-[1.25rem] px-3.5 pr-11 text-lg font-black tabular-nums outline-none transition"
        />
        <span className="app-field-unit pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-black">
          {unit}
        </span>
      </div>
    </label>
  );
}

function EntriesSection({
  entries,
  onRemove,
  selectedDate,
}: {
  entries: Entry[];
  onRemove: (id: string) => void;
  selectedDate: string;
}) {
  return (
    <section
      className="app-card app-card-log rounded-[2.2rem] p-4 text-white shadow-deep lg:sticky lg:top-4"
    >
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">Day log</h2>
          <div className="text-xs font-bold text-white/70">
            {formatDay(selectedDate)}
          </div>
        </div>
        <span className="rounded-full border border-white/14 bg-white/12 px-3 py-1.5 text-xs font-black text-white shadow-pop-small">
          {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="relative mt-4 grid gap-2.5">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="relative mt-4 grid min-h-56 place-items-center rounded-[1.7rem] border border-dashed border-white/28 bg-black/18 p-6 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-white/12 bg-white/10 text-white shadow-float">
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            aria-hidden
          >
            <path d="M4 7h16" />
            <path d="M7 12h10" />
            <path d="M10 17h4" />
          </svg>
        </div>
        <div className="mt-4 text-base font-black">Ready when you are</div>
        <div className="mt-1 max-w-48 text-sm font-semibold text-white/70">
          Quick fills and manual entries will show up here.
        </div>
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  onRemove,
}: {
  entry: Entry;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="animate-row-in rounded-[1.6rem] border border-white/12 bg-black/22 p-3 shadow-pop-small backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-black">{entry.name}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black leading-none tabular-nums">
              {Math.round(entry.calories)}
            </span>
            <span className="text-xs font-black text-white/70">kcal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/14 bg-white/10 text-white/70 transition hover:bg-[--color-danger-soft] hover:text-[--color-danger] active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.7"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {MACROS.map((macro) => (
          <MacroPill key={macro.key} macro={macro} value={entry[macro.key]} />
        ))}
      </div>
    </li>
  );
}

function MacroPill({
  macro,
  value,
}: {
  macro: (typeof MACROS)[number];
  value: number;
}) {
  return (
    <span
      className="inline-flex h-8 items-center justify-center gap-1 rounded-full text-[11px] font-black"
      style={{ backgroundColor: macro.soft, color: macro.color }}
    >
      {macro.short}
      <span className="tabular-nums">
        {round1(value)}
        <span className="opacity-70">g</span>
      </span>
    </span>
  );
}

function parseStoredEntries(value: string, date: string): Entry[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((entry): entry is Entry => {
      if (!entry || typeof entry !== "object") return false;
      const candidate = entry as Record<string, unknown>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.calories === "number" &&
        typeof candidate.protein === "number" &&
        typeof candidate.fats === "number" &&
        typeof candidate.carbs === "number"
      );
    })
    .map((entry) => ({
      ...entry,
      date,
      calories: clampNumber(entry.calories),
      protein: clampNumber(entry.protein),
      fats: clampNumber(entry.fats),
      carbs: clampNumber(entry.carbs),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
}

function createEmptyAppData(): AppData {
  return {
    schemaVersion: 1,
    dailyLogs: {},
  };
}

function parseStoredAppData(value: string | null): AppData {
  if (!value) return createEmptyAppData();

  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object") return createEmptyAppData();

  const candidate = parsed as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    !candidate.dailyLogs ||
    typeof candidate.dailyLogs !== "object"
  ) {
    return createEmptyAppData();
  }

  const dailyLogs: Record<string, DailyLog> = {};
  for (const [date, value] of Object.entries(candidate.dailyLogs as Record<string, unknown>)) {
    if (!isDayKey(date) || !value || typeof value !== "object") continue;
    const log = value as Record<string, unknown>;
    const entries = Array.isArray(log.entries)
      ? log.entries.filter(isStoredEntry).map((entry) => normalizeEntry(entry, date))
      : [];

    dailyLogs[date] = {
      id: typeof log.id === "string" ? log.id : createDailyLogId(date),
      date,
      entries,
      createdAt:
        typeof log.createdAt === "string" ? log.createdAt : new Date().toISOString(),
      updatedAt:
        typeof log.updatedAt === "string" ? log.updatedAt : new Date().toISOString(),
    };
  }

  return {
    schemaVersion: 1,
    dailyLogs,
  };
}

function isStoredEntry(entry: unknown): entry is Entry {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.calories === "number" &&
    typeof candidate.protein === "number" &&
    typeof candidate.fats === "number" &&
    typeof candidate.carbs === "number"
  );
}

function normalizeEntry(entry: Entry, date: string): Entry {
  const now = new Date().toISOString();
  return {
    ...entry,
    date: isDayKey(entry.date) ? entry.date : date,
    calories: clampNumber(entry.calories),
    protein: clampNumber(entry.protein),
    fats: clampNumber(entry.fats),
    carbs: clampNumber(entry.carbs),
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : now,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : now,
  };
}

function createLocalAppStore() {
  const serverSnapshot = createEmptyAppData();
  let lastRaw: string | null | undefined;
  let lastParsed = createEmptyAppData();

  function getRawSnapshot() {
    try {
      return window.localStorage.getItem(APP_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function getSnapshot() {
    const raw = getRawSnapshot();
    if (raw === lastRaw) return lastParsed;

    lastRaw = raw;
    try {
      lastParsed = mergeLegacyLogs(parseStoredAppData(raw));
    } catch {
      lastParsed = mergeLegacyLogs(createEmptyAppData());
    }

    return lastParsed;
  }

  function setAppData(data: AppData) {
    const nextRaw = JSON.stringify(data);
    lastRaw = nextRaw;
    lastParsed = data;

    try {
      window.localStorage.setItem(APP_STORAGE_KEY, nextRaw);
      window.dispatchEvent(new Event("macrometr-storage"));
    } catch {
      // A future sync layer can surface storage failures in the UI.
    }
  }

  function setEntriesForDate(date: string, entries: Entry[]) {
    const current = getSnapshot();
    const now = new Date().toISOString();
    const existing = current.dailyLogs[date];
    const nextLog: DailyLog = {
      id: existing?.id ?? createDailyLogId(date),
      date,
      entries: entries.map((entry) => ({
        ...entry,
        date,
        updatedAt: entry.updatedAt || now,
        createdAt: entry.createdAt || now,
      })),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    setAppData({
      schemaVersion: 1,
      dailyLogs: {
        ...current.dailyLogs,
        [date]: nextLog,
      },
    });
  }

  function subscribe(onStoreChange: () => void) {
    function handleStorage(event: StorageEvent) {
      if (event.key === APP_STORAGE_KEY || event.key?.startsWith(LEGACY_ENTRIES_PREFIX)) {
        onStoreChange();
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("macrometr-storage", onStoreChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("macrometr-storage", onStoreChange);
    };
  }

  return {
    getServerSnapshot: () => serverSnapshot,
    getSnapshot,
    setEntriesForDate,
    subscribe,
  };
}

function mergeLegacyLogs(data: AppData): AppData {
  if (typeof window === "undefined") return data;

  const dailyLogs = { ...data.dailyLogs };
  let changed = false;

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(LEGACY_ENTRIES_PREFIX)) continue;

      const date = key.slice(LEGACY_ENTRIES_PREFIX.length);
      if (!isDayKey(date) || dailyLogs[date]) continue;

      const rawEntries = window.localStorage.getItem(key);
      const entries = rawEntries ? parseStoredEntries(rawEntries, date) : [];
      if (entries.length === 0) continue;

      const now = new Date().toISOString();
      dailyLogs[date] = {
        id: createDailyLogId(date),
        date,
        entries,
        createdAt: now,
        updatedAt: now,
      };
      changed = true;
    }

    if (changed) {
      const migrated = { schemaVersion: 1 as const, dailyLogs };
      window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    return data;
  }

  return data;
}

function getLocalDayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateKey(date: string, days: number) {
  const shifted = createLocalDate(date);
  shifted.setDate(shifted.getDate() + days);
  return toDayKey(shifted);
}

function createLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDayKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function createDailyLogId(date: string) {
  return `daily-log:${date}`;
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(createLocalDate(date));
}

function parseNum(value: string): number {
  return clampNumber(parseFloat(value));
}

function clampNumber(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
