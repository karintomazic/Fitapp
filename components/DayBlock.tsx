import type { MealType } from "@/db/schema";
import { round1 } from "@/lib/nutrition";
import { MacroTag } from "./MacroTag";
import { PeriodSummary } from "./PeriodSummary";

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
  burned,
  hasEnergyData,
  entries,
  open,
}: {
  date: string;
  burned: number;
  hasEnergyData: boolean;
  entries: Entry[];
  open?: boolean;
}) {
  const rawTotals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      carbs: acc.carbs + e.carbs,
      protein: acc.protein + e.protein,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 },
  );
  const consumed = rawTotals.kcal;
  const carbs = round1(rawTotals.carbs);
  const protein = round1(rawTotals.protein);
  const fat = round1(rawTotals.fat);

  return (
    <details
      open={open}
      className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold whitespace-nowrap">{date}</span>
        <PeriodSummary
          burned={burned}
          consumed={consumed}
          deficit={burned - consumed}
          carbs={carbs}
          protein={protein}
          fat={fat}
          hasEnergyData={hasEnergyData}
          hasFoodData={entries.length > 0}
        />
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
