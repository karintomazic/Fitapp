import { timingSafeEqual } from "crypto";
import { db } from "@/db";
import { dailyEnergy } from "@/db/schema";

function isAuthorized(request: Request): boolean {
  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.HEALTH_SYNC_TOKEN}`;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  return (
    providedBuf.length === expectedBuf.length &&
    timingSafeEqual(providedBuf, expectedBuf)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { date, activeKcal, basalKcal } = body ?? {};

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid or missing 'date'" }, { status: 400 });
  }
  if (!Number.isFinite(activeKcal) || !Number.isFinite(basalKcal)) {
    return Response.json(
      { error: "Invalid or missing 'activeKcal' / 'basalKcal'" },
      { status: 400 },
    );
  }

  await db
    .insert(dailyEnergy)
    .values({
      date,
      activeKcal: Math.round(activeKcal),
      basalKcal: Math.round(basalKcal),
      syncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: dailyEnergy.date,
      set: {
        activeKcal: Math.round(activeKcal),
        basalKcal: Math.round(basalKcal),
        syncedAt: new Date(),
      },
    });

  return Response.json({ ok: true });
}
