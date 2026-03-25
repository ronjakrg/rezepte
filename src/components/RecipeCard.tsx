import type { Recipe } from "../types";
import images from "../lib/images";
import Badge from "./Badge";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const imageSrc =
    images[recipe.image?.replace(/\.[^.]+$/, "") ?? ""] ?? images["example"];

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <img className="recipe-card-image" src={imageSrc} alt={recipe.title} />
      <div>
        <h4>{recipe.title}</h4>
        <div className="badge-wrapper">
          {recipe.keywords.map((keyword) => (
            <Badge key={keyword} label={keyword} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
