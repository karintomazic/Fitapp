import { MacroTag } from "./MacroTag";

export function PeriodSummary({
  burned,
  consumed,
  deficit,
  carbs,
  protein,
  fat,
  hasEnergyData,
  hasFoodData,
}: {
  burned: number;
  consumed: number;
  deficit: number;
  carbs: number;
  protein: number;
  fat: number;
  hasEnergyData: boolean;
  hasFoodData: boolean;
}) {
  if (!hasEnergyData && !hasFoodData) {
    return <span className="text-xs text-stone-400">No data</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!hasEnergyData && (
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800">
          no sync
        </span>
      )}
      <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white dark:bg-stone-100 dark:text-stone-900">
        {deficit} deficit
      </span>
      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        🔥 {burned}
      </span>
      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        🍽️ {consumed}
      </span>
      {hasFoodData && (
        <>
          <MacroTag kind="carbs" value={carbs} />
          <MacroTag kind="protein" value={protein} />
          <MacroTag kind="fat" value={fat} />
        </>
      )}
    </div>
  );
}
