"use client";

import { useSyncExternalStore } from "react";
import { THEME_COLORS } from "@/lib/theme";

// re-render when data-theme on <html> changes
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getIsDark() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getIsDark, () => false);

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;

    if (next === "dark") {
      root.dataset.theme = "dark";
    } else {
      delete root.dataset.theme;
    }

    try {
      localStorage.setItem("theme", next);
    } catch {
      // private browsing can block storage, the switch still works for this visit
    }

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[next]);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      className="flex w-full items-center justify-between gap-3 py-1 text-left"
    >
      <span>
        <span className="block text-sm font-medium">Dark mode</span>
        <span className="block text-xs text-muted">Saved on this device</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          isDark ? "bg-mint" : "bg-track"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none ${
            isDark ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}
