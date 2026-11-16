"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Page = "today" | "calendar" | "history" | "weight" | "settings";

const ITEMS: { page: Page; href: string; label: string; icon: React.ReactNode }[] = [
  {
    page: "today",
    href: "/",
    label: "Today",
    icon: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    page: "calendar",
    href: "/calendar",
    label: "Calendar",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    page: "history",
    href: "/history",
    label: "History",
    icon: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  },
  {
    page: "weight",
    href: "/weight",
    label: "Weight",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M7.5 10a5.5 5.5 0 0 1 9 0" />
        <path d="M12 11.5l1.8-2.6" />
      </>
    ),
  },
  {
    page: "settings",
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
  },
];

function hrefForPath(pathname: string) {
  const item = ITEMS.find((i) =>
    i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
  );
  return item?.href;
}

// Lives in the root layout so it stays on screen between pages and the
// mint pill can slide from tab to tab instead of being redrawn.
export function Nav() {
  const pathname = usePathname();
  // the tab you just tapped, so the pill moves before the new page has loaded
  const [tapped, setTapped] = useState<{ href: string; from: string } | null>(
    null,
  );

  const activeHref =
    tapped && tapped.from === pathname ? tapped.href : hrefForPath(pathname);
  const activeIndex = ITEMS.findIndex((i) => i.href === activeHref);

  const tabWidth = 100 / ITEMS.length;

  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-10 px-4">
      <div className="glass-bar mx-auto flex max-w-md items-center rounded-full p-1.5">
        <div
          className="relative grid flex-1"
          style={{ gridTemplateColumns: `repeat(${ITEMS.length}, 1fr)` }}
        >
          {activeIndex !== -1 && (
            <span
              aria-hidden
              className="absolute inset-y-0 rounded-full bg-mint transition-[left] duration-300 ease-out motion-reduce:transition-none"
              style={{
                left: `${activeIndex * tabWidth}%`,
                width: `${tabWidth}%`,
              }}
            />
          )}
          {ITEMS.map(({ page, href, label, icon }, i) => {
            const isActive = i === activeIndex;
            return (
              <Link
                key={page}
                href={href}
                onClick={() => setTapped({ href, from: pathname })}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-11 items-center justify-center rounded-full transition-colors duration-300 ${
                  isActive ? "text-white" : "text-muted"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icon}
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
