import { asc, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyEnergy, foodLog } from "@/db/schema";
import { lastNDatesLjubljana } from "@/lib/date";
import { Nav } from "@/components/Nav";
import { DayBlock } from "@/components/DayBlock";

export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function History() {
  const dates = lastNDatesLjubljana(DAYS); // oldest first
  const since = dates[0];

  const [energyRows, consumedRows, logRows] = await Promise.all([
    db.select().from(dailyEnergy).where(gte(dailyEnergy.date, since)),
    db
      .select({
        date: foodLog.date,
        consumed: sql<number>`sum(${foodLog.kcal})`.mapWith(Number),
      })
      .from(foodLog)
      .where(gte(foodLog.date, since))
      .groupBy(foodLog.date),
    db
      .select()
      .from(foodLog)
      .where(gte(foodLog.date, since))
      .orderBy(asc(foodLog.loggedAt)),
  ]);

  const energyByDate = new Map(energyRows.map((r) => [r.date, r]));
  const consumedByDate = new Map(consumedRows.map((r) => [r.date, r.consumed]));

  const logsByDate = new Map<string, typeof logRows>();
  for (const row of logRows) {
    const list = logsByDate.get(row.date);
    if (list) {
      list.push(row);
    } else {
      logsByDate.set(row.date, [row]);
    }
  }

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
      <p className="flex items-center gap-2 text-sm text-stone-500">
        Last {DAYS} days · Running total
        <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white dark:bg-stone-100 dark:text-stone-900">
          {rows[0]?.runningTotal ?? 0}
        </span>
      </p>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs tracking-wide text-stone-400 uppercase dark:border-stone-800">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-3 py-3 text-right font-medium">Burned</th>
              <th className="px-3 py-3 text-right font-medium">Eaten</th>
              <th className="px-3 py-3 text-right font-medium">Deficit</th>
              <th className="px-4 py-3 text-right font-medium">Running</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.date}
                className="border-b border-stone-100 last:border-0 dark:border-stone-800"
              >
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {r.date}
                  {!r.hasData && (
                    <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-400 dark:bg-stone-800">
                      no sync
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-stone-500">
                  {r.burned}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-stone-500">
                  {r.consumed}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {r.deficit}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-stone-400">
                  {r.runningTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-stone-500">Food by day</h2>
        {rows.map((r, i) => (
          <DayBlock
            key={r.date}
            date={r.date}
            entries={logsByDate.get(r.date) ?? []}
            open={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
