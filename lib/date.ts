const TIME_ZONE = "Europe/Ljubljana";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
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
