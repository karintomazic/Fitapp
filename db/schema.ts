import {
  date,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// One row per day, upserted by the sync job.
export const dailyEnergy = pgTable("daily_energy", {
  date: date("date").primaryKey(), // local date, in the TIMEZONE setting
  activeKcal: integer("active_kcal"),
  basalKcal: integer("basal_kcal"),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
});

// One row per day, manually logged — morning and/or evening weigh-in.
export const weightLog = pgTable("weight_log", {
  date: date("date").primaryKey(), // local date, in the TIMEZONE setting
  morningKg: real("morning_kg"),
  eveningKg: real("evening_kg"),
});

export const mealEnum = pgEnum("meal", ["breakfast", "lunch", "dinner"]);
export type MealType = (typeof mealEnum.enumValues)[number];

// Personal food library. Defined once with macros per 100g, then reused by
// grams each time it's logged.
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  kcalPer100g: real("kcal_per_100g").notNull(),
  carbsPer100g: real("carbs_per_100g").notNull(),
  proteinPer100g: real("protein_per_100g").notNull(),
  fatPer100g: real("fat_per_100g").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// One logged portion of a food, assigned to a meal on a given day. Macros are
// snapshotted at log time so editing a food later doesn't rewrite history.
export const foodLog = pgTable("food_log", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // local date
  meal: mealEnum("meal").notNull(),
  foodId: integer("food_id").references(() => foods.id, {
    onDelete: "set null",
  }),
  label: text("label").notNull(), // food name snapshot at log time
  grams: integer("grams").notNull(),
  kcal: integer("kcal").notNull(),
  carbs: real("carbs").notNull(),
  protein: real("protein").notNull(),
  fat: real("fat").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow(),
});

// A single row (id 1) with profile info and daily goals, edited on Settings.
export const profile = pgTable("profile", {
  id: integer("id").primaryKey(),
  name: text("name"),
  age: integer("age"),
  heightCm: real("height_cm"),
  goalWeightKg: real("goal_weight_kg"),
  kcalGoal: integer("kcal_goal").notNull().default(1800),
  carbsGoal: integer("carbs_goal").notNull().default(200),
  proteinGoal: integer("protein_goal").notNull().default(120),
  fatGoal: integer("fat_goal").notNull().default(60),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
