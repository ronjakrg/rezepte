import { useState } from "react";
import type { MealplanEntry } from "../types";
import allRecipes from "../lib/recipes";
import RecipeCard from "./RecipeCard";

interface RecipePickerProps {
  onSelect: (entry: MealplanEntry) => void;
  onClose: () => void;
}

function RecipePicker({ onSelect, onClose }: RecipePickerProps) {
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");

  const query = search.toLowerCase();
  const filtered = query
    ? allRecipes.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          r.keywords.some((k) => k.toLowerCase().includes(query)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(query)),
      )
    : allRecipes;

  const handleNote = () => {
    if (note.trim()) {
      onSelect({ title: note.trim(), isRecipe: false });
      setNote("");
    }
  };

  return (
    <div className="recipe-picker-overlay" onClick={onClose}>
      <div className="recipe-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wrapper">
          <div className="recipe-picker-header">
            Rezept auswählen
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          <input
            className="text-input"
            type="text"
            placeholder="Rezept suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="recipe-picker-note-row">
            <input
              className="text-input"
              type="text"
              placeholder="Notiz hinzufügen..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="arrow-btn" type="button" onClick={handleNote}>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          <div className="recipe-picker-grid">
            {filtered.map((recipe, i) => (
              <RecipeCard
                key={i}
                recipe={recipe}
                onSelect={() =>
                  onSelect({ title: recipe.title, isRecipe: true })
                }
              />
            ))}
            {filtered.length === 0 && <p>Keine Rezepte gefunden</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipePicker;
