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
