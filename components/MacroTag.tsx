const STYLES = {
  carbs: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  protein:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  fat: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
} as const;

const ABBR = { carbs: "C", protein: "P", fat: "F" } as const;

export function MacroTag({
  kind,
  value,
}: {
  kind: keyof typeof STYLES;
  value: number;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums whitespace-nowrap ${STYLES[kind]}`}
    >
      {ABBR[kind]} {value}
    </span>
  );
}
