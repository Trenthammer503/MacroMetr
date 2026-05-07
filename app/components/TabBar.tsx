"use client";

import { useTheme } from "../lib/theme-context";

export type Tab = "home" | "settings";

export function TabBar({
  tab,
  setTab,
  onAdd,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onAdd: () => void;
}) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        paddingTop: 8,
        background: `linear-gradient(to top, ${theme.bg} 60%, ${theme.bg}00)`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <TabButton
        active={tab === "home"}
        onClick={() => setTab("home")}
        label="Today"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M3 8l8-5 8 5v10a1 1 0 01-1 1h-4v-6h-6v6H4a1 1 0 01-1-1V8z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
      <button
        onClick={onAdd}
        aria-label="Add food"
        style={{
          appearance: "none",
          border: "none",
          width: 56,
          height: 56,
          borderRadius: 999,
          background: theme.accent,
          color: theme.accentInk,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: `0 8px 24px ${theme.accent}66`,
          transform: "translateY(-12px)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <TabButton
        active={tab === "settings"}
        onClick={() => setTab("settings")}
        label="You"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M4 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        }
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none",
        border: "none",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        color: active ? theme.ink : theme.inkMute,
        cursor: "pointer",
        padding: "6px 12px",
        fontFamily: theme.fontDisplay,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.4,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
