import { timingSafeEqual } from "crypto";
import { db } from "@/db";
import { dailyEnergy } from "@/db/schema";

function isAuthorized(request: Request): boolean {
  const token = process.env.HEALTH_SYNC_TOKEN;
  // without a token set, "Bearer undefined" would be the key, so let no one in
  if (!token) return false;

  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${token}`;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  return (
    providedBuf.length === expectedBuf.length &&
    timingSafeEqual(providedBuf, expectedBuf)
  );
}

// YYYY-MM-DD and a day that exists, so 2026-02-31 is a 400, not a database error
function isRealDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { date, activeKcal, basalKcal } = body ?? {};

  if (typeof date !== "string" || !isRealDate(date)) {
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
