"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useTheme } from "../lib/theme-context";

const provider = new GoogleAuthProvider();

export function AuthScreen() {
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else {
        const message = err instanceof Error ? err.message : "Sign-in failed";
        setError(message.replace("Firebase: ", ""));
      }
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
          Track your macros.
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
          Hit your goals. No fluff.
        </p>

        <button
          onClick={onGoogle}
          disabled={busy}
          style={{
            appearance: "none",
            border: `1px solid ${theme.borderStrong}`,
            background: theme.surface,
            color: theme.ink,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 999,
            fontFamily: theme.fontDisplay,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: -0.2,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <GoogleMark />
          {busy ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <div
            style={{
              marginTop: 14,
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
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.94v2.32A8.99 8.99 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71a5.41 5.41 0 0 1 0-3.42V4.97H.94a9 9 0 0 0 0 8.06l3.03-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 .94 4.97L3.97 7.3C4.68 5.18 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
