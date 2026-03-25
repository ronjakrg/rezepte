import type {
  WeeklyMealplan,
  Weekday,
  MealType,
  MealplanEntry,
} from "../types";
import { WEEKDAYS } from "../types";

// Load the initial mealplan from JSON
const modules = import.meta.glob<Record<string, unknown>[]>(
  "../../data/mealplans/*.json",
  { eager: true, import: "default" },
);

function createEmptyMealplan(): WeeklyMealplan {
  const plan = {} as WeeklyMealplan;
  for (const day of WEEKDAYS) {
    plan[day] = { breakfast: null, lunch: null, dinner: null };
  }
  return plan;
}

// Map the JSON array format to our Mealplan record
function parseMealplan(data: Record<string, unknown>[]): WeeklyMealplan {
  const plan = createEmptyMealplan();

  for (const entry of data) {
    const day = entry.day as Weekday;
    if (!WEEKDAYS.includes(day)) continue;

    for (const meal of ["breakfast", "lunch", "dinner"] as MealType[]) {
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

// Find and parse the first mealplan JSON
const entries = Object.values(modules);
export const initialMealplan: WeeklyMealplan =
  entries.length > 0 && Array.isArray(entries[0])
    ? parseMealplan(entries[1])
    : createEmptyMealplan();

export { createEmptyMealplan };
