import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog } from "@/db/schema";
import { todayLjubljana } from "@/lib/date";
import { Nav } from "@/components/Nav";
import { addFoodEntry, deleteFoodEntry } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = todayLjubljana();

  const [energyRows, entries] = await Promise.all([
    db.select().from(dailyEnergy).where(eq(dailyEnergy.date, today)).limit(1),
    db
      .select()
      .from(foodLog)
      .where(eq(foodLog.date, today))
      .orderBy(desc(foodLog.loggedAt)),
  ]);

  const energy = energyRows[0];
  const activeKcal = energy?.activeKcal ?? 0;
  const basalKcal = energy?.basalKcal ?? 0;
  const burnedKcal = activeKcal + basalKcal;
  const consumedKcal = entries.reduce((sum, e) => sum + e.kcal, 0);
  const deficit = burnedKcal - consumedKcal;

  return (
    <div className="flex flex-1 flex-col max-w-md w-full mx-auto p-6 gap-8">
      <Nav current="today" />

      <div>
        <p className="text-sm text-zinc-500">{today}</p>
        {!energy && (
          <p className="mt-1 text-sm text-amber-600">
            No Health sync yet today — burned shows as 0.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Burned" value={burnedKcal} />
        <Stat label="Eaten" value={consumedKcal} />
        <Stat label="Deficit" value={deficit} emphasize />
      </div>

      <form action={addFoodEntry} className="flex gap-2">
        <input
          name="label"
          placeholder="lunch"
          required
          className="min-w-0 flex-1 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="kcal"
          type="number"
          inputMode="numeric"
          placeholder="kcal"
          required
          className="w-24 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {entries.length === 0 && (
          <li className="text-sm text-zinc-500">Nothing logged yet today.</li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
            <span className="text-zinc-500">{entry.kcal} kcal</span>
            <form action={deleteFoodEntry}>
              <input type="hidden" name="id" value={entry.id} />
              <button
                type="submit"
                aria-label={`Delete ${entry.label}`}
                className="text-zinc-400 hover:text-red-600"
              >
                ✕
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 py-4 dark:border-zinc-800">
      <p
        className={
          emphasize
            ? "text-3xl font-bold tabular-nums"
            : "text-2xl font-semibold tabular-nums"
        }
      >
        {value}
      </p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
