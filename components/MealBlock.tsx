import { deleteFoodEntry, logFood } from "@/app/actions";
import type { MealType } from "@/db/schema";
import { round1 } from "@/lib/nutrition";
import { MacroTag } from "./MacroTag";

type Food = { id: number; name: string };
type Entry = {
  id: number;
  label: string;
  grams: number;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export function MealBlock({
  meal,
  title,
  entries,
  foods,
}: {
  meal: MealType;
  title: string;
  entries: Entry[];
  foods: Food[];
}) {
  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      carbs: acc.carbs + e.carbs,
      protein: acc.protein + e.protein,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 },
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {totals.kcal} kcal
        </span>
      </header>

      {entries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <MacroTag kind="carbs" value={round1(totals.carbs)} />
          <MacroTag kind="protein" value={round1(totals.protein)} />
          <MacroTag kind="fat" value={round1(totals.fat)} />
        </div>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {entries.length === 0 && (
          <li className="px-1 text-xs text-stone-400">Nothing yet.</li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
              {entry.label.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.label}</p>
              <p className="text-xs text-stone-400">{entry.grams}g</p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-stone-600 dark:text-stone-300">
              {entry.kcal}
            </span>
            <form action={deleteFoodEntry}>
              <input type="hidden" name="id" value={entry.id} />
              <button
                type="submit"
                aria-label={`Delete ${entry.label}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-red-600 dark:hover:bg-stone-700"
              >
                ✕
              </button>
            </form>
          </li>
        ))}
      </ul>

      <details className="mt-3">
        <summary className="cursor-pointer list-none rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-center text-xs font-medium text-stone-500 [&::-webkit-details-marker]:hidden dark:border-stone-700 dark:text-stone-400">
          + Add food
        </summary>
        <div className="mt-2 flex flex-col gap-1.5">
          {foods.length === 0 && (
            <p className="px-1 text-xs text-stone-400">
              No foods yet — add one below.
            </p>
          )}
          {foods.map((food) => (
            <details
              key={food.id}
              className="rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800/60"
            >
              <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
                {food.name}
              </summary>
              <form action={logFood} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="foodId" value={food.id} />
                <input type="hidden" name="meal" value={meal} />
                <input
                  name="grams"
                  type="number"
                  inputMode="numeric"
                  placeholder="g"
                  required
                  className="w-16 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
                />
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900"
                >
                  Add
                </button>
              </form>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}
