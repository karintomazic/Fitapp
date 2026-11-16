CREATE TABLE "profile" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text,
	"age" integer,
	"height_cm" real,
	"goal_weight_kg" real,
	"kcal_goal" integer DEFAULT 1800 NOT NULL,
	"carbs_goal" integer DEFAULT 200 NOT NULL,
	"protein_goal" integer DEFAULT 120 NOT NULL,
	"fat_goal" integer DEFAULT 60 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
