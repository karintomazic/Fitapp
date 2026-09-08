# Personal Calorie Deficit Tracker

Single-user app. Karin is the only user. No auth system, no multi-tenancy, no onboarding
flow — do not build any of that.

## Goal

Show, at a glance on my phone: how many calories I've burned today (from Apple Watch),
how many I've eaten, and the difference.

`deficit = (activeKcal + basalKcal) - consumedKcal`

## Architecture decision

Apple Health data is on-device only. There is no cloud API for it. So something on the
iPhone has to push the data out.

**Chosen: Next.js PWA + a daily Apple Shortcut that POSTs HealthKit data to an API route.**

Rejected: React Native / Expo with `react-native-health`. It works and gives live
on-device reads, but it needs a native development build (Expo Go can't do HealthKit),
and keeping the app installed past 7 days requires the Apple Developer Program at ~€100/year
for an app with one user. Not worth it here.

The tradeoff accepted: numbers are as fresh as the last sync, not live. If that becomes
annoying, the fix is to swap the ingest layer only — increase sync frequency, or move to
Health Auto Export (paid app, background hourly push). The database and API stay as-is.

## Stack

- Next.js (App Router), TypeScript
- Vercel, hobby tier
- Postgres on Neon or Supabase
- Drizzle ORM
- PWA via `manifest.json` + `apple-touch-icon`, installed from Safari via Add to Home Screen
- No component library needed; this is a handful of screens
## Data model

```ts
// One row per day, upserted by the sync job.
daily_energy {
  date        date primary key   // local date, Europe/Ljubljana
  active_kcal integer
  basal_kcal  integer
  synced_at   timestamptz
}

// Many rows per day.
food_log {
  id        serial primary key
  date      date not null        // local date
  label     text not null        // "lunch", "yogurt", whatever
  kcal      integer not null
  logged_at timestamptz default now()
}
```

Dates are plain `date` columns holding the **local** Slovenian date, not UTC timestamps.
The Shortcut sends the date it computed on the phone. This avoids the classic bug where
a 01:00 entry lands on the previous day.

## Sync contract

`POST /api/sync-health`

```
Authorization: Bearer <HEALTH_SYNC_TOKEN>
Content-Type: application/json

{ "date": "2026-09-08", "activeKcal": 512, "basalKcal": 1478 }
```

Upserts into `daily_energy` on `date`. Returns 401 on a bad token.

This route is on the public internet. The token lives in an env var and is compared with
`crypto.timingSafeEqual`. Nothing else about the app is exposed.

### The Shortcut (built by hand on the iPhone)

For each of Active Energy and Basal Energy:
1. **Find Health Samples** — Type: Active Energy (then Basal Energy), filter Start Date is Today
2. **Calculate Statistics** — Operation: Sum
Then a **Text** action to assemble the JSON, and **Get Contents of URL** — method POST,
the Authorization and Content-Type headers, body = the Text.

Attach it to a Personal Automation at 23:00 daily, with "Ask Before Running" turned **off**.

## Screens

1. **Today** — the three numbers and the deficit, big. A form to add a food entry
   (label + kcal). List of today's entries, each deletable.
2. **History** — last 30 days, one row per day, deficit per day. A running total.
That's the whole app. Resist adding more.

## Known gotchas

- **Basal energy is only recorded while the Watch is worn.** Take it off for a few hours
  and that day silently undercounts. If this shows up in the data, fall back to a fixed
  estimated BMR for the uncovered portion rather than trusting the raw number.
- Apple's basal figure is an estimate from height/weight/age, not a measurement. Treat the
  deficit as a trend line across a week, not a precise daily figure.
- Active + Basal is full TDEE (~2000+ kcal). It will not match the Move ring, which shows
  active only. This is expected.
- Add to Home Screen only works from **Safari** on iOS, not Chrome.
- Workouts are already included in Active Energy. Do not add them separately or you'll
  double count.
## Build order

1. Next.js project, Drizzle schema, migration against the Neon/Supabase database
2. `/api/sync-health` with the bearer token — verify with `curl` before touching the phone
3. Build the Shortcut, run it manually, confirm a row lands in `daily_energy`
4. Today screen
5. Food logging
6. PWA manifest, install to home screen
7. History screen
8. Turn on the 23:00 automation

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
