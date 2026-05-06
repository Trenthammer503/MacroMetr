"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { theme } from "../lib/theme";

export function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        fontFamily: theme.fontDisplay,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 11,
            fontWeight: 600,
            color: theme.inkMute,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Macrometr
        </div>
        <h1
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 36,
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: -1.2,
            margin: "8px 0 4px",
            lineHeight: 1.05,
          }}
        >
          {mode === "signin" ? "Welcome back." : "Track your macros."}
        </h1>
        <p
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 15,
            color: theme.inkSoft,
            margin: 0,
            marginBottom: 28,
          }}
        >
          {mode === "signin"
            ? "Log in to keep your streak alive."
            : "Hit your goals. No fluff."}
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />

          {error && (
            <div
              style={{
                background: "rgba(255,87,34,0.08)",
                color: theme.f,
                fontFamily: theme.fontDisplay,
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 12,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            style={{
              appearance: "none",
              border: "none",
              padding: "16px",
              background: theme.accent,
              color: theme.accentInk,
              borderRadius: 999,
              fontFamily: theme.fontDisplay,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: -0.2,
              cursor: busy ? "default" : "pointer",
              opacity: busy || !email || !password ? 0.5 : 1,
              marginTop: 8,
              boxShadow: `0 8px 24px ${theme.accent}66`,
            }}
          >
            {busy
              ? "Working…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontFamily: theme.fontDisplay,
            fontSize: 13,
            color: theme.inkSoft,
          }}
        >
          {mode === "signin" ? "New here?" : "Have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: theme.fontDisplay,
              fontSize: 13,
              fontWeight: 700,
              color: theme.ink,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: theme.fontDisplay,
          fontSize: 11,
          fontWeight: 600,
          color: theme.inkMute,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          appearance: "none",
          border: `1px solid ${theme.border}`,
          background: theme.surface,
          padding: "14px 16px",
          borderRadius: 14,
          fontFamily: theme.fontDisplay,
          fontSize: 16,
          color: theme.ink,
          letterSpacing: -0.2,
          outline: "none",
        }}
      />
    </label>
  );
}
