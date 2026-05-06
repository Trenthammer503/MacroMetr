"use client";

import { theme } from "../lib/theme";
import { Food } from "../lib/foods";

export function FoodRow({
  food,
  onAdd,
  onTap,
  showAdd = true,
}: {
  food: Food;
  onAdd?: (food: Food) => void;
  onTap?: () => void;
  showAdd?: boolean;
}) {
  const initials = (food.name || "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onTap}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 4px",
        cursor: onTap ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: theme.surfaceAlt,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: theme.fontMono,
          fontSize: 14,
          fontWeight: 700,
          color: theme.inkSoft,
          letterSpacing: -0.4,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: theme.fontDisplay,
            fontSize: 15,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {food.name}
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 12,
            fontWeight: 400,
            color: theme.inkMute,
            marginTop: 2,
          }}
        >
          {food.unit} · {food.kcal} kcal · P{food.p} C{food.c} F{food.f}
        </div>
      </div>
      {showAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(food);
          }}
          style={{
            appearance: "none",
            border: "none",
            width: 36,
            height: 36,
            background: theme.accent,
            color: theme.accentInk,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
