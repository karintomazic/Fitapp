export function WeightRow({
  date,
  morningKg,
  eveningKg,
  deficit,
  hasEnergyData,
}: {
  date: string;
  morningKg: number | null;
  eveningKg: number | null;
  deficit: number;
  hasEnergyData: boolean;
}) {
  const hasWeight = morningKg !== null || eveningKg !== null;
  const hasAnyData = hasWeight || hasEnergyData;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <span className="text-sm font-semibold whitespace-nowrap">{date}</span>
      {hasAnyData ? (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {morningKg !== null && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              ☀️ {morningKg} kg
            </span>
          )}
          {eveningKg !== null && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              🌙 {eveningKg} kg
            </span>
          )}
          {hasEnergyData ? (
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white dark:bg-stone-100 dark:text-stone-900">
              {deficit} deficit
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800">
              no sync
            </span>
          )}
        </div>
      ) : (
        <span className="text-xs text-stone-400">No data</span>
      )}
    </div>
  );
}
