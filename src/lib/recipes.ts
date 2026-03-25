import type { Recipe } from "../types";

const modules = import.meta.glob<Recipe[]>("../../data/recipes/*.json", {
  eager: true,
  import: "default",
});

const entries = Object.entries(modules);
const nonExample = entries.filter(([path]) => !path.endsWith("/example.json"));

const allRecipes: Recipe[] =
  nonExample.length > 0
    ? nonExample.flatMap(([, recipes]) => recipes)
    : entries
        .filter(([path]) => path.endsWith("/example.json"))
        .flatMap(([, recipes]) => recipes);

export default allRecipes;
