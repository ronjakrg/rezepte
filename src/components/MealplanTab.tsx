import { useState, useEffect } from "react";
import type {
  Recipe,
  WeeklyMealplan,
  MealType,
  Weekday,
  MealplanEntry,
} from "../types";
import { WEEKDAYS, MEAL_TYPES, WEEKDAY_LABELS, MEAL_LABELS } from "../types";
import {
  createEmptyMealplan,
  fetchMealplan,
  saveMealplan,
} from "../lib/mealplan";
import { useRecipes } from "../lib/recipes";
import images from "../lib/images";
import RecipePicker from "./RecipePicker";

interface MealplanTabProps {
  name: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

function MealplanTab({ name, onSelectRecipe }: MealplanTabProps) {
  const allRecipes = useRecipes();
  const [mealplan, setMealplan] = useState<WeeklyMealplan>(
    createEmptyMealplan(),
  );
  const [pickerTarget, setPickerTarget] = useState<{
    day: Weekday;
    meal: MealType;
  } | null>(null);

  useEffect(() => {
    fetchMealplan(name).then(setMealplan).catch(console.error);
  }, [name]);

  function getRecipeImage(tile: MealplanEntry): string {
    if (!tile || !tile.isRecipe) return images["example"];
    const recipe = allRecipes.find((r) => r.title === tile.title);
    if (!recipe?.image) return images["example"];
    return images[recipe.image];
  }

  function updateMealplan(updated: WeeklyMealplan) {
    setMealplan(updated);
    saveMealplan(name, updated).catch(console.error);
  }

  function handleSelect(entry: MealplanEntry) {
    if (!pickerTarget) return;
    const updated = {
      ...mealplan,
      [pickerTarget.day]: {
        ...mealplan[pickerTarget.day],
        [pickerTarget.meal]: { title: entry.title, isRecipe: entry.isRecipe },
      },
    };
    updateMealplan(updated);
    setPickerTarget(null);
  }

  function handleClear(day: Weekday, meal: MealType) {
    const updated = {
      ...mealplan,
      [day]: { ...mealplan[day], [meal]: null },
    };
    updateMealplan(updated);
  }

  return (
    <div>
      <div className="mealplan-grid">
        <div></div> {/* Empty cell for upper left corner */}
        {WEEKDAYS.map((day) => (
          <div key={day} className="mealplan-grid-heading">
            {WEEKDAY_LABELS[day]}
          </div>
        ))}
        {MEAL_TYPES.map((meal) => (
          <>
            <div
              key={`${meal}-label`}
              className="mealplan-grid-heading-rotated"
            >
              {MEAL_LABELS[meal]}
            </div>
            {WEEKDAYS.map((day) => {
              const tile = mealplan[day][meal];
              return (
                <div
                  key={`${day}-${meal}`}
                  className={`mealplan-cell${tile ? " mealplan-cell-filled" : ""}`}
                  onClick={() => {
                    if (!tile) {
                      setPickerTarget({ day, meal });
                    } else if (tile.isRecipe) {
                      const recipe = allRecipes.find(
                        (r) => r.title === tile.title,
                      );
                      if (recipe) onSelectRecipe(recipe);
                    }
                  }}
                >
                  {tile ? (
                    <>
                      <button
                        className="mealplan-remove-btn"
                        aria-label="Remove entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear(day, meal);
                        }}
                        tabIndex={0}
                      >
                        <i className="bi bi-x-circle-fill mealplan-remove-icon"></i>
                      </button>
                      {tile.isRecipe ? (
                        <>
                          <img
                            className="mealplan-cell-image"
                            src={getRecipeImage(tile)}
                            alt={tile.title}
                          />
                          <span className="mealplan-cell-text">
                            {tile.title}
                          </span>
                        </>
                      ) : (
                        <div className="mealplan-cell-text">{tile.title}</div>
                      )}
                    </>
                  ) : (
                    <span className="mealplan-plus-icon">+</span>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {pickerTarget && (
        <RecipePicker
          onSelect={handleSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}

export default MealplanTab;
