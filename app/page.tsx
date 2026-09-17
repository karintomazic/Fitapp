import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog, foods, type MealType } from "@/db/schema";
import { todayLjubljana } from "@/lib/date";
import { Nav } from "@/components/Nav";
import { MealBlock } from "@/components/MealBlock";
import { addFood, deleteFood } from "./actions";

export const dynamic = "force-dynamic";

const MEALS: { meal: MealType; title: string }[] = [
  { meal: "breakfast", title: "Breakfast" },
  { meal: "lunch", title: "Lunch" },
  { meal: "dinner", title: "Dinner" },
];

export default async function Home() {
  const today = todayLjubljana();

  const [energyRows, entries, foodList] = await Promise.all([
    db.select().from(dailyEnergy).where(eq(dailyEnergy.date, today)).limit(1),
    db
      .select()
      .from(foodLog)
      .where(eq(foodLog.date, today))
      .orderBy(asc(foodLog.loggedAt)),
    db.select().from(foods).orderBy(asc(foods.name)),
  ]);

  const energy = energyRows[0];
  const activeKcal = energy?.activeKcal ?? 0;
  const basalKcal = energy?.basalKcal ?? 0;
  const burnedKcal = activeKcal + basalKcal;
  const consumedKcal = entries.reduce((sum, e) => sum + e.kcal, 0);
  const deficit = burnedKcal - consumedKcal;

  const entriesByMeal = Object.fromEntries(
    MEALS.map(({ meal }) => [meal, entries.filter((e) => e.meal === meal)]),
  ) as Record<MealType, typeof entries>;

  return (
    <div className="flex flex-1 flex-col max-w-md w-full mx-auto p-6 gap-6">
      <Nav current="today" />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{today}</p>
        {!energy && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            No sync yet today
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat icon="🔥" label="Burned" value={burnedKcal} />
        <Stat icon="🍽️" label="Eaten" value={consumedKcal} />
        <Stat icon="⚖️" label="Deficit" value={deficit} emphasize />
      </div>

      <div className="flex flex-col gap-4">
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

      <details className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
          Food library
        </summary>

        <ul className="mt-3 flex flex-col gap-2">
          {foodList.length === 0 && (
            <li className="px-1 text-xs text-stone-400">No foods yet.</li>
          )}
          {foodList.map((food) => (
            <li
              key={food.id}
              className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                {food.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {food.name}
              </span>
              <span className="text-xs tabular-nums text-stone-400">
                {food.kcalPer100g} kcal/100g
              </span>
              <form action={deleteFood}>
                <input type="hidden" name="id" value={food.id} />
                <button
                  type="submit"
                  aria-label={`Remove ${food.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-red-600 dark:hover:bg-stone-700"
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
            required
            className="col-span-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
          />
          <MacroInput name="kcalPer100g" label="kcal/100g" />
          <MacroInput name="carbsPer100g" label="carbs/100g" />
          <MacroInput name="proteinPer100g" label="protein/100g" />
          <MacroInput name="fatPer100g" label="fat/100g" />
          <button
            type="submit"
            className="col-span-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900"
          >
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
      type="number"
      step="0.1"
      placeholder={label}
      required
      className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
    />
  );
}

function Stat({
  icon,
  label,
  value,
  emphasize,
}: {
  icon: string;
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-stone-200 bg-white py-4 dark:border-stone-800 dark:bg-stone-900">
      <span className="text-base">{icon}</span>
      <p
        className={
          emphasize
            ? "text-3xl font-bold tabular-nums"
            : "text-2xl font-semibold tabular-nums"
        }
      >
        {value}
      </p>
      <p className="text-[11px] font-medium tracking-wide text-stone-400 uppercase">
        {label}
      </p>
    </div>
  );
}
