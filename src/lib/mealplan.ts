import type {
  WeeklyMealplan,
  Weekday,
  MealType,
  MealplanEntry,
} from "../types";
import { WEEKDAYS, MEAL_TYPES } from "../types";

export interface MealplanMeta {
  name: string;
  displayName: string;
}

export function createEmptyMealplan(): WeeklyMealplan {
  const plan = {} as WeeklyMealplan;
  for (const day of WEEKDAYS) {
    plan[day] = { breakfast: null, lunch: null, dinner: null };
  }
  return plan;
}

function parseMealplan(data: Record<string, unknown>[]): WeeklyMealplan {
  const plan = createEmptyMealplan();
  for (const entry of data) {
    const day = entry.day as Weekday;
    if (!WEEKDAYS.includes(day)) continue;
    for (const meal of MEAL_TYPES as MealType[]) {
      const slot = entry[meal] as MealplanEntry;
      if (slot?.title && typeof slot.isRecipe === "boolean") {
        plan[day][meal] = { title: slot.title, isRecipe: slot.isRecipe };
      } else {
        plan[day][meal] = null;
      }
    }
  }
  return plan;
}

function serializeMealplan(plan: WeeklyMealplan): Record<string, unknown>[] {
  return WEEKDAYS.map((day) => ({
    day,
    breakfast: plan[day].breakfast,
    lunch: plan[day].lunch,
    dinner: plan[day].dinner,
  }));
}

export async function fetchMealplanList(): Promise<MealplanMeta[]> {
  const res = await fetch("/api/mealplans");
  if (!res.ok) throw new Error(`Failed to load mealplan list: ${res.status}`);
  return res.json();
}

export async function fetchMealplan(name: string): Promise<WeeklyMealplan> {
  const res = await fetch(`/api/mealplans/${name}`);
  if (!res.ok) throw new Error(`Failed to load mealplan: ${res.status}`);
  const data: Record<string, unknown>[] = await res.json();
  if (!Array.isArray(data) || data.length === 0) return createEmptyMealplan();
  return parseMealplan(data);
}

export async function createMealplan(
  displayName: string,
): Promise<MealplanMeta> {
  const res = await fetch("/api/mealplans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) throw new Error(`Failed to create mealplan: ${res.status}`);
  return res.json();
}

export async function saveMealplan(
  name: string,
  plan: WeeklyMealplan,
): Promise<void> {
  const res = await fetch(`/api/mealplans/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeMealplan(plan)),
  });
  if (!res.ok) throw new Error(`Failed to save mealplan: ${res.status}`);
}

export async function deleteMealplan(name: string): Promise<void> {
  const res = await fetch(`/api/mealplans/${name}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete mealplan: ${res.status}`);
}
