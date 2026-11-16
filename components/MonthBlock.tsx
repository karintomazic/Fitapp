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
    <div className="glass flex flex-col gap-2 rounded-3xl px-4 py-3">
      <span className="font-display text-base font-semibold whitespace-nowrap">{label}</span>
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
