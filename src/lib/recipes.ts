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

// Hook for components
export function useRecipes(): Recipe[] {
  const [recipes, setRecipes] = useState<Recipe[]>(() => cache ?? []);

  useEffect(() => {
    let didSet = false;
    if (cache) {
      Promise.resolve().then(() => {
        setRecipes(cache!);
      });
      didSet = true;
    }
    if (!didSet) {
      listeners.push(setRecipes);
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
