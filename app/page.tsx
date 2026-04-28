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

const KCAL_PER_G = { protein: 4, carbs: 4, fats: 9 } as const;

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
      <Header />
      <Hero totals={totals} count={entries.length} />
      <EntryForm form={form} setForm={setForm} onSubmit={handleSubmit} />
      <EntriesSection entries={entries} onRemove={removeEntry} />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="text-lg font-semibold tracking-tight">
          Macro<span className="text-[--color-accent]">Metr</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[--color-border] bg-[--color-surface]/60 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[--color-muted] backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[--color-accent] [animation:pulse-ring_2.4s_ease-in-out_infinite]" />
        Today
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[--color-accent] to-[--color-accent-strong] text-[--color-accent-fg] shadow-[0_0_24px_-4px_rgba(163,230,53,0.5)]">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 19V6" />
        <path d="M10 19v-9" />
        <path d="M16 19v-5" />
        <path d="M22 19H2" />
      </svg>
    </span>
  );
}

function Hero({
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

  const share = (k: number) => (macroKcal > 0 ? (k / macroKcal) * 100 : 0);
  const shares = {
    protein: share(proteinKcal),
    carbs: share(carbsKcal),
    fats: share(fatsKcal),
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[--color-border] bg-gradient-to-b from-[--color-surface-2] to-[--color-surface] p-5 shadow-2xl shadow-black/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[--color-accent]/10 blur-3xl"
      />

      <div className="relative flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[--color-muted]">
            Total intake
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-semibold tabular-nums text-transparent sm:text-6xl">
              {Math.round(totals.calories)}
            </span>
            <span className="text-sm font-medium text-[--color-muted]">
              kcal
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{count}</div>
          <div className="text-[11px] uppercase tracking-widest text-[--color-subtle]">
            {count === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>

      <DistributionBar shares={shares} hasData={macroKcal > 0} />

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <MacroStat
          label="Protein"
          grams={totals.protein}
          share={shares.protein}
          color="var(--color-protein)"
        />
        <MacroStat
          label="Carbs"
          grams={totals.carbs}
          share={shares.carbs}
          color="var(--color-carbs)"
        />
        <MacroStat
          label="Fats"
          grams={totals.fats}
          share={shares.fats}
          color="var(--color-fats)"
        />
      </div>
    </section>
  );
}

function DistributionBar({
  shares,
  hasData,
}: {
  shares: { protein: number; carbs: number; fats: number };
  hasData: boolean;
}) {
  return (
    <div className="relative mt-5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[--color-bg]/60 ring-1 ring-inset ring-[--color-border]">
        {hasData ? (
          <>
            <span
              className="bar-segment block h-full bg-[--color-protein]"
              style={{ flexGrow: shares.protein }}
            />
            <span
              className="bar-segment block h-full bg-[--color-carbs]"
              style={{ flexGrow: shares.carbs }}
            />
            <span
              className="bar-segment block h-full bg-[--color-fats]"
              style={{ flexGrow: shares.fats }}
            />
          </>
        ) : (
          <span className="block h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)]" />
        )}
      </div>
    </div>
  );
}

function MacroStat({
  label,
  grams,
  share,
  color,
}: {
  label: string;
  grams: number;
  share: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-bg]/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-muted]">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums">
          {round1(grams)}
        </span>
        <span className="text-[11px] font-medium text-[--color-subtle]">
          g
        </span>
      </div>
      <div className="mt-0.5 text-[10px] tabular-nums text-[--color-subtle]">
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
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const canSubmit = form.name.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[--color-border] bg-[--color-surface]/80 p-4 shadow-xl shadow-black/30 backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Add food</h2>
        <span className="text-[11px] uppercase tracking-widest text-[--color-subtle]">
          Quick log
        </span>
      </div>

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
          accent="var(--color-accent)"
        />
        <NumField
          label="Protein"
          unit="g"
          value={form.protein}
          onChange={(v) => setForm({ ...form, protein: v })}
          accent="var(--color-protein)"
        />
        <NumField
          label="Carbs"
          unit="g"
          value={form.carbs}
          onChange={(v) => setForm({ ...form, carbs: v })}
          accent="var(--color-carbs)"
        />
        <NumField
          label="Fats"
          unit="g"
          value={form.fats}
          onChange={(v) => setForm({ ...form, fats: v })}
          accent="var(--color-fats)"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative mt-5 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-[--color-accent] to-[--color-accent-strong] font-semibold text-[--color-accent-fg] shadow-[0_8px_24px_-8px_rgba(163,230,53,0.6)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Save entry
      </button>
    </form>
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
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">Entries</h2>
        {entries.length > 0 && (
          <span className="text-[11px] tabular-nums text-[--color-subtle]">
            {entries.length} logged
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[--color-border] bg-[--color-surface]/30 p-8 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-[--color-border] bg-[--color-surface] text-[--color-subtle]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93l2.83 2.83" />
          <path d="M16.24 16.24l2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="M4.93 19.07l2.83-2.83" />
          <path d="M16.24 7.76l2.83-2.83" />
        </svg>
      </span>
      <div>
        <div className="text-sm font-medium">Nothing logged yet</div>
        <div className="mt-0.5 text-xs text-[--color-muted]">
          Add a food above to start your day.
        </div>
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[--color-muted]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-[--color-border] bg-[--color-surface-2] px-3.5 text-base text-[--color-fg] placeholder:text-[--color-subtle] outline-none transition focus:border-[--color-accent]/60 focus:bg-[--color-surface-2] focus:ring-2 focus:ring-[--color-accent]/25"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  unit,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  accent?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[--color-muted]">
        {accent && (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        )}
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
          className="h-12 w-full rounded-xl border border-[--color-border] bg-[--color-surface-2] px-3.5 pr-12 text-base tabular-nums text-[--color-fg] placeholder:text-[--color-subtle] outline-none transition focus:border-[--color-accent]/60 focus:ring-2 focus:ring-[--color-accent]/25"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[--color-subtle]">
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
    <li className="animate-row-in group flex items-center gap-3 rounded-2xl border border-[--color-border] bg-[--color-surface]/80 px-4 py-3 transition hover:border-[--color-border-strong]">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-medium">{entry.name}</span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-[--color-fg]">
            {Math.round(entry.calories)}
            <span className="ml-0.5 text-[10px] font-medium text-[--color-subtle]">
              kcal
            </span>
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] tabular-nums text-[--color-muted]">
          <MacroChip label="P" value={entry.protein} color="var(--color-protein)" />
          <MacroChip label="C" value={entry.carbs} color="var(--color-carbs)" />
          <MacroChip label="F" value={entry.fats} color="var(--color-fats)" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        aria-label={`Remove ${entry.name}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[--color-border] text-[--color-subtle] opacity-60 transition hover:border-red-500/40 hover:text-red-400 hover:opacity-100 active:scale-95 group-hover:opacity-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </li>
  );
}

function MacroChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-1 w-1 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-[--color-subtle]">{label}</span>
      <span className="font-medium text-[--color-fg]/90">
        {round1(value)}
        <span className="text-[--color-subtle]">g</span>
      </span>
    </span>
  );
}

function parseNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
