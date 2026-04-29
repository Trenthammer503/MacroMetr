"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

type Entry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
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
const STORAGE_PREFIX = "macrometr:entries";

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

  const todayKey = useMemo(() => getLocalDayKey(), []);
  const storageKey = `${STORAGE_PREFIX}:${todayKey}`;
  const entryStore = useMemo(() => createLocalEntryStore(storageKey), [storageKey]);
  const entries = useSyncExternalStore(
    entryStore.subscribe,
    entryStore.getSnapshot,
    entryStore.getServerSnapshot,
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

  const formCalories = useMemo(() => {
    const enteredCalories = parseNum(form.calories);
    if (enteredCalories > 0) return enteredCalories;
    return (
      parseNum(form.protein) * KCAL_PER_G.protein +
      parseNum(form.carbs) * KCAL_PER_G.carbs +
      parseNum(form.fats) * KCAL_PER_G.fats
    );
  }, [form]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    const entry: Entry = {
      id: crypto.randomUUID(),
      name,
      calories: parseNum(form.calories),
      protein: parseNum(form.protein),
      fats: parseNum(form.fats),
      carbs: parseNum(form.carbs),
    };

    entryStore.setEntries([entry, ...entries]);
    setForm(emptyForm);
  }

  function removeEntry(id: string) {
    entryStore.setEntries(entries.filter((entry) => entry.id !== id));
  }

  return (
    <main className="min-h-dvh overflow-hidden px-4 pb-8 pt-[calc(env(safe-area-inset-top)+14px)] text-[--color-fg]">
      <div className="mx-auto grid w-full max-w-md gap-4 sm:max-w-5xl lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="grid gap-4">
          <Header entryCount={entries.length} />
          <TodayCard totals={totals} count={entries.length} />
          <EntryComposer
            form={form}
            formCalories={formCalories}
            setForm={setForm}
            onSubmit={handleSubmit}
          />
        </div>

        <EntriesSection entries={entries} onRemove={removeEntry} />
      </div>
    </main>
  );
}

