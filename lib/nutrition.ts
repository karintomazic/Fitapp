export type Macros = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type FoodMacros = {
  kcalPer100g: number;
  carbsPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
};

export function macrosForGrams(food: FoodMacros, grams: number): Macros {
  const factor = grams / 100;
  return {
    kcal: Math.round(food.kcalPer100g * factor),
    carbs: round1(food.carbsPer100g * factor),
    protein: round1(food.proteinPer100g * factor),
    fat: round1(food.fatPer100g * factor),
  };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
