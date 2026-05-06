export type Food = {
  id: string;
  name: string;
  unit: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
};

export const FOODS: Food[] = [
  { id: "f1", name: "Eggs, scrambled", unit: "2 large", kcal: 180, p: 12, c: 2, f: 12 },
  { id: "f2", name: "Avocado", unit: "½ medium", kcal: 160, p: 2, c: 9, f: 15 },
  { id: "f3", name: "Sourdough toast", unit: "1 slice", kcal: 120, p: 4, c: 22, f: 1 },
  { id: "f4", name: "Chicken breast", unit: "6 oz grilled", kcal: 280, p: 53, c: 0, f: 6 },
  { id: "f5", name: "Jasmine rice", unit: "1 cup cooked", kcal: 205, p: 4, c: 45, f: 0 },
  { id: "f6", name: "Broccoli, steamed", unit: "1 cup", kcal: 55, p: 4, c: 11, f: 1 },
  { id: "f7", name: "Salmon fillet", unit: "5 oz baked", kcal: 290, p: 39, c: 0, f: 14 },
  { id: "f8", name: "Spinach salad", unit: "2 cups", kcal: 50, p: 4, c: 7, f: 1 },
  { id: "f9", name: "Whey protein", unit: "1 scoop", kcal: 120, p: 25, c: 3, f: 1 },
  { id: "f10", name: "Banana", unit: "1 medium", kcal: 105, p: 1, c: 27, f: 0 },
  { id: "f11", name: "Almond butter", unit: "1 tbsp", kcal: 95, p: 3, c: 3, f: 9 },
  { id: "f12", name: "Blueberries", unit: "½ cup", kcal: 42, p: 1, c: 11, f: 0 },
  { id: "f13", name: "Sirloin steak", unit: "6 oz", kcal: 360, p: 50, c: 0, f: 17 },
  { id: "f14", name: "Sweet potato", unit: "1 medium", kcal: 180, p: 4, c: 41, f: 0 },
  { id: "f15", name: "Cottage cheese", unit: "1 cup", kcal: 220, p: 25, c: 9, f: 9 },
  { id: "f16", name: "Oat milk latte", unit: "12 oz", kcal: 130, p: 3, c: 18, f: 5 },
  { id: "f17", name: "Dark chocolate", unit: "2 squares", kcal: 110, p: 2, c: 9, f: 8 },
  { id: "f18", name: "Chicken burrito", unit: "1 wrap", kcal: 620, p: 38, c: 64, f: 22 },
  { id: "f19", name: "Greek yogurt", unit: "1 cup plain", kcal: 130, p: 22, c: 8, f: 0 },
  { id: "f20", name: "Almonds", unit: "¼ cup", kcal: 165, p: 6, c: 6, f: 14 },
  { id: "f21", name: "Tuna, canned", unit: "1 can", kcal: 120, p: 26, c: 0, f: 1 },
  { id: "f22", name: "Apple", unit: "1 medium", kcal: 95, p: 0, c: 25, f: 0 },
  { id: "f23", name: "Olive oil", unit: "1 tbsp", kcal: 120, p: 0, c: 0, f: 14 },
  { id: "f24", name: "Pasta, cooked", unit: "1 cup", kcal: 220, p: 8, c: 43, f: 1 },
];

export const foodById = (id: string) => FOODS.find((f) => f.id === id);

export const RECENT_IDS = ["f1", "f9", "f4", "f5", "f6", "f10"];

export type MealId = "breakfast" | "lunch" | "dinner" | "snack";

export const MEALS: { id: MealId; label: string; code: string }[] = [
  { id: "breakfast", label: "Breakfast", code: "BF" },
  { id: "lunch", label: "Lunch", code: "LU" },
  { id: "dinner", label: "Dinner", code: "DN" },
  { id: "snack", label: "Snack", code: "SN" },
];

export type LogEntry = {
  id: string;
  mealId: MealId;
  foodId: string;
  servings: number;
  loggedAt: number;
};

export type Goals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const DEFAULT_GOALS: Goals = {
  kcal: 2400,
  protein: 180,
  carbs: 240,
  fat: 80,
};

export type Totals = { kcal: number; p: number; c: number; f: number };

export function computeTotals(log: LogEntry[]): Totals {
  return log.reduce<Totals>(
    (acc, entry) => {
      const food = foodById(entry.foodId);
      if (!food) return acc;
      const s = entry.servings;
      return {
        kcal: acc.kcal + food.kcal * s,
        p: acc.p + food.p * s,
        c: acc.c + food.c * s,
        f: acc.f + food.f * s,
      };
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
}

export function todayKey(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
