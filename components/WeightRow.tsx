import { shortDayLabel } from "@/lib/date";

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
    <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-3xl px-4 py-3">
      <span className="font-display text-base font-semibold whitespace-nowrap">
        {shortDayLabel(date)}
      </span>
      {hasAnyData ? (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {morningKg !== null && (
            <span className="rounded-full bg-glass-strong px-2.5 py-1 text-xs font-medium tabular-nums text-muted">
              AM {morningKg} kg
            </span>
          )}
          {eveningKg !== null && (
            <span className="rounded-full bg-glass-strong px-2.5 py-1 text-xs font-medium tabular-nums text-muted">
              PM {eveningKg} kg
            </span>
          )}
          {hasEnergyData ? (
            <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
              {deficit} deficit
            </span>
          ) : (
            <span className="rounded-full bg-peach/15 px-2 py-0.5 text-[11px] font-semibold text-peach-ink">
              no sync
            </span>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted">No data</span>
      )}
    </div>
  );
}
