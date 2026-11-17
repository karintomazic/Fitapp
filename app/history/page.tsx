import { asc, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog } from "@/db/schema";
import {
  currentMonthStartLocal,
  datesInCurrentMonthLocal,
  monthLabel,
} from "@/lib/date";
import { round1 } from "@/lib/nutrition";
import { DayBlock } from "@/components/DayBlock";
import { MonthBlock } from "@/components/MonthBlock";

export const dynamic = "force-dynamic";

export default async function History() {
  const monthStart = currentMonthStartLocal();
  const dates = datesInCurrentMonthLocal(); // oldest first, this month only

  const [energyRows, logRows, priorEnergyMonths, priorFoodMonths] =
    await Promise.all([
      db.select().from(dailyEnergy).where(gte(dailyEnergy.date, monthStart)),
      db
        .select()
        .from(foodLog)
        .where(gte(foodLog.date, monthStart))
        .orderBy(asc(foodLog.loggedAt)),
      db
        .select({
          month: sql<string>`to_char(${dailyEnergy.date}, 'YYYY-MM')`,
          activeKcal: sql<number>`sum(${dailyEnergy.activeKcal})`.mapWith(Number),
          basalKcal: sql<number>`sum(${dailyEnergy.basalKcal})`.mapWith(Number),
        })
        .from(dailyEnergy)
        .where(lt(dailyEnergy.date, monthStart))
        .groupBy(sql`to_char(${dailyEnergy.date}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${dailyEnergy.date}, 'YYYY-MM')`),
      db
        .select({
          month: sql<string>`to_char(${foodLog.date}, 'YYYY-MM')`,
          kcal: sql<number>`sum(${foodLog.kcal})`.mapWith(Number),
          carbs: sql<number>`sum(${foodLog.carbs})`.mapWith(Number),
          protein: sql<number>`sum(${foodLog.protein})`.mapWith(Number),
          fat: sql<number>`sum(${foodLog.fat})`.mapWith(Number),
        })
        .from(foodLog)
        .where(lt(foodLog.date, monthStart))
        .groupBy(sql`to_char(${foodLog.date}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${foodLog.date}, 'YYYY-MM')`),
    ]);

  const energyByDate = new Map(energyRows.map((r) => [r.date, r]));

  const logsByDate = new Map<string, typeof logRows>();
  for (const row of logRows) {
    const list = logsByDate.get(row.date);
    if (list) {
      list.push(row);
    } else {
      logsByDate.set(row.date, [row]);
    }
  }

  const energyByMonth = new Map(priorEnergyMonths.map((m) => [m.month, m]));
  const foodByMonth = new Map(priorFoodMonths.map((m) => [m.month, m]));
  const monthKeys = [
    ...new Set([...energyByMonth.keys(), ...foodByMonth.keys()]),
  ].sort();

  const monthRows = monthKeys.map((month) => {
    const energy = energyByMonth.get(month);
    const food = foodByMonth.get(month);
    const burned = (energy?.activeKcal ?? 0) + (energy?.basalKcal ?? 0);
    const consumed = food?.kcal ?? 0;
    return {
      month,
      label: monthLabel(month),
      burned,
      consumed,
      deficit: burned - consumed,
      carbs: round1(food?.carbs ?? 0),
      protein: round1(food?.protein ?? 0),
      fat: round1(food?.fat ?? 0),
      hasFoodData: Boolean(food),
    };
  });

  const dayRows = dates.map((date) => {
    const energy = energyByDate.get(date);
    return {
      date,
      burned: (energy?.activeKcal ?? 0) + (energy?.basalKcal ?? 0),
      hasData: Boolean(energy),
    };
  });

  const displayDayRows = [...dayRows].reverse(); // newest first
  const displayMonthRows = [...monthRows].reverse(); // newest first

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <h1 className="font-display text-2xl font-semibold">History</h1>

      <div className="flex flex-col gap-2">
        <h2 className="eyebrow">This month</h2>
        <div className="scroll-panel flex max-h-112 flex-col gap-2 overflow-auto pr-1">
          {displayDayRows.map((r, i) => (
            <DayBlock
              key={r.date}
              date={r.date}
              burned={r.burned}
              hasEnergyData={r.hasData}
              entries={logsByDate.get(r.date) ?? []}
              open={i === 0}
            />
          ))}
        </div>
      </div>

      {displayMonthRows.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="eyebrow">By month</h2>
          <div className="scroll-panel flex max-h-96 flex-col gap-2 overflow-auto pr-1">
            {displayMonthRows.map((m) => (
              <MonthBlock
                key={m.month}
                label={m.label}
                burned={m.burned}
                consumed={m.consumed}
                deficit={m.deficit}
                carbs={m.carbs}
                protein={m.protein}
                fat={m.fat}
                hasFoodData={m.hasFoodData}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
