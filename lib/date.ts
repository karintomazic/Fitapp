const TIME_ZONE = "Europe/Ljubljana";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

// YYYY-MM-DD in the local Slovenian date, regardless of server timezone.
export function todayLjubljana(): string {
  return dateFormatter.format(new Date());
}

// Last n calendar dates (Ljubljana-local) ending today, oldest first.
export function lastNDatesLjubljana(n: number): string[] {
  const now = Date.now();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(dateFormatter.format(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  return dates;
}

// YYYY-MM-01 for the current Ljubljana-local month.
export function currentMonthStartLjubljana(): string {
  return `${todayLjubljana().slice(0, 7)}-01`;
}

// Every calendar date (Ljubljana-local) from the start of this month
// through today, oldest first.
export function datesInCurrentMonthLjubljana(): string[] {
  const dayOfMonth = Number(todayLjubljana().slice(8, 10));
  return lastNDatesLjubljana(dayOfMonth);
}

// "September 2026" for a "YYYY-MM" key.
export function monthLabel(monthKey: string): string {
  return monthFormatter.format(new Date(`${monthKey}-15T12:00:00Z`));
}

// "Thursday, September 17" for today, Ljubljana-local.
export function todayLabelLjubljana(): string {
  return dayLabelFormatter.format(new Date());
}

const shortDayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

// Monday to Sunday dates (YYYY-MM-DD) of the week that contains today,
// Ljubljana-local.
export function currentWeekLjubljana(): string[] {
  const today = new Date(`${todayLjubljana()}T12:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) =>
    new Date(today.getTime() + (i - mondayOffset) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  );
}

// "Mon 16 Nov" for a "YYYY-MM-DD" date.
export function shortDayLabel(date: string): string {
  return shortDayFormatter.format(new Date(`${date}T12:00:00Z`)).replace(",", "");
}

const longDayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "Saturday 14 November" for a "YYYY-MM-DD" date.
export function longDayLabel(date: string): string {
  return longDayFormatter.format(new Date(`${date}T12:00:00Z`)).replace(",", "");
}

// Every date (YYYY-MM-DD) in a "YYYY-MM" month, first to last.
export function datesInMonth(monthKey: string): string[] {
  const [year, month] = monthKey.split("-").map(Number);
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from(
    { length: days },
    (_, i) => `${monthKey}-${String(i + 1).padStart(2, "0")}`,
  );
}

// How many empty cells come before day 1 in a Monday-first calendar grid.
export function mondayOffset(date: string): number {
  return (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
}

// The "YYYY-MM" month before or after the given one.
export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + delta, 15)).toISOString().slice(0, 7);
}
