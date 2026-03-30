import { useCallback } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import React from "react";
import type { Recipe } from "../types";
import { WEEKDAYS, MEAL_TYPES, WEEKDAY_LABELS, MEAL_LABELS } from "../types";
import { useRecipes } from "../lib/recipes";
import images from "../lib/images";
import type { MealplanEntry } from "../types";
import { useMealplan } from "../lib/useMealplan";
import { MealplanGridCell, MealplanCellContent } from "./MealplanCell";
import RecipePicker from "./RecipePicker";

interface MealplanTabProps {
  name: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

function MealplanTab({ name, onSelectRecipe }: MealplanTabProps) {
  const allRecipes = useRecipes();

  const {
    sensors,
    mealplan,
    pickerTarget,
    activeDrag,
    handleOpen,
    handleRemove,
    handleSelect,
    handleDragStart,
    handleDragEnd,
    closePickerTarget,
  } = useMealplan(name);

  const getRecipeImage = useCallback(
    (entry: MealplanEntry): string => {
      if (!entry?.isRecipe) return images["null"];
      const recipe = allRecipes.find((r) => r.title === entry.title);
      return images[recipe?.image ?? "null"];
    },
    [allRecipes],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="mealplan-grid">
          {/* Upper-left corner */}
          <div />

          {WEEKDAYS.map((day) => (
            <div key={day} className="mealplan-grid-heading">
              {WEEKDAY_LABELS[day]}
            </div>
          ))}

          {MEAL_TYPES.map((meal) => (
            <React.Fragment key={meal}>
              <div className="mealplan-grid-heading-rotated">
                {MEAL_LABELS[meal]}
              </div>

              {WEEKDAYS.map((day) => (
                <MealplanGridCell
                  key={`${day}-${meal}`}
                  day={day}
                  meal={meal}
                  entry={mealplan[day][meal]}
                  onOpen={handleOpen}
                  onRemove={handleRemove}
                  onSelectRecipe={onSelectRecipe}
                  getRecipeImage={getRecipeImage}
                  allRecipes={allRecipes}
                />
              ))}
            </React.Fragment>
          ))}
        </div>

        {pickerTarget && (
          <RecipePicker onSelect={handleSelect} onClose={closePickerTarget} />
        )}

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="mealplan-cell mealplan-cell-filled dragging">
              <span className="mealplan-cell-content">
                <MealplanCellContent
                  entry={activeDrag.entry}
                  getRecipeImage={getRecipeImage}
                />
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default MealplanTab;
