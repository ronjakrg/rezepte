import { useState } from "react";
import type { Recipe } from "../types";
import images from "../lib/images";
import Badge from "./Badge";

interface RecipeDetailsProps {
  recipe: Recipe;
}

function RecipeDetails({ recipe }: RecipeDetailsProps) {
  const imageSrc = images[recipe.image?.replace(/\.[^.]+$/, "") ?? ""] ?? images["example"];
  const [servings, setServings] = useState(1);

  return (
    <div className="recipe-details">
      <div className="recipe-details-header">
        <h2>{recipe.title}</h2>
        <div className="recipe-meta">
          <span className="badge">🕐 {recipe.preptime} min</span>
          <Badge label={recipe.category} />
          {recipe.keywords.map((keyword) => (
            <Badge key={keyword} label={keyword} />
          ))}
        </div>
      </div>

      <div className="recipe-details-grid">
        <div className="recipe-details-left">
          <img className="recipe-details-image" src={imageSrc} alt={recipe.title} />
        </div>
        <div className="recipe-details-right">
          <h3>Zubereitung</h3>
          <ol>
            {recipe.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {recipe.ovenInstructions && (
            <div className="oven-instructions-badge">
              <Badge label="Ofen" showLabel={false} />
              <span>{recipe.ovenInstructions.temperature}° {recipe.ovenInstructions.mode}, {recipe.ovenInstructions.time} min</span>
            </div>
          )}
        </div>
      </div>

      <div className="ingredients-header">
        <h3>Zutaten für</h3>
        <select
          className="servings-select"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Portion" : "Portionen"}
            </option>
          ))}
        </select>
      </div>
      <ul
        className="ingredients-cols"
        style={{
          columns: Math.min(Math.ceil(recipe.ingredients.length / 6), 4),
          width: `${(Math.min(Math.ceil(recipe.ingredients.length / 6), 4) / 4) * 100}%`,
        }}
      >
        {recipe.ingredients.map((ingredient, i) => {
          const amount = ingredient.amount !== null ? ingredient.amount * servings : null;
          const display = amount !== null
            ? `${Number.isInteger(amount) ? amount : amount.toFixed(1)} ${ingredient.unit} ${ingredient.name}`
            : ingredient.name;
          return <li key={i}>{display}</li>;
        })}
      </ul>
    </div>
  );
}

export default RecipeDetails;
