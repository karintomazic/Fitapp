CREATE TYPE "public"."meal" AS ENUM('breakfast', 'lunch', 'dinner');--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kcal_per_100g" real NOT NULL,
	"carbs_per_100g" real NOT NULL,
	"protein_per_100g" real NOT NULL,
	"fat_per_100g" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "foods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "meal" "meal" NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "food_id" integer;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "grams" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "carbs" real NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "protein" real NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD COLUMN "fat" real NOT NULL;--> statement-breakpoint
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE set null ON UPDATE no action;