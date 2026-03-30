import { useState, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
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
import React from "react";

interface MealplanTabProps {
  name: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

function MealplanTab({ name, onSelectRecipe }: MealplanTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
  );
  const allRecipes = useRecipes();
  const [mealplan, setMealplan] = useState<WeeklyMealplan>(
    createEmptyMealplan(),
  );
  const [pickerTarget, setPickerTarget] = useState<{
    day: Weekday;
    meal: MealType;
  } | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    day: Weekday;
    meal: MealType;
    entry: MealplanEntry;
  } | null>(null);

  useEffect(() => {
    fetchMealplan(name).then(setMealplan).catch(console.error);
  }, [name]);

  function getRecipeImage(tile: MealplanEntry): string {
    if (!tile || !tile.isRecipe) return images["null"];
    const recipe = allRecipes.find((r) => r.title === tile.title);
    return images[recipe?.image ?? "null"];
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

  function handleDragStart(event: DragStartEvent) {
    const current = event.active.data.current;
    if (
      current &&
      typeof current === "object" &&
      "day" in current &&
      "meal" in current &&
      "entry" in current
    ) {
      const { day, meal, entry } = current as {
        day: Weekday;
        meal: MealType;
        entry: MealplanEntry;
      };
      setActiveDrag({ day, meal, entry });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    if (over && over.id && activeDrag) {
      const [targetDay, targetMeal] = (over.id as string).split("|");
      if (!mealplan[targetDay as Weekday][targetMeal as MealType]) {
        const updated = {
          ...mealplan,
          [targetDay]: {
            ...mealplan[targetDay as Weekday],
            [targetMeal]: { ...activeDrag.entry },
          },
        };
        updateMealplan(updated);
      }
    }
    setActiveDrag(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="mealplan-grid">
          <div></div> {/* Empty cell for upper left corner */}
          {WEEKDAYS.map((day) => (
            <div key={day} className="mealplan-grid-heading">
              {WEEKDAY_LABELS[day]}
            </div>
          ))}
          {MEAL_TYPES.map((meal) => (
            <React.Fragment key={meal}>
              <div
                key={`${meal}-label`}
                className="mealplan-grid-heading-rotated"
              >
                {MEAL_LABELS[meal]}
              </div>
              {WEEKDAYS.map((day) => {
                const cell = mealplan[day][meal];
                if (cell) {
                  return (
                    <DraggableMealplanCell
                      key={`${day}-${meal}`}
                      id={`${day}|${meal}`}
                      day={day}
                      meal={meal}
                      entry={cell}
                      onClick={() => {
                        if (cell.isRecipe) {
                          const recipe = allRecipes.find(
                            (r) => r.title === cell.title,
                          );
                          if (recipe) onSelectRecipe(recipe);
                        }
                      }}
                      onRemove={() => handleClear(day, meal)}
                      getRecipeImage={getRecipeImage}
                    />
                  );
                } else {
                  return (
                    <DroppableMealplanCell
                      key={`${day}-${meal}`}
                      id={`${day}|${meal}`}
                      onClick={() => setPickerTarget({ day, meal })}
                    />
                  );
                }
              })}
            </React.Fragment>
          ))}
        </div>

        {pickerTarget && (
          <RecipePicker
            onSelect={handleSelect}
            onClose={() => setPickerTarget(null)}
          />
        )}

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div
              className="mealplan-cell mealplan-cell-filled dragging"
              style={{ opacity: 1 }}
            >
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

  interface DraggableMealplanCellProps {
    id: string;
    day: Weekday;
    meal: MealType;
    entry: MealplanEntry;
    onClick: () => void;
    onRemove: () => void;
    getRecipeImage: (entry: MealplanEntry) => string;
  }
  function DraggableMealplanCell({
    id,
    day,
    meal,
    entry,
    onClick,
    onRemove,
    getRecipeImage,
  }: DraggableMealplanCellProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id,
      data: { day, meal, entry },
    });
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        className={`mealplan-cell mealplan-cell-filled${isDragging ? " dragging" : ""}`}
        onClick={onClick}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <button
          className="mealplan-remove-btn"
          aria-label="Remove entry"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          tabIndex={0}
        >
          <i className="bi bi-x-circle-fill mealplan-remove-icon"></i>
        </button>
        {/* Draggable part */}
        <span {...listeners} className="mealplan-cell-content">
          <MealplanCellContent entry={entry} getRecipeImage={getRecipeImage} />
        </span>
      </div>
    );
  }

  interface DroppableMealplanCellProps {
    id: string;
    onClick: () => void;
  }
  function DroppableMealplanCell({ id, onClick }: DroppableMealplanCellProps) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={`mealplan-cell${isOver ? " mealplan-cell-drag-over" : ""}`}
        onClick={onClick}
      >
        <span className="mealplan-plus-icon">+</span>
      </div>
    );
  }

  interface MealplanCellContentProps {
    entry: MealplanEntry;
    getRecipeImage: (entry: MealplanEntry) => string;
  }
  function MealplanCellContent({
    entry,
    getRecipeImage,
  }: MealplanCellContentProps) {
    return entry.isRecipe ? (
      <>
        <img
          className="mealplan-cell-image"
          src={getRecipeImage(entry)}
          alt={entry.title}
        />
        <span className="mealplan-cell-text">{entry.title}</span>
      </>
    ) : (
      <div className="mealplan-cell-text">{entry.title}</div>
    );
  }
}

export default MealplanTab;
