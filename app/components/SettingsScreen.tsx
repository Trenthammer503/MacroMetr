"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useTheme } from "../lib/theme-context";
import { ThemeMode } from "../lib/theme";
import { Goals } from "../lib/foods";
import { saveGoals } from "../lib/use-goals";

type Props = {
  uid: string;
  email: string | null;
  goals: Goals;
  mode: ThemeMode;
  onChangeMode: (mode: ThemeMode) => void;
};

export function SettingsScreen(props: Props) {
  const goalsKey = `${props.goals.kcal}-${props.goals.protein}-${props.goals.carbs}-${props.goals.fat}`;
  return <SettingsForm key={goalsKey} {...props} />;
}

function SettingsForm({ uid, email, goals, mode, onChangeMode }: Props) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState<Goals>(goals);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    draft.kcal !== goals.kcal ||
    draft.protein !== goals.protein ||
    draft.carbs !== goals.carbs ||
    draft.fat !== goals.fat;

  const onSave = async () => {
    setSaving(true);
    try {
      await saveGoals(uid, draft);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "8px 20px 120px" }}>
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 11,
          fontWeight: 600,
          color: theme.inkMute,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        Profile
      </div>
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 28,
          fontWeight: 600,
          color: theme.ink,
          letterSpacing: -0.8,
          marginTop: 2,
          marginBottom: 18,
        }}
      >
        Settings
      </div>

      <div
        style={{
          background: theme.surface,
          border: `0.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 11,
            fontWeight: 600,
            color: theme.inkMute,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Signed in as
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 14,
            color: theme.ink,
            wordBreak: "break-all",
          }}
        >
          {email ?? "—"}
        </div>
      </div>

      <div
        style={{
          background: theme.surface,
          border: `0.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 16,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.2,
            marginBottom: 12,
          }}
        >
          Appearance
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            background: theme.surfaceAlt,
            padding: 4,
            borderRadius: 999,
          }}
        >
          {(["light", "dark"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => onChangeMode(m)}
                style={{
                  appearance: "none",
                  border: "none",
                  background: active ? theme.chip : "transparent",
                  color: active ? theme.chipInk : theme.inkSoft,
                  padding: "10px 14px",
                  borderRadius: 999,
                  fontFamily: theme.fontDisplay,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  cursor: active ? "default" : "pointer",
                  textTransform: "capitalize",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: theme.surface,
          border: `0.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 16,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.2,
            marginBottom: 4,
          }}
        >
          Macro goals
        </div>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 13,
            color: theme.inkSoft,
            marginBottom: 16,
          }}
        >
          Set daily targets. Used by every screen.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoalField
            label="Calories"
            unit="kcal"
            value={draft.kcal}
            color={theme.accent}
            onChange={(v) => setDraft({ ...draft, kcal: v })}
          />
          <GoalField
            label="Protein"
            unit="g"
            value={draft.protein}
            color={theme.p}
            onChange={(v) => setDraft({ ...draft, protein: v })}
          />
          <GoalField
            label="Carbs"
            unit="g"
            value={draft.carbs}
            color={theme.c}
            onChange={(v) => setDraft({ ...draft, carbs: v })}
          />
          <GoalField
            label="Fat"
            unit="g"
            value={draft.fat}
            color={theme.f}
            onChange={(v) => setDraft({ ...draft, fat: v })}
          />
        </div>

        <button
          onClick={onSave}
          disabled={!dirty || saving}
          style={{
            appearance: "none",
            border: "none",
            marginTop: 18,
            width: "100%",
            padding: "14px",
            background: dirty ? theme.chip : theme.surfaceAlt,
            color: dirty ? theme.chipInk : theme.inkMute,
            borderRadius: 999,
            fontFamily: theme.fontDisplay,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: -0.2,
            cursor: dirty && !saving ? "pointer" : "default",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving
            ? "Saving…"
            : dirty
              ? "Save goals"
              : savedAt
                ? "Saved"
                : "Goals saved"}
        </button>
      </div>

      <button
        onClick={() => signOut(auth)}
        style={{
          appearance: "none",
          border: `1px solid ${theme.borderStrong}`,
          background: theme.surface,
          color: theme.f,
          width: "100%",
          padding: "14px",
          borderRadius: 999,
          fontFamily: theme.fontDisplay,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: -0.2,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}

function GoalField({
  label,
  unit,
  value,
  color,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const { theme } = useTheme();
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: theme.surfaceAlt,
        padding: "12px 14px",
        borderRadius: 14,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          borderRadius: 4,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 14,
          fontWeight: 600,
          color: theme.ink,
          flex: 1,
        }}
      >
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          fontFamily: theme.fontMono,
          fontSize: 18,
          fontWeight: 700,
          color: theme.ink,
          textAlign: "right",
          width: 80,
          letterSpacing: -0.4,
          outline: "none",
        }}
      />
      <span
        style={{
          fontFamily: theme.fontMono,
          fontSize: 12,
          color: theme.inkMute,
          minWidth: 30,
        }}
      >
        {unit}
      </span>
    </label>
  );
}
