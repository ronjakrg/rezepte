import type { Recipe } from "../types";
import images from "../lib/images";
import KeywordBadge from "./KeywordBadge";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const imageSrc = images[recipe.image?.replace(/\.[^.]+$/, "") ?? ""] ?? images["example"];

  return (
    <div className="recipe-tile" onClick={() => onSelect(recipe)}>
      <img className="recipe-tile-image" src={imageSrc} alt={recipe.title} />
      <div className="recipe-tile-info">
        <h3 className="recipe-tile-title">{recipe.title}</h3>
        <div className="recipe-meta">
          {recipe.keywords.map((kw) => (
            <KeywordBadge key={kw} keyword={kw} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
