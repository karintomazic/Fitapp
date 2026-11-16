const R = 16;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function MacroRing({
  label,
  grams,
  goal,
  color,
}: {
  label: string;
  grams: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min(grams / goal, 1);

  return (
    <div className="glass flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3 text-center">
      <span className="eyebrow">{label}</span>
      <span className="font-display text-lg font-semibold tabular-nums">
        {grams}g
      </span>
      <span className="text-[11px] text-muted">of {goal}g</span>
      <svg width="40" height="40" viewBox="0 0 40 40" className="mt-1" aria-hidden>
        <circle cx="20" cy="20" r={R} fill="none" stroke="var(--track)" strokeWidth="5" />
        {pct > 0 && (
          <circle
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * pct} ${CIRCUMFERENCE}`}
            transform="rotate(-90 20 20)"
          />
        )}
      </svg>
    </div>
  );
}
