import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Page = "today" | "calendar" | "history" | "weight";

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
];

// Glass tab bar fixed to the bottom of the screen, clear of the iPhone home bar.
export function Nav({ current }: { current: Page }) {
  return (
    <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-10 px-4">
      <div className="glass-bar mx-auto flex max-w-md items-center justify-around rounded-full p-1.5">
        {ITEMS.map(({ page, href, label, icon }) => {
          const active = page === current;
          return (
            <Link
              key={page}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex h-11 items-center gap-2 rounded-full bg-mint px-4 text-sm font-semibold text-white"
                  : "flex h-11 w-12 items-center justify-center rounded-full text-muted"
              }
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
              {active && label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
