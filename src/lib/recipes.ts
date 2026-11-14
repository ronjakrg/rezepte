import { useState, useEffect } from "react";
import type { Recipe } from "../types";

let cache: Recipe[] | null = null;
const listeners: Array<(recipes: Recipe[]) => void> = [];

function notifyListeners(recipes: Recipe[]) {
  listeners.forEach((fn) => fn(recipes));
}

async function loadRecipes(): Promise<Recipe[]> {
  if (cache) return cache;

  const res = await fetch("/data/recipes/recipes.json");
  if (!res.ok) throw new Error(`Failed to load recipes: ${res.status}`);
  const data: Recipe[] = await res.json();

  cache = data;
  notifyListeners(data);
  return data;
}

// image: optional JPEG data URL, saved by the server under the recipe's name
export async function createRecipe(
  recipe: Recipe,
  image?: string,
): Promise<Recipe> {
  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe, image }),
  });
  if (res.status === 409)
    throw new Error("Ein Rezept mit diesem Namen gibt es schon");
  if (!res.ok) throw new Error(`Failed to create recipe: ${res.status}`);

  const created: Recipe = await res.json();
  cache = [...(cache ?? []), created];
  notifyListeners(cache);
  return created;
}

export async function updateRecipe(
  originalTitle: string,
  recipe: Recipe,
  image?: string,
): Promise<Recipe> {
  const res = await fetch("/api/recipes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalTitle, recipe, image }),
  });
  if (res.status === 409)
    throw new Error("Ein Rezept mit diesem Namen gibt es schon");
  if (!res.ok) throw new Error(`Failed to update recipe: ${res.status}`);

  const updated: Recipe = await res.json();
  cache = (cache ?? []).map((r) => (r.title === originalTitle ? updated : r));
  notifyListeners(cache);
  return updated;
}

// Hook for components
export function useRecipes(): Recipe[] {
  const [recipes, setRecipes] = useState<Recipe[]>(() => cache ?? []);

  useEffect(() => {
    listeners.push(setRecipes);
    if (cache) {
      Promise.resolve().then(() => {
        setRecipes(cache!);
      });
    } else {
      loadRecipes().catch(console.error);
    }
    return () => {
      const idx = listeners.indexOf(setRecipes);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return recipes;
}

export default loadRecipes;
