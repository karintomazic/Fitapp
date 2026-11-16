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
    <section className="glass rounded-3xl p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <span className="rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold tabular-nums text-mint-ink">
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
          <li className="px-1 text-xs text-muted">Nothing yet.</li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-2xl bg-glass-strong px-3 py-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-peach/20 text-sm font-semibold text-peach-ink">
              {entry.label.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.label}</p>
              <p className="text-xs text-muted">{entry.grams}g</p>
            </div>
            <span className="text-sm font-semibold tabular-nums">{entry.kcal}</span>
            <form action={deleteFoodEntry}>
              <input type="hidden" name="id" value={entry.id} />
              <button
                type="submit"
                aria-label={`Delete ${entry.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-peach/15 hover:text-peach-ink"
              >
                ✕
              </button>
            </form>
          </li>
        ))}
      </ul>

      <details className="mt-3">
        <summary className="cursor-pointer list-none rounded-full border border-dashed border-mint/50 px-3 py-2 text-center text-sm font-semibold text-mint-ink [&::-webkit-details-marker]:hidden">
          + Add food
        </summary>
        <div className="mt-2 flex flex-col gap-1.5">
          {foods.length === 0 && (
            <p className="px-1 text-xs text-muted">
              No foods yet. Add one in the food library below.
            </p>
          )}
          {foods.map((food) => (
            <details key={food.id} className="rounded-2xl bg-glass-strong px-3 py-2.5">
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
                  placeholder="grams"
                  aria-label={`Grams of ${food.name}`}
                  required
                  className="field w-28"
                />
                <button type="submit" className="btn-primary">
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