function Header({ entryCount }: { entryCount: number }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <div className="text-xl font-black tracking-tight">MacroMetr</div>
          <div className="text-xs font-bold text-[--color-muted]">
            {formatToday()}
          </div>
        </div>
      </div>

      <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[--color-outline] bg-[--color-surface] px-3 text-xs font-black tabular-nums text-[--color-fg] shadow-pop-small">
        <span className="h-2 w-2 rounded-full bg-[--color-lime]" />
        {entryCount} logged
      </div>
    </header>
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
  count,
}: {
  totals: { calories: number; protein: number; fats: number; carbs: number };
  count: number;
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
    <section className="dashboard-card relative overflow-hidden rounded-[2.2rem] p-5 text-white shadow-deep">
      <div className="dashboard-glow dashboard-glow-one" />
      <div className="dashboard-glow dashboard-glow-two" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
            Daily board
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[4.3rem] font-black leading-[0.82] tracking-tight tabular-nums sm:text-7xl">
              {Math.round(totals.calories)}
            </span>
            <span className="pb-1.5 text-sm font-black text-white/80">kcal</span>
          </div>
        </div>

        <CalorieOrb count={count} calories={totals.calories} />
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

function CalorieOrb({ count, calories }: { count: number; calories: number }) {
  const progress = Math.min(Math.round((calories / 2400) * 100), 100);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur">
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
      <div className="text-center">
        <div className="text-2xl font-black tabular-nums">{count}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/75">
          foods
        </div>
      </div>
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
  formCalories,
  setForm,
  onSubmit,
}: {
  form: FormState;
  formCalories: number;
  setForm: (form: FormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const canSubmit = form.name.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="panel-add rounded-[2.2rem] border border-[--color-outline] p-4 shadow-playful"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-tight">Fast add</h1>
          <div className="text-xs font-bold text-[--color-muted-strong]">
            Tap, type, save, done.
          </div>
        </div>
        <div className="rounded-2xl border border-[--color-outline] bg-[--color-lime-soft] px-3 py-2 text-right shadow-pop-small">
          <div className="text-xl font-black leading-none tabular-nums">
            {Math.round(formCalories)}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[--color-muted-strong]">
            preview
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
        className="primary-submit mt-4 inline-flex h-16 w-full items-center justify-center gap-2 rounded-[1.35rem] border border-[--color-outline] text-lg font-black transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
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
        Add to today
      </button>
    </form>
  );
}

function QuickFill({ onSelect }: { onSelect: (form: FormState) => void }) {
  return (
    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
      {quickFoods.map((food) => (
        <button
          key={food.name}
          type="button"
          onClick={() => onSelect(food)}
          className="quick-chip shrink-0 rounded-full border border-[--color-outline] bg-[--color-surface] px-3.5 py-2 text-xs font-black text-[--color-fg] shadow-pop-small transition active:scale-95"
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
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[--color-muted-strong]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className="h-14 w-full rounded-[1.35rem] border-2 border-[--color-input-border] bg-white px-4 text-base font-black text-[--color-fg] shadow-input outline-none transition placeholder:text-[--color-placeholder] focus:border-[--color-accent] focus:bg-white focus:ring-4 focus:ring-[--color-accent-ring]"
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
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[--color-muted-strong]">
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
          className="h-[58px] w-full rounded-[1.25rem] border-2 border-[--color-input-border] bg-white px-3.5 pr-11 text-lg font-black tabular-nums text-[--color-fg] shadow-input outline-none transition placeholder:text-[--color-placeholder] focus:border-[--color-accent] focus:bg-white focus:ring-4 focus:ring-[--color-accent-ring]"
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-[--color-surface-2] px-1.5 py-0.5 text-[10px] font-black text-[--color-muted-strong]">
          {unit}
        </span>
      </div>
    </label>
  );
}

function EntriesSection({
  entries,
  onRemove,
}: {
  entries: Entry[];
  onRemove: (id: string) => void;
}) {
  return (
    <section className="panel-log rounded-[2.2rem] border border-[--color-outline] p-4 shadow-playful lg:sticky lg:top-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">Today&apos;s log</h2>
          <div className="text-xs font-bold text-[--color-muted-strong]">
            Swipe the day forward, one food at a time.
          </div>
        </div>
        <span className="rounded-full border border-[--color-outline] bg-[--color-blush] px-3 py-1.5 text-xs font-black text-[--color-fg] shadow-pop-small">
          {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-4 grid gap-2.5">
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
    <div className="mt-4 grid min-h-56 place-items-center rounded-[1.7rem] border-2 border-dashed border-[--color-fg] bg-white/75 p-6 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[--color-sky-soft] text-[--color-sky] shadow-float">
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
        <div className="mt-1 max-w-48 text-sm font-semibold text-[--color-muted-strong]">
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
    <li className="animate-row-in rounded-[1.6rem] border border-[--color-outline] bg-[--color-surface] p-3 shadow-pop-small">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-black">{entry.name}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black leading-none tabular-nums">
              {Math.round(entry.calories)}
            </span>
            <span className="text-xs font-black text-[--color-muted-strong]">kcal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[--color-border-strong] bg-[--color-surface-2] text-[--color-muted-strong] transition hover:bg-[--color-danger-soft] hover:text-[--color-danger] active:scale-95"
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

function parseStoredEntries(value: string): Entry[] {
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
      calories: clampNumber(entry.calories),
      protein: clampNumber(entry.protein),
      fats: clampNumber(entry.fats),
      carbs: clampNumber(entry.carbs),
    }));
}

function createLocalEntryStore(storageKey: string) {
  const serverSnapshot: Entry[] = [];
  let lastRaw: string | null = null;
  let lastParsed: Entry[] = [];

  function getRawSnapshot() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function getSnapshot() {
    const raw = getRawSnapshot();
    if (raw === lastRaw) return lastParsed;

    lastRaw = raw;
    if (!raw) {
      lastParsed = [];
      return lastParsed;
    }

    try {
      lastParsed = parseStoredEntries(raw);
    } catch {
      lastParsed = [];
    }

    return lastParsed;
  }

  function setEntries(entries: Entry[]) {
    const nextRaw = JSON.stringify(entries);
    lastRaw = nextRaw;
    lastParsed = entries;

    try {
      window.localStorage.setItem(storageKey, nextRaw);
      window.dispatchEvent(new Event("macrometr-storage"));
    } catch {
      // A future sync layer can surface storage failures in the UI.
    }
  }

  function subscribe(onStoreChange: () => void) {
    function handleStorage(event: StorageEvent) {
      if (event.key === storageKey) onStoreChange();
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
    setEntries,
    subscribe,
  };
}

function getLocalDayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
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
