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

const KCAL_PER_G = { protein: 4, carbs: 4, fats: 9 } as const;
const STORAGE_PREFIX = "macrometr:entries";

type MacroKey = "protein" | "carbs" | "fats";

const MACROS: Array<{
  key: MacroKey;
  label: string;
  short: string;
  color: string;
  soft: string;
}> = [
  {
    key: "protein",
    label: "Protein",
    short: "P",
    color: "var(--color-protein)",
    soft: "var(--color-protein-soft)",
  },
  {
    key: "carbs",
    label: "Carbs",
    short: "C",
    color: "var(--color-carbs)",
    soft: "var(--color-carbs-soft)",
  },
  {
    key: "fats",
    label: "Fats",
    short: "F",
    color: "var(--color-fats)",
    soft: "var(--color-fats-soft)",
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+14px)] sm:max-w-2xl sm:px-6">
      <Header entryCount={entries.length} />

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_18rem] sm:items-start">
        <div className="grid gap-4">
          <DaySummary totals={totals} count={entries.length} />
          <EntryForm form={form} setForm={setForm} onSubmit={handleSubmit} />
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
          <div className="text-lg font-bold tracking-tight text-[--color-fg]">
            MacroMetr
          </div>
          <div className="text-xs font-medium text-[--color-muted]">
            {formatToday()}
          </div>
        </div>
      </div>

      <div className="rounded-full border border-[--color-border] bg-[--color-surface] px-3 py-1.5 text-xs font-semibold tabular-nums text-[--color-muted] shadow-soft">
        {entryCount} {entryCount === 1 ? "item" : "items"}
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[--color-fg] text-white shadow-soft">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        aria-hidden
      >
        <path d="M5 19V8" />
        <path d="M12 19V5" />
        <path d="M19 19v-8" />
      </svg>
    </span>
  );
}

function DaySummary({
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
    <section className="rounded-[2rem] bg-[--color-fg] p-5 text-white shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Today
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-bold leading-none tracking-tight tabular-nums">
              {Math.round(totals.calories)}
            </span>
            <span className="pb-1.5 text-sm font-semibold text-white/55">
              kcal
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
          <div className="text-2xl font-bold tabular-nums">{count}</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
            logged
          </div>
        </div>
      </div>

      <DistributionBar shares={shares} hasData={macroKcal > 0} />

      <div className="mt-4 grid grid-cols-3 gap-2">
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

function DistributionBar({
  shares,
  hasData,
}: {
  shares: Record<MacroKey, number>;
  hasData: boolean;
}) {
  return (
    <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-white/10">
      {hasData ? (
        MACROS.map((macro) => (
          <span
            key={macro.key}
            className="bar-segment block h-full min-w-1"
            style={{
              flexGrow: shares[macro.key],
              backgroundColor: macro.color,
            }}
          />
        ))
      ) : (
        <span className="block h-full w-full bg-white/10" />
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
    <div className="rounded-2xl bg-white/[0.07] p-3">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: macro.color }}
          aria-hidden
        />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          {macro.label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold leading-none tabular-nums">
        {round1(grams)}
        <span className="ml-0.5 text-xs font-semibold text-white/45">g</span>
      </div>
      <div className="mt-1 text-[11px] font-semibold tabular-nums text-white/45">
        {Math.round(share)}%
      </div>
    </div>
  );
}

function EntryForm({
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
      className="rounded-[2rem] border border-[--color-border] bg-[--color-surface] p-4 shadow-soft"
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-base font-bold text-[--color-fg]">Add food</h1>
        <span className="rounded-full bg-[--color-accent-soft] px-2.5 py-1 text-[11px] font-bold text-[--color-accent-strong]">
          Quick log
        </span>
      </div>

      <Field
        label="Food"
        value={form.name}
        onChange={(value) => setForm({ ...form, name: value })}
        placeholder="Chicken bowl"
        autoFocus
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
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
        className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[--color-accent] text-base font-bold text-[--color-accent-fg] shadow-action transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[--color-surface-3] disabled:text-[--color-subtle] disabled:shadow-none"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Save
      </button>
    </form>
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
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[--color-muted]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className="h-[52px] w-full rounded-2xl border border-[--color-border] bg-[--color-surface-2] px-4 text-base font-semibold text-[--color-fg] outline-none transition placeholder:text-[--color-subtle] focus:border-[--color-accent] focus:bg-white focus:ring-4 focus:ring-[--color-accent-ring]"
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
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[--color-muted]">
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
          className="h-[52px] w-full rounded-2xl border border-[--color-border] bg-[--color-surface-2] px-4 pr-12 text-base font-semibold tabular-nums text-[--color-fg] outline-none transition placeholder:text-[--color-subtle] focus:border-[--color-accent] focus:bg-white focus:ring-4 focus:ring-[--color-accent-ring]"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[--color-subtle]">
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
    <section className="rounded-[2rem] border border-[--color-border] bg-[--color-surface] p-4 shadow-soft sm:sticky sm:top-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[--color-fg]">Food log</h2>
        <span className="text-xs font-semibold tabular-nums text-[--color-muted]">
          {entries.length} today
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-2">
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
    <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-[--color-border-strong] bg-[--color-surface-2] p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[--color-muted] shadow-soft">
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M4 7h16" />
            <path d="M7 12h10" />
            <path d="M10 17h4" />
          </svg>
        </div>
        <div className="mt-3 text-sm font-bold text-[--color-fg]">
          No entries yet
        </div>
        <div className="mt-1 text-xs font-medium text-[--color-muted]">
          Saved foods appear here.
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
    <li className="animate-row-in rounded-3xl border border-[--color-border] bg-[--color-surface-2] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[--color-fg]">
            {entry.name}
          </div>
          <div className="mt-1 text-xl font-bold leading-none tabular-nums text-[--color-fg]">
            {Math.round(entry.calories)}
            <span className="ml-1 text-xs font-bold text-[--color-muted]">
              kcal
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.name}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[--color-muted] shadow-soft transition hover:text-[--color-danger] active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.3"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {MACROS.map((macro) => (
          <MacroChip key={macro.key} macro={macro} value={entry[macro.key]} />
        ))}
      </div>
    </li>
  );
}

function MacroChip({
  macro,
  value,
}: {
  macro: (typeof MACROS)[number];
  value: number;
}) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold"
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
