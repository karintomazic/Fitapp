# Fitapp

A personal calorie and macro tracker that I built for myself and use every day on my iPhone.
At a glance it shows how many calories I've burned today (from my Apple Watch), how many I've
eaten, and the difference.

**Live:** [fitapp-sepia-pi.vercel.app](https://fitapp-sepia-pi.vercel.app/) (password protected, since it holds my personal data)

<img src="docs/screenshot.png" alt="Fitapp home screen showing calories eaten against the daily goal, a week strip, and carbs, protein and fat rings" width="320">

## Features

- **Today:** calories eaten, burned and left, plus carbs, protein and fat against daily goals
- **Food logging by meal** (breakfast, lunch, dinner) from a personal food library
- **Calendar and history:** past days, and month-by-month summaries
- **Weight log** with morning and evening weigh-ins
- **Settings** for profile and daily goals
- Light and dark mode
- Installable on the phone's home screen as a PWA

## Tech stack

- **Next.js 16** (App Router, Server Actions) and **React 19**
- **TypeScript**
- **Drizzle ORM** with **Postgres** on Neon
- **Tailwind CSS v4**
- Deployed on **Vercel**

## Key decisions

- **A PWA plus an Apple Shortcut, not a native app.** Apple Health data only lives on the
  phone, so something on the phone has to send it out. A daily Apple Shortcut posts the Apple
  Watch data to an API route (`app/api/sync-health`). A React Native app could read it live,
  but keeping it installed needs the Apple Developer Program (about €100 a year) for an app
  with one user. The trade-off: the numbers are as fresh as the last sync, not live.
- **A personal food library.** Each food is saved once with its macros per 100 g, then logged
  by grams. The macros are copied into each log entry, so editing a food later doesn't change
  past days.
- **Local dates, not UTC timestamps.** Days are stored as the Slovenian date, so a late-night
  snack doesn't land on the previous day.
- **Simple, secure access.** It's a single-user app, so instead of a full auth system it uses
  one password and a long-lived cookie. The Apple Watch sync has its own token. Both are
  checked with constant-time comparison.

## Run it locally

You need Node.js 20 or newer and a Postgres database (for example a free one on [Neon](https://neon.tech)).

Create `.env.local` with:

```bash
DATABASE_URL=postgres://...      # your Postgres connection string
APP_PASSWORD=...                 # the password for the login page
HEALTH_SYNC_TOKEN=...            # the token the Apple Shortcut sends
```

Then:

```bash
npm install
npm run db:migrate   # create the database tables
npm run dev          # http://localhost:3000
```
