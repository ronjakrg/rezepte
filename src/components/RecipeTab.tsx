import recipes from "../lib/recipes";
import RecipeCard from "./RecipeCard";
import RecipeOverview from "./RecipeOverview";
import type { Recipe } from "../types";
import { getKeywordIcon } from "../lib/keywords";

const recipesByCategory = recipes.reduce<Record<string, Recipe[]>>(
  (acc, recipe) => {
    const cat = recipe.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(recipe);
    return acc;
  },
  {}
);

interface RecipeTabProps {
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe | null) => void;
}

function RecipeTab({ selectedRecipe, onSelectRecipe }: RecipeTabProps) {
  return selectedRecipe ? (
    <RecipeOverview recipe={selectedRecipe} />
  ) : (
    <>
      {Object.entries(recipesByCategory).map(([category, items]) => (
        <details key={category} className="category-section" open>
          <summary className="category-header">
            {getKeywordIcon(category).value} {category}
          </summary>
          <div className="recipe-grid">
            {items.map((recipe, index) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>
        </details>
      ))}
    </>
  );
}

export default RecipeTab;
