import { eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog, weightLog } from "@/db/schema";
import { currentMonthStartLjubljana, datesInCurrentMonthLjubljana, todayLjubljana } from "@/lib/date";
import { Nav } from "@/components/Nav";
import { WeightRow } from "@/components/WeightRow";
import { logWeight } from "../actions";

export const dynamic = "force-dynamic";

export default async function Weight() {
  const today = todayLjubljana();
  const monthStart = currentMonthStartLjubljana();
  const dates = datesInCurrentMonthLjubljana(); // oldest first, this month only

  const [todayWeightRows, energyRows, consumedRows, weightRows] = await Promise.all([
    db.select().from(weightLog).where(eq(weightLog.date, today)).limit(1),
    db.select().from(dailyEnergy).where(gte(dailyEnergy.date, monthStart)),
    db
      .select({
        date: foodLog.date,
        consumed: sql<number>`sum(${foodLog.kcal})`.mapWith(Number),
      })
      .from(foodLog)
      .where(gte(foodLog.date, monthStart))
      .groupBy(foodLog.date),
    db.select().from(weightLog).where(gte(weightLog.date, monthStart)),
  ]);

  const todayWeight = todayWeightRows[0];
  const energyByDate = new Map(energyRows.map((r) => [r.date, r]));
  const consumedByDate = new Map(consumedRows.map((r) => [r.date, r.consumed]));
  const weightByDate = new Map(weightRows.map((r) => [r.date, r]));

  const rows = dates.map((date) => {
    const energy = energyByDate.get(date);
    const weight = weightByDate.get(date);
    const burned = (energy?.activeKcal ?? 0) + (energy?.basalKcal ?? 0);
    const consumed = consumedByDate.get(date) ?? 0;
    return {
      date,
      morningKg: weight?.morningKg ?? null,
      eveningKg: weight?.eveningKg ?? null,
      deficit: burned - consumed,
      hasEnergyData: Boolean(energy),
    };
  });
  const displayRows = [...rows].reverse(); // newest first

  return (
    <div className="flex flex-1 flex-col max-w-2xl w-full mx-auto p-6 gap-6">
      <Nav current="weight" />

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-sm font-semibold">Log today&apos;s weight</h2>
        <form action={logWeight} className="mt-3 flex items-end gap-2">
          <label className="flex-1">
            <span className="text-xs text-stone-400">Morning (kg)</span>
            <input
              name="morningKg"
              type="number"
              step="0.05"
              inputMode="decimal"
              placeholder="kg"
              defaultValue={todayWeight?.morningKg ?? ""}
              className="mt-1 w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
            />
          </label>
          <label className="flex-1">
            <span className="text-xs text-stone-400">Evening (kg)</span>
            <input
              name="eveningKg"
              type="number"
              step="0.05"
              inputMode="decimal"
              placeholder="kg"
              defaultValue={todayWeight?.eveningKg ?? ""}
              className="mt-1 w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/60"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900"
          >
            Save
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-stone-500">This month</h2>
        <div className="scroll-panel flex max-h-112 flex-col gap-2 overflow-auto pr-1">
          {displayRows.map((r) => (
            <WeightRow
              key={r.date}
              date={r.date}
              morningKg={r.morningKg}
              eveningKg={r.eveningKg}
              deficit={r.deficit}
              hasEnergyData={r.hasEnergyData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
