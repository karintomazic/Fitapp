const STYLES = {
  carbs: "bg-amber/20 text-amber-ink",
  protein: "bg-mint/15 text-mint-ink",
  fat: "bg-peach/15 text-peach-ink",
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
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap ${STYLES[kind]}`}
    >
      {ABBR[kind]} {value}
    </span>
  );
}
