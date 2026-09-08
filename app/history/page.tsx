import { gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog } from "@/db/schema";
import { lastNDatesLjubljana } from "@/lib/date";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function History() {
  const dates = lastNDatesLjubljana(DAYS); // oldest first
  const since = dates[0];

  const [energyRows, consumedRows] = await Promise.all([
    db.select().from(dailyEnergy).where(gte(dailyEnergy.date, since)),
    db
      .select({
        date: foodLog.date,
        consumed: sql<number>`sum(${foodLog.kcal})`.mapWith(Number),
      })
      .from(foodLog)
      .where(gte(foodLog.date, since))
      .groupBy(foodLog.date),
  ]);

  const energyByDate = new Map(energyRows.map((r) => [r.date, r]));
  const consumedByDate = new Map(consumedRows.map((r) => [r.date, r.consumed]));

  const rows = dates.reduce<
    Array<{
      date: string;
      burned: number;
      consumed: number;
      deficit: number;
      runningTotal: number;
      hasData: boolean;
    }>
  >((acc, date) => {
    const energy = energyByDate.get(date);
    const burned = (energy?.activeKcal ?? 0) + (energy?.basalKcal ?? 0);
    const consumed = consumedByDate.get(date) ?? 0;
    const deficit = burned - consumed;
    const runningTotal = (acc.at(-1)?.runningTotal ?? 0) + deficit;
    return [
      ...acc,
      { date, burned, consumed, deficit, runningTotal, hasData: Boolean(energy) },
    ];
  }, []);
  rows.reverse(); // newest first for display

  return (
    <div className="flex flex-1 flex-col max-w-2xl w-full mx-auto p-6 gap-6">
      <Nav current="history" />
      <p className="text-sm text-zinc-500">
        Last {DAYS} days. Running total: {" "}
        <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {rows[0]?.runningTotal ?? 0}
        </span>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium text-right">Burned</th>
              <th className="py-2 pr-3 font-medium text-right">Eaten</th>
              <th className="py-2 pr-3 font-medium text-right">Deficit</th>
              <th className="py-2 font-medium text-right">Running</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.date}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="py-2 pr-3 whitespace-nowrap">
                  {r.date}
                  {!r.hasData && (
                    <span className="ml-1 text-xs text-zinc-400">
                      (no sync)
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {r.burned}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {r.consumed}
                </td>
                <td className="py-2 pr-3 text-right font-medium tabular-nums">
                  {r.deficit}
                </td>
                <td className="py-2 text-right tabular-nums text-zinc-500">
                  {r.runningTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
