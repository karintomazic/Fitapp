import { PeriodSummary } from "./PeriodSummary";

export function MonthBlock({
  label,
  burned,
  consumed,
  deficit,
  carbs,
  protein,
  fat,
  hasFoodData,
}: {
  label: string;
  burned: number;
  consumed: number;
  deficit: number;
  carbs: number;
  protein: number;
  fat: number;
  hasFoodData: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
      <PeriodSummary
        burned={burned}
        consumed={consumed}
        deficit={deficit}
        carbs={carbs}
        protein={protein}
        fat={fat}
        hasEnergyData
        hasFoodData={hasFoodData}
      />
    </div>
  );
}
