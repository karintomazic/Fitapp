import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// One row per day, upserted by the sync job.
export const dailyEnergy = pgTable("daily_energy", {
  date: date("date").primaryKey(), // local date, Europe/Ljubljana
  activeKcal: integer("active_kcal"),
  basalKcal: integer("basal_kcal"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
});

// Many rows per day.
export const foodLog = pgTable("food_log", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // local date
  label: text("label").notNull(), // "lunch", "yogurt", whatever
  kcal: integer("kcal").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow(),
});
