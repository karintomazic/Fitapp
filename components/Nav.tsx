import Link from "next/link";

export function Nav({ current }: { current: "today" | "history" }) {
  return (
    <nav className="flex gap-4 text-sm">
      <Link
        href="/"
        className={current === "today" ? "font-semibold" : "text-zinc-500"}
      >
        Today
      </Link>
      <Link
        href="/history"
        className={current === "history" ? "font-semibold" : "text-zinc-500"}
      >
        History
      </Link>
    </nav>
  );
}
