"use client";

import { useMemo, useState } from "react";

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

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          fats: acc.fats + e.fats,
          carbs: acc.carbs + e.carbs,
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
    setEntries((prev) => [entry, ...prev]);
    setForm(emptyForm);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pt-6 pb-32 sm:max-w-xl sm:px-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Macro<span className="text-[--color-accent]">Metr</span>
        </h1>
        <span className="text-xs uppercase tracking-widest text-[--color-muted]">
          Today
        </span>
      </header>

      <TotalsCard totals={totals} count={entries.length} />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-4 shadow-lg shadow-black/30"
      >
        <h2 className="mb-3 text-sm font-medium text-[--color-muted]">
          Add food
        </h2>

        <Field
          label="Food"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="e.g. Chicken breast"
          autoFocus
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumField
            label="Calories"
            unit="kcal"
            value={form.calories}
            onChange={(v) => setForm({ ...form, calories: v })}
          />
          <NumField
            label="Protein"
            unit="g"
            value={form.protein}
            onChange={(v) => setForm({ ...form, protein: v })}
          />
          <NumField
            label="Fats"
            unit="g"
            value={form.fats}
            onChange={(v) => setForm({ ...form, fats: v })}
          />
          <NumField
            label="Carbs"
            unit="g"
            value={form.carbs}
            onChange={(v) => setForm({ ...form, carbs: v })}
          />
        </div>

        <button
          type="submit"
          disabled={!form.name.trim()}
          className="mt-5 h-12 w-full rounded-xl bg-[--color-accent] font-semibold text-[--color-accent-fg] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save entry
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-sm font-medium text-[--color-muted]">
          Entries {entries.length > 0 && `(${entries.length})`}
        </h2>
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[--color-border] p-6 text-center text-sm text-[--color-muted]">
            No entries yet. Log your first food above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((e) => (
              <EntryRow key={e.id} entry={e} onRemove={removeEntry} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function TotalsCard({
  totals,
  count,
}: {
  totals: { calories: number; protein: number; fats: number; carbs: number };
  count: number;
}) {
  return (
    <div className="rounded-2xl border border-[--color-border] bg-gradient-to-b from-[--color-surface-2] to-[--color-surface] p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-[--color-muted]">
            Calories
          </div>
          <div className="mt-1 text-4xl font-semibold tabular-nums">
            {Math.round(totals.calories)}
            <span className="ml-1 text-base font-normal text-[--color-muted]">
              kcal
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-[--color-muted]">
          {count} {count === 1 ? "entry" : "entries"}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MacroPill label="Protein" value={totals.protein} tint="#60a5fa" />
        <MacroPill label="Fats" value={totals.fats} tint="#f59e0b" />
        <MacroPill label="Carbs" value={totals.carbs} tint="#a78bfa" />
      </div>
    </div>
  );
}

function MacroPill({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-bg]/40 px-3 py-2">
      <div
        className="text-[10px] font-medium uppercase tracking-wider"
        style={{ color: tint }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">
        {round1(value)}
        <span className="ml-0.5 text-xs font-normal text-[--color-muted]">
          g
        </span>
      </div>
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
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[--color-muted]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-[--color-border] bg-[--color-surface-2] px-3 text-base text-[--color-fg] placeholder:text-[--color-muted]/60 outline-none transition focus:border-[--color-accent]/60 focus:ring-2 focus:ring-[--color-accent]/30"
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
  onChange: (v: string) => void;
  unit?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[--color-muted]">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="h-11 w-full rounded-xl border border-[--color-border] bg-[--color-surface-2] px-3 pr-10 text-base tabular-nums text-[--color-fg] placeholder:text-[--color-muted]/60 outline-none transition focus:border-[--color-accent]/60 focus:ring-2 focus:ring-[--color-accent]/30"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[--color-muted]">
            {unit}
          </span>
        )}
      </div>
    </label>
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
    <li className="flex items-center gap-3 rounded-2xl border border-[--color-border] bg-[--color-surface] px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{entry.name}</div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[--color-muted] tabular-nums">
          <span>{Math.round(entry.calories)} kcal</span>
          <span>
            P <span className="text-[#60a5fa]">{round1(entry.protein)}g</span>
          </span>
          <span>
            F <span className="text-[#f59e0b]">{round1(entry.fats)}g</span>
          </span>
          <span>
            C <span className="text-[#a78bfa]">{round1(entry.carbs)}g</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        aria-label={`Remove ${entry.name}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[--color-border] text-[--color-muted] transition hover:border-red-500/40 hover:text-red-400 active:scale-95"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </li>
  );
}

function parseNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
