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
    return <span className="text-xs text-muted">No data</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!hasEnergyData && (
        <span className="rounded-full bg-peach/15 px-2 py-0.5 text-[11px] font-semibold text-peach-ink">
          no sync
        </span>
      )}
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums text-white ${
          deficit >= 0 ? "bg-mint" : "bg-peach"
        }`}
      >
        {deficit >= 0 ? `${deficit} deficit` : `${-deficit} surplus`}
      </span>
      <span className="rounded-full bg-glass-strong px-2.5 py-1 text-xs font-medium tabular-nums text-muted">
        {burned} burned
      </span>
      <span className="rounded-full bg-glass-strong px-2.5 py-1 text-xs font-medium tabular-nums text-muted">
        {consumed} eaten
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
