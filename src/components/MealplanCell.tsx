import { memo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Recipe, MealplanEntry, MealType, Weekday } from "../types";

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

export { MealplanCellContent, MealplanGridCell };
