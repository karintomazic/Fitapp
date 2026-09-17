"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { foodLog, foods, mealEnum, type MealType } from "@/db/schema";
import { todayLjubljana } from "@/lib/date";
import { macrosForGrams } from "@/lib/nutrition";

export async function addFood(formData: FormData) {
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
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(foods).where(eq(foods.id, id));

  revalidatePath("/");
}

export async function logFood(formData: FormData) {
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
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return;
  }

  await db.delete(foodLog).where(eq(foodLog.id, id));

  revalidatePath("/");
}
