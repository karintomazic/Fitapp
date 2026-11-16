"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  foodLog,
  foods,
  mealEnum,
  profile,
  weightLog,
  type MealType,
} from "@/db/schema";
import { PROFILE_ID } from "@/lib/goals";
import { requireSession } from "@/lib/session";
import { todayLjubljana } from "@/lib/date";
import { macrosForGrams } from "@/lib/nutrition";

export async function addFood(formData: FormData) {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const kcalPer100g = Number(formData.get("kcalPer100g"));
  const carbsPer100g = Number(formData.get("carbsPer100g"));
  const proteinPer100g = Number(formData.get("proteinPer100g"));
  const fatPer100g = Number(formData.get("fatPer100g"));

  if (
    !name ||
    !Number.isFinite(kcalPer100g) ||
    !Number.isFinite(carbsPer100g) ||
    !Number.isFinite(proteinPer100g) ||
    !Number.isFinite(fatPer100g)
  ) {
    return;
  }

  await db
    .insert(foods)
    .values({ name, kcalPer100g, carbsPer100g, proteinPer100g, fatPer100g })
    .onConflictDoNothing({ target: foods.name });

  revalidatePath("/");
}

export async function deleteFood(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(foods).where(eq(foods.id, id));

  revalidatePath("/");
}

export async function logFood(formData: FormData) {
  await requireSession();

  const foodId = Number(formData.get("foodId"));
  const grams = Number(formData.get("grams"));
  const meal = String(formData.get("meal") ?? "");

  if (!Number.isFinite(foodId) || !Number.isFinite(grams) || grams <= 0) {
    return;
  }
  if (!mealEnum.enumValues.includes(meal as MealType)) {
    return;
  }

  const [food] = await db.select().from(foods).where(eq(foods.id, foodId)).limit(1);
  if (!food) {
    return;
  }

  const macros = macrosForGrams(food, grams);

  await db.insert(foodLog).values({
    date: todayLjubljana(),
    meal: meal as MealType,
    foodId: food.id,
    label: food.name,
    grams: Math.round(grams),
    ...macros,
  });

  revalidatePath("/");
}

export async function deleteFoodEntry(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(foodLog).where(eq(foodLog.id, id));

  revalidatePath("/");
}

// Blank fields mean "leave unchanged" rather than "clear" — the morning
// weight is often logged hours before the evening one.
export async function logWeight(formData: FormData) {
  await requireSession();

  const morningRaw = String(formData.get("morningKg") ?? "").trim();
  const eveningRaw = String(formData.get("eveningKg") ?? "").trim();
  const morningKg = morningRaw === "" ? undefined : Number(morningRaw);
  const eveningKg = eveningRaw === "" ? undefined : Number(eveningRaw);

  if (morningKg === undefined && eveningKg === undefined) {
    return;
  }
  if (
    (morningKg !== undefined && !Number.isFinite(morningKg)) ||
    (eveningKg !== undefined && !Number.isFinite(eveningKg))
  ) {
    return;
  }

  const date = todayLjubljana();
  const [existing] = await db
    .select()
    .from(weightLog)
    .where(eq(weightLog.date, date))
    .limit(1);

  const nextMorningKg = morningKg ?? existing?.morningKg ?? null;
  const nextEveningKg = eveningKg ?? existing?.eveningKg ?? null;

  await db
    .insert(weightLog)
    .values({ date, morningKg: nextMorningKg, eveningKg: nextEveningKg })
    .onConflictDoUpdate({
      target: weightLog.date,
      set: { morningKg: nextMorningKg, eveningKg: nextEveningKg },
    });

  revalidatePath("/weight");
}

// empty or invalid fields are saved as "not set"
function optionalNumber(formData: FormData, field: string) {
  const raw = String(formData.get(field) ?? "").trim();
  const value = Number(raw);
  return raw === "" || !Number.isFinite(value) || value <= 0 ? null : value;
}

export async function saveProfile(formData: FormData) {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim() || null;
  const age = optionalNumber(formData, "age");
  const heightCm = optionalNumber(formData, "heightCm");
  const goalWeightKg = optionalNumber(formData, "goalWeightKg");

  const kcalGoal = optionalNumber(formData, "kcalGoal");
  const carbsGoal = optionalNumber(formData, "carbsGoal");
  const proteinGoal = optionalNumber(formData, "proteinGoal");
  const fatGoal = optionalNumber(formData, "fatGoal");

  // goals are required, so don't save if one is missing
  if (!kcalGoal || !carbsGoal || !proteinGoal || !fatGoal) {
    redirect("/settings?error=goals");
  }

  const values = {
    name,
    age: age === null ? null : Math.round(age),
    heightCm,
    goalWeightKg,
    kcalGoal: Math.round(kcalGoal),
    carbsGoal: Math.round(carbsGoal),
    proteinGoal: Math.round(proteinGoal),
    fatGoal: Math.round(fatGoal),
    updatedAt: new Date(),
  };

  await db
    .insert(profile)
    .values({ id: PROFILE_ID, ...values })
    .onConflictDoUpdate({ target: profile.id, set: values });

  revalidatePath("/", "layout");
  redirect("/settings?saved=1");
}
