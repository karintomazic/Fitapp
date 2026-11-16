import Link from "next/link";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog, weightLog, type MealType } from "@/db/schema";
import {
  datesInMonth,
  longDayLabel,
  monthLabel,
  mondayOffset,
  shiftMonth,
  todayLjubljana,
} from "@/lib/date";
import { GOALS } from "@/lib/goals";
import { round1 } from "@/lib/nutrition";
import { Nav } from "@/components/Nav";
import { MacroTag } from "@/components/MacroTag";

export const dynamic = "force-dynamic"; // build page fresh and never cache it

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MEAL_TITLES: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

type DaySummary = {
  date: string;
  burned: number;
  eaten: number;
  carbs: number;
  protein: number;
  fat: number;
  hasEnergy: boolean;
  hasFood: boolean;
  morningKg: number | null;
  eveningKg: number | null;
};

function calendarHref(month: string, day: string) {
  return `/calendar?month=${month}&day=${day}`;
}

export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const today = todayLjubljana();
  const currentMonth = today.slice(0, 7);

  // ?month=YYYY-MM picks the month (never past the current one);
  // ?day=YYYY-MM-DD picks the day shown under the grid.
  const monthParam = typeof params.month === "string" ? params.month : "";
  
  // if ti has teh right shape and is not in the future
  const month =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) && monthParam <= currentMonth
      ? monthParam
      : currentMonth;
  const dates = datesInMonth(month);
  const dayParam = typeof params.day === "string" ? params.day : "";
  const selected =
    dates.includes(dayParam) && dayParam <= today
      ? dayParam
      : month === currentMonth
        ? today
        : dates[dates.length - 1];

  const first = dates[0];
  const last = dates[dates.length - 1];

  const [energyRows, foodRows, weightRows, selectedEntries] = await Promise.all([
    db
      .select()
      .from(dailyEnergy)
      .where(and(gte(dailyEnergy.date, first), lte(dailyEnergy.date, last))),
    db
      .select({
        date: foodLog.date,
        kcal: sql<number>`sum(${foodLog.kcal})`.mapWith(Number),
        carbs: sql<number>`sum(${foodLog.carbs})`.mapWith(Number),
        protein: sql<number>`sum(${foodLog.protein})`.mapWith(Number),
        fat: sql<number>`sum(${foodLog.fat})`.mapWith(Number),
      })
      .from(foodLog)
      .where(and(gte(foodLog.date, first), lte(foodLog.date, last)))
      .groupBy(foodLog.date),
    db
      .select()
      .from(weightLog)
      .where(and(gte(weightLog.date, first), lte(weightLog.date, last))),
    db
      .select()
      .from(foodLog)
      .where(eq(foodLog.date, selected))
      .orderBy(asc(foodLog.loggedAt)),
  ]);

  const energyByDate = new Map(energyRows.map((r) => [r.date, r]));
  const foodByDate = new Map(foodRows.map((r) => [r.date, r]));
  const weightByDate = new Map(weightRows.map((r) => [r.date, r]));

  const days: DaySummary[] = dates.map((date) => {
    const energy = energyByDate.get(date);
    const food = foodByDate.get(date);
    const weight = weightByDate.get(date);
    return {
      date,
      burned: (energy?.activeKcal ?? 0) + (energy?.basalKcal ?? 0),
      eaten: food?.kcal ?? 0,
      carbs: round1(food?.carbs ?? 0),
      protein: round1(food?.protein ?? 0),
      fat: round1(food?.fat ?? 0),
      hasEnergy: Boolean(energy),
      hasFood: Boolean(food),
      morningKg: weight?.morningKg ?? null,
      eveningKg: weight?.eveningKg ?? null,
    };
  });
  const selectedDay = days.find((d) => d.date === selected)!;

  // Month summary only counts days with both a sync and food logged, since a
  // day missing either one would show a fake deficit.
  const completeDays = days.filter((d) => d.hasEnergy && d.hasFood);
  const totalDeficit = completeDays.reduce((s, d) => s + d.burned - d.eaten, 0);
  const loggedDays = days.filter((d) => d.hasFood);
  const avgEaten = loggedDays.length
    ? Math.round(loggedDays.reduce((s, d) => s + d.eaten, 0) / loggedDays.length)
    : 0;
  const daysOnGoal = loggedDays.filter((d) => d.eaten <= GOALS.kcal).length;

  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const canGoNext = nextMonth <= currentMonth;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">{monthLabel(month)}</h1>
        <div className="flex gap-1.5">
          <MonthArrow href={calendarHref(prevMonth, shiftMonthLastDay(prevMonth))} label="Previous month" dir="prev" />
          {canGoNext ? (
            <MonthArrow href={calendarHref(nextMonth, nextMonth === currentMonth ? today : shiftMonthLastDay(nextMonth))} label="Next month" dir="next" />
          ) : (
            <span className="glass flex h-10 w-10 items-center justify-center rounded-full opacity-35" aria-hidden>
              <Chevron dir="next" />
            </span>
          )}
        </div>
      </header>

      <section className="glass rounded-3xl p-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="pb-1 text-[10px] font-semibold tracking-wide text-muted">
              {d}
            </span>
          ))}
          {Array.from({ length: mondayOffset(first) }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {days.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              href={calendarHref(month, day.date)}
              isToday={day.date === today}
              isSelected={day.date === selected}
              isFuture={day.date > today}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted">
          <Legend className="bg-mint" label="Deficit" />
          <Legend className="bg-peach" label="Over goal" />
          <Legend className="bg-amber" label="Weighed in" />
        </div>
      </section>

      <section className="glass rounded-3xl p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold">{longDayLabel(selected)}</h2>
          {selected === today && (
            <Link href="/" className="text-xs font-semibold text-mint-ink">
              Open Today
            </Link>
          )}
        </div>

        {!selectedDay.hasEnergy && !selectedDay.hasFood && selectedDay.morningKg === null && selectedDay.eveningKg === null ? (
          <p className="mt-2 text-sm text-muted">Nothing logged on this day.</p>
        ) : (
          <>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <Stat label="Eaten" value={selectedDay.hasFood ? selectedDay.eaten.toLocaleString("en") : "–"} />
              <Stat label="Burned" value={selectedDay.hasEnergy ? selectedDay.burned.toLocaleString("en") : "–"} />
              <DeficitStat day={selectedDay} />
            </dl>

            {selectedDay.hasFood && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <MacroTag kind="carbs" value={selectedDay.carbs} />
                <MacroTag kind="protein" value={selectedDay.protein} />
                <MacroTag kind="fat" value={selectedDay.fat} />
              </div>
            )}

            {(selectedDay.morningKg !== null || selectedDay.eveningKg !== null) && (
              <p className="mt-3 text-sm">
                <span className="eyebrow mr-2">Weight</span>
                {selectedDay.morningKg !== null && <>AM {selectedDay.morningKg} kg</>}
                {selectedDay.morningKg !== null && selectedDay.eveningKg !== null && " · "}
                {selectedDay.eveningKg !== null && <>PM {selectedDay.eveningKg} kg</>}
              </p>
            )}

            {selectedEntries.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {selectedEntries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-glass-strong px-3 py-2 text-sm">
                    <span className="w-16 shrink-0 text-xs text-muted">{MEAL_TITLES[e.meal]}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{e.label}</span>
                    <span className="text-xs text-muted tabular-nums">{e.grams}g</span>
                    <span className="w-10 text-right font-semibold tabular-nums">{e.kcal}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="glass rounded-3xl p-4">
        <h2 className="font-display text-base font-semibold">This month</h2>
        {loggedDays.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No food logged this month yet.</p>
        ) : (
          <dl className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Days logged" value={String(loggedDays.length)} />
            <Stat label="Avg eaten" value={avgEaten.toLocaleString("en")} />
            <Stat
              label="Within goal"
              value={`${daysOnGoal}/${loggedDays.length}`}
            />
            {completeDays.length > 0 && (
              <div className="col-span-3 mt-1 rounded-2xl bg-glass-strong px-3 py-2.5">
                <dt className="eyebrow">Total {totalDeficit >= 0 ? "deficit" : "surplus"}</dt>
                <dd className={`font-display text-xl font-semibold tabular-nums ${totalDeficit >= 0 ? "text-mint-ink" : "text-peach-ink"}`}>
                  {Math.abs(totalDeficit).toLocaleString("en")} kcal
                  <span className="ml-2 text-xs font-normal text-muted">
                    over {completeDays.length} synced {completeDays.length === 1 ? "day" : "days"}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <Nav current="calendar" />
    </div>
  );
}

function shiftMonthLastDay(month: string) {
  const dates = datesInMonth(month);
  return dates[dates.length - 1];
}

function DayCell({
  day,
  href,
  isToday,
  isSelected,
  isFuture,
}: {
  day: DaySummary;
  href: string;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
}) {
  const deficit = day.hasEnergy && day.hasFood && day.burned > day.eaten;
  const overGoal = day.hasFood && day.eaten > GOALS.kcal;
  const weighed = day.morningKg !== null || day.eveningKg !== null;
  const label = Number(day.date.slice(8, 10));

  const dots = (
    <span className="flex h-1.5 gap-0.5" aria-hidden>
      {deficit && <i className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-mint"}`} />}
      {overGoal && <i className="h-1.5 w-1.5 rounded-full bg-peach" />}
      {weighed && <i className="h-1.5 w-1.5 rounded-full bg-amber" />}
    </span>
  );

  if (isFuture) {
    return (
      <span className="flex aspect-[1/1.1] flex-col items-center justify-center gap-1 rounded-xl text-sm font-semibold tabular-nums opacity-35">
        {label}
        <span className="h-1.5" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`${longDayLabel(day.date)}${deficit ? ", deficit" : ""}${overGoal ? ", over goal" : ""}${weighed ? ", weighed in" : ""}`}
      aria-current={isSelected ? "date" : undefined}
      className={`flex aspect-[1/1.1] flex-col items-center justify-center gap-1 rounded-xl text-sm font-semibold tabular-nums ${
        isSelected
          ? "bg-mint text-white"
          : day.hasFood || day.hasEnergy
            ? "bg-glass-strong"
            : ""
      } ${isToday && !isSelected ? "ring-2 ring-mint ring-inset" : ""}`}
    >
      {label}
      {dots}
    </Link>
  );
}

function DeficitStat({ day }: { day: DaySummary }) {
  if (!day.hasEnergy || !day.hasFood) {
    return <Stat label="Deficit" value="–" />;
  }
  const deficit = day.burned - day.eaten;
  return (
    <Stat
      label={deficit >= 0 ? "Deficit" : "Surplus"}
      value={Math.abs(deficit).toLocaleString("en")}
      tone={deficit >= 0 ? "text-mint-ink" : "text-peach-ink"}
    />
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={`font-display text-lg font-semibold tabular-nums ${tone ?? ""}`}>{value}</dd>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function MonthArrow({ href, label, dir }: { href: string; label: string; dir: "prev" | "next" }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className="glass flex h-10 w-10 items-center justify-center rounded-full"
    >
      <Chevron dir={dir} />
    </Link>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
