import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profile } from "@/db/schema";

export const PROFILE_ID = 1;

// used until something is saved on the Settings page
const DEFAULT_PROFILE = {
  id: PROFILE_ID,
  name: null,
  age: null,
  heightCm: null,
  goalWeightKg: null,
  kcalGoal: 1800,
  carbsGoal: 200,
  proteinGoal: 120,
  fatGoal: 60,
  updatedAt: null,
};

export async function getProfile() {
  const [row] = await db
    .select()
    .from(profile)
    .where(eq(profile.id, PROFILE_ID))
    .limit(1);

  return row ?? DEFAULT_PROFILE;
}
