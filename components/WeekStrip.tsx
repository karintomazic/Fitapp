import Link from "next/link";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// The current week, Monday first. Today is highlighted; a dot marks days
// with food logged. Tapping a past day opens it in the calendar.
export function WeekStrip({
  week,
  today,
  loggedDates,
}: {
  week: string[];
  today: string;
  loggedDates: Set<string>;
}) {
  return (
    <ol className="grid grid-cols-7 gap-1.5 text-center">
      {week.map((date, i) => {
        const isToday = date === today;
        const isFuture = date > today;
        return (
          <li key={date} className={isFuture ? "opacity-45" : undefined}>
            <span className="text-[10px] font-semibold tracking-wide text-muted">
              {DAY_NAMES[i]}
            </span>
            <DayBox
              href={isFuture ? undefined : `/calendar?month=${date.slice(0, 7)}&day=${date}`}
              isToday={isToday}
            >
              {Number(date.slice(8, 10))}
              {loggedDates.has(date) && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    isToday ? "bg-white" : "bg-mint"
                  }`}
                />
              )}
            </DayBox>
          </li>
        );
      })}
    </ol>
  );
}

function DayBox({
  href,
  isToday,
  children,
}: {
  href?: string;
  isToday: boolean;
  children: React.ReactNode;
}) {
  const className = `relative mt-1 flex h-10 items-center justify-center rounded-xl text-sm font-semibold tabular-nums ${
    isToday ? "bg-mint text-white" : "glass"
  }`;
  return href ? (
    <Link href={href} aria-current={isToday ? "date" : undefined} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}
