import Link from "next/link";

export function Nav({ current }: { current: "today" | "history" }) {
  return (
    <nav className="flex gap-1 self-start rounded-full border border-stone-200 bg-white p-1 text-sm dark:border-stone-800 dark:bg-stone-900">
      <NavLink href="/" active={current === "today"}>
        Today
      </NavLink>
      <NavLink href="/history" active={current === "history"}>
        History
      </NavLink>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-stone-900 px-4 py-1.5 font-medium text-white dark:bg-stone-100 dark:text-stone-900"
          : "rounded-full px-4 py-1.5 text-stone-500 dark:text-stone-400"
      }
    >
      {children}
    </Link>
  );
}
