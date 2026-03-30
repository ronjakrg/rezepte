import { useState, useEffect, useCallback, memo } from "react";
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

interface MealplanCellContentProps {
  entry: MealplanEntry;
  getRecipeImage: (entry: MealplanEntry) => string;
}

const MealplanCellContent = memo(function MealplanCellContent({
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
});

interface DraggableMealplanCellProps {
  id: string;
  day: Weekday;
  meal: MealType;
  entry: MealplanEntry;
  onClick: () => void;
  onRemove: () => void;
  getRecipeImage: (entry: MealplanEntry) => string;
}

const DraggableMealplanCell = memo(function DraggableMealplanCell({
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
        <i className="bi bi-x-circle-fill mealplan-remove-icon" />
      </button>
      <span {...listeners} className="mealplan-cell-content">
        <MealplanCellContent entry={entry} getRecipeImage={getRecipeImage} />
      </span>
    </div>
  );
});

interface DroppableMealplanCellProps {
  id: string;
  onClick: () => void;
}

const DroppableMealplanCell = memo(function DroppableMealplanCell({
  id,
  onClick,
}: DroppableMealplanCellProps) {
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
});

interface MealplanGridCellProps {
  day: Weekday;
  meal: MealType;
  entry: MealplanEntry | null;
  onOpen: (day: Weekday, meal: MealType) => void;
  onRemove: (day: Weekday, meal: MealType) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  getRecipeImage: (entry: MealplanEntry) => string;
  allRecipes: Recipe[];
}

const MealplanGridCell = memo(function MealplanGridCell({
  day,
  meal,
  entry,
  onOpen,
  onRemove,
  onSelectRecipe,
  getRecipeImage,
  allRecipes,
}: MealplanGridCellProps) {
  const id = `${day}|${meal}`;

  if (entry) {
    return (
      <DraggableMealplanCell
        id={id}
        day={day}
        meal={meal}
        entry={entry}
        onClick={() => {
          if (entry.isRecipe) {
            const recipe = allRecipes.find((r) => r.title === entry.title);
            if (recipe) onSelectRecipe(recipe);
          }
        }}
        onRemove={() => onRemove(day, meal)}
        getRecipeImage={getRecipeImage}
      />
    );
  }

  return <DroppableMealplanCell id={id} onClick={() => onOpen(day, meal)} />;
});

interface MealplanTabProps {
  name: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

function MealplanTab({ name, onSelectRecipe }: MealplanTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const allRecipes = useRecipes();
  const [mealplan, setMealplan] = useState<WeeklyMealplan>(createEmptyMealplan);
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

  const getRecipeImage = useCallback(
    (tile: MealplanEntry): string => {
      if (!tile?.isRecipe) return images["null"];
      const recipe = allRecipes.find((r) => r.title === tile.title);
      return images[recipe?.image ?? "null"];
    },
    [allRecipes],
  );

  const handleOpen = useCallback((day: Weekday, meal: MealType) => {
    setPickerTarget({ day, meal });
  }, []);

  const handleRemove = useCallback(
    (day: Weekday, meal: MealType) => {
      setMealplan((prev) => {
        const updated = {
          ...prev,
          [day]: { ...prev[day], [meal]: null },
        };
        saveMealplan(name, updated).catch(console.error);
        return updated;
      });
    },
    [name],
  );

  const handleSelect = useCallback(
    (entry: MealplanEntry) => {
      if (!pickerTarget) return;
      const { day, meal } = pickerTarget;
      setMealplan((prev) => {
        const updated = {
          ...prev,
          [day]: {
            ...prev[day],
            [meal]: { title: entry.title, isRecipe: entry.isRecipe },
          },
        };
        saveMealplan(name, updated).catch(console.error);
        return updated;
      });
      setPickerTarget(null);
    },
    [pickerTarget, name],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const current = event.active.data.current;
    if (
      current &&
      "day" in current &&
      "meal" in current &&
      "entry" in current
    ) {
      setActiveDrag(
        current as { day: Weekday; meal: MealType; entry: MealplanEntry },
      );
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      const dragData = active.data.current as
        | { day: Weekday; meal: MealType; entry: MealplanEntry }
        | undefined;
      if (over && dragData) {
        const [targetDay, targetMeal] = (over.id as string).split("|") as [
          Weekday,
          MealType,
        ];
        setMealplan((prev) => {
          if (prev[targetDay][targetMeal]) return prev;
          const updated = {
            ...prev,
            [targetDay]: {
              ...prev[targetDay],
              [targetMeal]: { ...dragData.entry },
            },
          };
          saveMealplan(name, updated).catch(console.error);
          return updated;
        });
      }
      setActiveDrag(null);
    },
    [name],
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
          <RecipePicker
            onSelect={handleSelect}
            onClose={() => setPickerTarget(null)}
          />
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
