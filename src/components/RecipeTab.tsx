import recipes from "../lib/recipes";
import RecipeCard from "./RecipeCard";
import RecipeDetails from "./RecipeDetails";
import type { Recipe } from "../types";
import { getKeywordIcon } from "../lib/keywords";

const recipesByCategory = recipes.reduce<Record<string, Recipe[]>>(
  (acc, recipe) => {
    const cat = recipe.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(recipe);
    return acc;
  },
  {},
);

interface RecipeTabProps {
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe | null) => void;
}

function RecipeTab({ selectedRecipe, onSelectRecipe }: RecipeTabProps) {
  return selectedRecipe ? (
    <RecipeDetails recipe={selectedRecipe} />
  ) : (
    <>
      {Object.entries(recipesByCategory).map(([category, items]) => (
        <details key={category} className="mb" open>
          <summary className="summary-heading">
            <i className="bi bi-chevron-right summary-chevron"></i>
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
