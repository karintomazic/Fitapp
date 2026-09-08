CREATE TABLE "daily_energy" (
	"date" date PRIMARY KEY NOT NULL,
	"active_kcal" integer,
	"basal_kcal" integer,
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "food_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"label" text NOT NULL,
	"kcal" integer NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now()
);
