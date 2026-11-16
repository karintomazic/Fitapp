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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <h1 className="font-display text-2xl font-semibold">Weight</h1>

      <div className="glass rounded-3xl p-4">
        <h2 className="font-display text-base font-semibold">Log today&apos;s weight</h2>
        <form action={logWeight} className="mt-3 flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="eyebrow">Morning (kg)</span>
            <input
              name="morningKg"
              type="number"
              step="0.05"
              inputMode="decimal"
              placeholder="kg"
              defaultValue={todayWeight?.morningKg ?? ""}
              className="field mt-1 w-full"
            />
          </label>
          <label className="min-w-0 flex-1">
            <span className="eyebrow">Evening (kg)</span>
            <input
              name="eveningKg"
              type="number"
              step="0.05"
              inputMode="decimal"
              placeholder="kg"
              defaultValue={todayWeight?.eveningKg ?? ""}
              className="field mt-1 w-full"
            />
          </label>
          <button
            type="submit"
            className="btn-primary"
          >
            Save
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="eyebrow">This month</h2>
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

      <Nav current="weight" />
    </div>
  );
}
