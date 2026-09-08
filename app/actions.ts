"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { foodLog } from "@/db/schema";
import { todayLjubljana } from "@/lib/date";

export async function addFoodEntry(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const kcal = Number(formData.get("kcal"));

  if (!label || !Number.isFinite(kcal)) {
    return;
  }

  await db.insert(foodLog).values({
    date: todayLjubljana(),
    label,
    kcal: Math.round(kcal),
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
