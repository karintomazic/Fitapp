import type { MealType } from "@/db/schema";
import { MacroTag } from "./MacroTag";

type Entry = {
  id: number;
  meal: MealType;
  label: string;
  grams: number;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

const MEAL_TITLES: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function DayBlock({
  date,
  entries,
  open,
}: {
  date: string;
  entries: Entry[];
  open?: boolean;
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
    <details
      open={open}
      className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold whitespace-nowrap">{date}</span>
        {entries.length > 0 ? (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {totals.kcal} kcal
            </span>
            <MacroTag kind="carbs" value={totals.carbs} />
            <MacroTag kind="protein" value={totals.protein} />
            <MacroTag kind="fat" value={totals.fat} />
          </div>
        ) : (
          <span className="text-xs text-stone-400">No entries</span>
        )}
      </summary>

      {entries.length > 0 && (
        <div className="overflow-x-auto border-t border-stone-100 px-4 py-3 dark:border-stone-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-stone-400 uppercase">
                <th className="py-1.5 pr-2 font-medium">Meal</th>
                <th className="py-1.5 pr-2 font-medium">Food</th>
                <th className="py-1.5 pr-2 text-right font-medium">g</th>
                <th className="py-1.5 pr-2 text-right font-medium">Kcal</th>
                <th className="py-1.5 text-right font-medium">Macros</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-stone-100 dark:border-stone-800"
                >
                  <td className="py-2 pr-2 whitespace-nowrap text-xs text-stone-400">
                    {MEAL_TITLES[e.meal]}
                  </td>
                  <td className="py-2 pr-2 truncate font-medium">{e.label}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-stone-500">
                    {e.grams}
                  </td>
                  <td className="py-2 pr-2 text-right font-semibold tabular-nums">
                    {e.kcal}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap justify-end gap-1">
                      <MacroTag kind="carbs" value={e.carbs} />
                      <MacroTag kind="protein" value={e.protein} />
                      <MacroTag kind="fat" value={e.fat} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
