export interface Ingredient {
  amount: number | null;
  unit: string | null;
  name: string;
}

export interface OvenInstructions {
  temperature: number;
  mode: string;
  time: number;
}

export interface Recipe {
  title: string;
  preptime: number;
  category: string;
  keywords: string[];
  ingredients: Ingredient[];
  instructions: string[];
  ovenInstructions?: OvenInstructions;
  image?: string;
}

export type MealType = "breakfast" | "lunch" | "dinner";
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];
export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Frühstück",
  lunch: "Mittag",
  dinner: "Abend",
};

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
};

export type MealplanEntry = { title: string; isRecipe: boolean };
export type WeeklyMealplan = Record<
  Weekday,
  Record<MealType, MealplanEntry | null>
>;
