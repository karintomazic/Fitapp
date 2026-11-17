import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog, foods, type MealType } from "@/db/schema";
import {
  currentWeekLocal,
  todayLabelLocal,
  todayLocal,
} from "@/lib/date";
import { getProfile } from "@/lib/goals";
import { round1 } from "@/lib/nutrition";
import { MealBlock } from "@/components/MealBlock";
import { MacroRing } from "@/components/MacroRing";
import { WeekStrip } from "@/components/WeekStrip";
import { addFood, deleteFood } from "./actions";
import { DECIMAL_PATTERN } from "@/lib/parseDecimal";

export const dynamic = "force-dynamic";

const MEALS: { meal: MealType; title: string }[] = [
  { meal: "breakfast", title: "Breakfast" },
  { meal: "lunch", title: "Lunch" },
  { meal: "dinner", title: "Dinner" },
];

export default async function Home() {
  const today = todayLocal();
  const todayLabel = todayLabelLocal();
  const week = currentWeekLocal();

  const [energyRows, entries, foodList, weekLogRows, profile] = await Promise.all([
    db.select().from(dailyEnergy).where(eq(dailyEnergy.date, today)).limit(1),
    db
      .select()
      .from(foodLog)
      .where(eq(foodLog.date, today))
      .orderBy(asc(foodLog.loggedAt)),
    db.select().from(foods).orderBy(asc(foods.name)),
    db
      .selectDistinct({ date: foodLog.date })
      .from(foodLog)
      .where(and(gte(foodLog.date, week[0]), lte(foodLog.date, week[6]))),
    getProfile(),
  ]);

  const energy = energyRows[0];
  const activeKcal = energy?.activeKcal ?? 0;
  const basalKcal = energy?.basalKcal ?? 0;
  const burnedKcal = activeKcal + basalKcal;
  const consumedKcal = entries.reduce((sum, e) => sum + e.kcal, 0);
  const deficit = burnedKcal - consumedKcal;

  const carbs = round1(entries.reduce((sum, e) => sum + e.carbs, 0));
  const protein = round1(entries.reduce((sum, e) => sum + e.protein, 0));
  const fat = round1(entries.reduce((sum, e) => sum + e.fat, 0));

  const kcalGoal = profile.kcalGoal;
  const goalPct = Math.min(consumedKcal / kcalGoal, 1) * 100;
  const kcalLeft = kcalGoal - consumedKcal;

  const entriesByMeal = Object.fromEntries(
    MEALS.map(({ meal }) => [meal, entries.filter((e) => e.meal === meal)]),
  ) as Record<MealType, typeof entries>;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl leading-tight font-semibold">
            {profile.name ? `Hi ${profile.name},` : "Hi,"}
            <br />
            {todayLabel}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {kcalLeft >= 0
              ? `${kcalLeft.toLocaleString("en")} kcal left for today`
              : `${(-kcalLeft).toLocaleString("en")} kcal over your goal`}
          </p>
        </div>
        {!energy && (
          <span className="shrink-0 rounded-full bg-peach/15 px-3 py-1 text-xs font-semibold text-peach-ink">
            No sync yet
          </span>
        )}
      </header>

      <WeekStrip
        week={week}
        today={today}
        loggedDates={new Set(weekLogRows.map((r) => r.date))}
      />

      <section className="glass rounded-3xl p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="eyebrow">Calories</span>
            <p className="mt-0.5">
              <span className="font-display text-3xl font-semibold tabular-nums">
                {consumedKcal.toLocaleString("en")}
              </span>
              <span className="text-sm text-muted">
                / {kcalGoal.toLocaleString("en")} kcal goal
              </span>
            </p>
          </div>
          <span className="eyebrow">{Math.round((consumedKcal / kcalGoal) * 100)}%</span>
        </div>

        <div
          className="relative mt-3 h-2 rounded-full bg-track"
          role="progressbar"
          aria-label="Calories eaten toward today's goal"
          aria-valuemin={0}
          aria-valuemax={kcalGoal}
          aria-valuenow={consumedKcal}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-peach/70 to-peach"
            style={{ width: `${goalPct}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-peach bg-white"
            style={{ left: `${goalPct}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Burned" value={burnedKcal} />
          <Stat label="Eaten" value={consumedKcal} />
          <Stat
            label={deficit >= 0 ? "Deficit" : "Surplus"}
            value={Math.abs(deficit)}
            tone={deficit >= 0 ? "text-mint-ink" : "text-peach-ink"}
          />
        </dl>
      </section>

      <div className="grid grid-cols-3 gap-2.5">
        <MacroRing label="Carbs" grams={carbs} goal={profile.carbsGoal} color="var(--amber)" />
        <MacroRing label="Protein" grams={protein} goal={profile.proteinGoal} color="var(--mint)" />
        <MacroRing label="Fat" grams={fat} goal={profile.fatGoal} color="var(--peach)" />
      </div>

      <h2 className="-mb-2 font-display text-lg font-semibold">Today&apos;s meals</h2>
      <div className="flex flex-col gap-3">
        {MEALS.map(({ meal, title }) => (
          <MealBlock
            key={meal}
            meal={meal}
            title={title}
            entries={entriesByMeal[meal]}
            foods={foodList}
          />
        ))}
      </div>

      <details className="glass rounded-3xl p-4">
        <summary className="cursor-pointer list-none font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
          Food library
        </summary>

        <ul className="mt-3 flex flex-col gap-2">
          {foodList.length === 0 && (
            <li className="px-1 text-xs text-muted">No foods yet.</li>
          )}
          {foodList.map((food) => (
            <li
              key={food.id}
              className="flex items-center gap-3 rounded-2xl bg-glass-strong px-3 py-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-sm font-semibold text-mint-ink">
                {food.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {food.name}
              </span>
              <span className="text-xs tabular-nums text-muted">
                {food.kcalPer100g} kcal/100g
              </span>
              <form action={deleteFood}>
                <input type="hidden" name="id" value={food.id} />
                <button
                  type="submit"
                  aria-label={`Remove ${food.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-peach/15 hover:text-peach-ink"
                >
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={addFood} className="mt-3 grid grid-cols-2 gap-2">
          <input
            name="name"
            placeholder="name (e.g. pistachios)"
            aria-label="Food name"
            required
            className="field col-span-2"
          />
          <MacroInput name="kcalPer100g" label="kcal/100g" />
          <MacroInput name="carbsPer100g" label="carbs/100g" />
          <MacroInput name="proteinPer100g" label="protein/100g" />
          <MacroInput name="fatPer100g" label="fat/100g" />
          <button type="submit" className="btn-primary col-span-2">
            Save food
          </button>
        </form>
      </details>
    </div>
  );
}

function MacroInput({ name, label }: { name: string; label: string }) {
  return (
    <input
      name={name}
      type="text"
      inputMode="decimal"
      pattern={DECIMAL_PATTERN}
      placeholder={label}
      aria-label={label}
      required
      className="field min-w-0"
    />
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={`font-display text-lg font-semibold tabular-nums ${tone ?? ""}`}>
        {value.toLocaleString("en")}
      </dd>
    </div>
  );
}
