import { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Ingredient, Recipe } from "../types";
import { useRecipes, createRecipe, updateRecipe } from "../lib/recipes";
import images, { cropToSquare } from "../lib/images";
import Badge from "./Badge";
import SuggestInput from "./SuggestInput";
import SortableRow from "./SortableRow";

interface RecipeDialogProps {
  recipe?: Recipe; // given: edit this recipe, otherwise create a new one
  onSaved: (recipe: Recipe) => void;
  onClose: () => void;
}

type IngredientDraft = {
  id: string; // stable key for drag-and-drop
  amount: string;
  unit: string;
  name: string;
};

let nextId = 0;
const toDraft = (ing?: Ingredient): IngredientDraft => ({
  id: `ingredient-${nextId++}`,
  amount: ing?.amount?.toString().replace(".", ",") ?? "",
  unit: ing?.unit ?? "",
  name: ing?.name ?? "",
});
const OVEN_MODES = ["Ober- und Unterhitze", "Umluft"];

function toIngredient({ amount, unit, name }: IngredientDraft): Ingredient {
  const parsed = parseFloat(amount.replace(",", "."));
  return {
    amount: isNaN(parsed) ? null : parsed,
    unit: unit.trim() || null,
    name: name.trim(),
  };
}

function RecipeDialog({
  recipe: initial,
  onSaved,
  onClose,
}: RecipeDialogProps) {
  const recipes = useRecipes();
  const categories = [...new Set(recipes.map((r) => r.category))];
  const units = [
    ...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.unit))),
  ].filter((u): u is string => !!u);
  const oven0 = initial?.ovenInstructions;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [preptime, setPreptime] = useState(initial?.preptime?.toString() ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords ?? []);
  const [newKeyword, setNewKeyword] = useState("");
  const [ingredients, setIngredients] = useState(() =>
    initial?.ingredients.length
      ? initial.ingredients.map(toDraft)
      : [toDraft()],
  );
  const [steps, setSteps] = useState(
    initial?.instructions.length ? initial.instructions : [""],
  );
  const [oven, setOven] = useState(!!oven0);
  const [ovenTemp, setOvenTemp] = useState(
    oven0?.temperature.toString() ?? "200",
  );
  const [ovenMode, setOvenMode] = useState(oven0?.mode ?? OVEN_MODES[0]);
  const [ovenTime, setOvenTime] = useState(oven0?.time.toString() ?? "");
  const [image, setImage] = useState(""); // newly chosen photo (data URL)
  const preview = image || (initial?.image ? images[initial.image] : "");
  const [error, setError] = useState("");

  const allKeywords = [
    ...new Set([...recipes.flatMap((r) => r.keywords), ...keywords]),
  ];

  function toggleKeyword(keyword: string) {
    setKeywords((k) =>
      k.includes(keyword) ? k.filter((x) => x !== keyword) : [...k, keyword],
    );
  }

  function addKeyword() {
    const keyword = newKeyword.trim();
    if (keyword && !keywords.includes(keyword))
      setKeywords([...keywords, keyword]);
    setNewKeyword("");
  }

  function moveIngredient({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setIngredients((list) =>
      arrayMove(
        list,
        list.findIndex((ing) => ing.id === active.id),
        list.findIndex((ing) => ing.id === over.id),
      ),
    );
  }

  function updateIngredient(
    i: number,
    field: "amount" | "unit" | "name",
    value: string,
  ) {
    setIngredients((list) =>
      list.map((ing, j) => (j === i ? { ...ing, [field]: value } : ing)),
    );
  }

  async function handleSave() {
    if (!title.trim()) return setError("Bitte einen Namen eingeben");
    if (!category.trim()) return setError("Bitte eine Kategorie eingeben");

    const recipe: Recipe = {
      title: title.trim(),
      preptime: Number(preptime) || 0,
      category: category.trim(),
      keywords,
      ingredients: ingredients.filter((i) => i.name.trim()).map(toIngredient),
      instructions: steps.map((s) => s.trim()).filter(Boolean),
      ...(oven && {
        ovenInstructions: {
          temperature: Number(ovenTemp) || 0,
          mode: ovenMode,
          time: Number(ovenTime) || 0,
        },
      }),
      image: initial?.image ?? "",
    };

    try {
      onSaved(
        initial
          ? await updateRecipe(initial.title, recipe, image || undefined)
          : await createRecipe(recipe, image || undefined),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal recipe-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="wrapper">
          <div className="modal-header">
            <h3>{initial ? "Rezept bearbeiten" : "Neues Rezept"}</h3>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <input
            className="text-input"
            placeholder="Name"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="input-row">
            <SuggestInput
              placeholder="Kategorie"
              suggestions={categories}
              value={category}
              onChange={setCategory}
            />
            <input
              className="text-input"
              type="number"
              min={0}
              placeholder="Zubereitungszeit"
              value={preptime}
              onChange={(e) => setPreptime(e.target.value)}
            />
          </div>

          <div className="recipe-dialog-split">
            <div>
              <h4 className="form-heading">Schlagwörter</h4>
              <div className="badge-wrapper">
                {allKeywords.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`badge-toggle ${keywords.includes(k) ? "badge-toggle-active" : ""}`}
                    onClick={() => toggleKeyword(k)}
                  >
                    <Badge label={k} />
                  </button>
                ))}
                <input
                  className="text-input form-input-small"
                  placeholder="+ Neues Schlagwort"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                  onBlur={addKeyword}
                />
              </div>

              <h4 className="form-heading">Zutaten für 1 Portion</h4>
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={moveIngredient}
              >
                <SortableContext
                  items={ingredients}
                  strategy={verticalListSortingStrategy}
                >
                  {ingredients.map((ing, i) => (
                    <SortableRow
                      key={ing.id}
                      id={ing.id}
                      className="form-row form-row-ingredient"
                    >
                      <input
                        className="text-input"
                        placeholder="Menge"
                        inputMode="decimal"
                        value={ing.amount}
                        onChange={(e) =>
                          updateIngredient(i, "amount", e.target.value)
                        }
                      />
                      <SuggestInput
                        placeholder="Einheit"
                        suggestions={units}
                        value={ing.unit}
                        onChange={(unit) => updateIngredient(i, "unit", unit)}
                      />
                      <input
                        className="text-input"
                        placeholder="Zutat"
                        value={ing.name}
                        onChange={(e) =>
                          updateIngredient(i, "name", e.target.value)
                        }
                      />
                      <button
                        className="close-btn"
                        type="button"
                        onClick={() =>
                          setIngredients(ingredients.filter((_, j) => j !== i))
                        }
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
              <button
                className="close-btn form-add-btn form-add-btn-ingredient"
                type="button"
                onClick={() => setIngredients([...ingredients, toDraft()])}
              >
                <i className="bi bi-plus-lg"></i> Zutat
              </button>
            </div>
            <label className="image-tile">
              {preview ? (
                <img src={preview} alt="Vorschau" />
              ) : (
                <i className="bi bi-camera"></i>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setImage(await cropToSquare(file));
                }}
              />
            </label>
          </div>

          <h4 className="form-heading">Zubereitung</h4>
          {steps.map((step, i) => (
            <div key={i} className="form-row form-row-step">
              <span className="form-step-number">{i + 1}.</span>
              <input
                className="text-input"
                placeholder="Schritt"
                value={step}
                onChange={(e) =>
                  setSteps(steps.map((s, j) => (j === i ? e.target.value : s)))
                }
              />
              <button
                className="close-btn"
                type="button"
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ))}
          <button
            className="close-btn form-add-btn form-add-btn-step"
            type="button"
            onClick={() => setSteps([...steps, ""])}
          >
            <i className="bi bi-plus-lg"></i> Schritt
          </button>

          <label className="form-heading form-checkbox">
            <input
              type="checkbox"
              checked={oven}
              onChange={(e) => setOven(e.target.checked)}
            />
            Im Ofen backen
          </label>
          {oven && (
            <div className="input-row">
              <input
                className="text-input"
                type="number"
                placeholder="Temperatur"
                value={ovenTemp}
                onChange={(e) => setOvenTemp(e.target.value)}
              />
              <select
                className="text-input"
                value={ovenMode}
                onChange={(e) => setOvenMode(e.target.value)}
              >
                {OVEN_MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                className="text-input"
                type="number"
                placeholder="Backzeit"
                value={ovenTime}
                onChange={(e) => setOvenTime(e.target.value)}
              />
            </div>
          )}

          <div className="modal-buttons">
            {error && <span className="form-error">{error}</span>}
            <button className="text-button" onClick={onClose}>
              Abbrechen
            </button>
            <button
              className="text-button text-button-primary"
              onClick={handleSave}
            >
              {initial ? "Aktualisieren" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDialog;
