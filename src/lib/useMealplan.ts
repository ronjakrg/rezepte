import { useState, useEffect, useCallback } from "react";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type {
  WeeklyMealplan,
  MealplanEntry,
  MealType,
  Weekday,
} from "../types";
import {
  createEmptyMealplan,
  fetchMealplan,
  saveMealplan,
} from "../lib/mealplan";

export function useMealplan(name: string) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

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

  return {
    sensors,
    mealplan,
    pickerTarget,
    activeDrag,
    handleOpen,
    handleRemove,
    handleSelect,
    handleDragStart,
    handleDragEnd,
    closePickerTarget: () => setPickerTarget(null),
  };
}
