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
