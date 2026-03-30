import { useState, useEffect } from "react";
import RecipeTab from "./components/RecipeTab";
import MealplanTab from "./components/MealplanTab";
import NewMealplanDialog from "./components/MealplanDialogCreate";
import DeleteMealplanDialog from "./components/MealplanDialogDelete";
import type { Recipe } from "./types";
import {
  fetchMealplanList,
  createMealplan,
  deleteMealplan,
  type MealplanMeta,
} from "./lib/mealplan";
import "./css/App.css";

function App() {
  const [mealplans, setMealplans] = useState<MealplanMeta[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeTab") || "Rezepte";
  });
  const [activeMealplan, setActiveMealplan] = useState<MealplanMeta | null>(
    null,
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState<MealplanMeta | null>(null);

  useEffect(() => {
    fetchMealplanList()
      .then((list) => {
        setMealplans(list);
        const savedTab = localStorage.getItem("activeTab");
        if (savedTab === "Rezepte") {
          setActiveMealplan(null);
          setActiveTab("Rezepte");
        } else if (list.length > 0) {
          const found = list.find((p) => p.name === savedTab);
          if (found) {
            setActiveMealplan(found);
            setActiveTab(found.name);
          } else {
            setActiveMealplan(list[0]);
            setActiveTab(list[0].name);
          }
        }
      })
      .catch(console.error);
  }, []);

  function handleSelectMealplanTab(plan: MealplanMeta) {
    setActiveMealplan(plan);
    setActiveTab(plan.name);
    localStorage.setItem("activeTab", plan.name);
    setSelectedRecipe(null);
  }

  async function handleCreateMealplan() {
    if (!newName.trim()) return;
    try {
      const created = await createMealplan(newName.trim());
      const updated = [...mealplans, created];
      setMealplans(updated);
      setActiveMealplan(created);
      setActiveTab(created.name);
      setNewName("");
      setShowNewDialog(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteMealplan(plan: MealplanMeta) {
    try {
      await deleteMealplan(plan.name);
      const updated = mealplans.filter((p) => p.name !== plan.name);
      setMealplans(updated);
      // Switch away if we deleted the active tab
      if (activeMealplan?.name === plan.name) {
        if (updated.length > 0) {
          setActiveMealplan(updated[0]);
          setActiveTab(updated[0].name);
        } else {
          setActiveMealplan(null);
          setActiveTab("Rezepte");
        }
      }
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="app">
      <nav className="tabs">
        {selectedRecipe ? (
          <button className="icon-btn" onClick={() => setSelectedRecipe(null)}>
            <i className="bi bi-arrow-left"></i>
          </button>
        ) : (
          <button
            className="icon-btn"
            onClick={() => {
              setActiveTab("Rezepte");
              localStorage.setItem("activeTab", "Rezepte");
              setSelectedRecipe(null);
            }}
          >
            <i className="bi bi-house-door-fill"></i>
          </button>
        )}
        <div className="tabs-line">
          <button
            className={`tab ${activeTab === "Rezepte" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("Rezepte");
              localStorage.setItem("activeTab", "Rezepte");
              setSelectedRecipe(null);
            }}
          >
            Rezepte
          </button>
          {mealplans.map((plan) => (
            <button
              key={plan.name}
              className={`tab ${activeTab === plan.name ? "tab-active" : ""}`}
              onClick={() => handleSelectMealplanTab(plan)}
            >
              {plan.displayName}
              <span
                role="button"
                style={{ marginLeft: "0.25rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(plan);
                }}
              >
                <i className="bi bi-x"></i>
              </span>
            </button>
          ))}
          <button className="icon-btn" onClick={() => setShowNewDialog(true)}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </nav>

      <main>
        {activeTab === "Rezepte" && (
          <RecipeTab
            selectedRecipe={selectedRecipe}
            onSelectRecipe={setSelectedRecipe}
          />
        )}
        {activeMealplan && activeTab === activeMealplan.name && (
          <MealplanTab
            name={activeMealplan.name}
            onSelectRecipe={(recipe) => {
              setSelectedRecipe(recipe);
              setActiveTab("Rezepte");
            }}
          />
        )}
      </main>
      {showNewDialog && (
        <NewMealplanDialog
          newName={newName}
          setNewName={setNewName}
          onCreate={handleCreateMealplan}
          onClose={() => setShowNewDialog(false)}
        />
      )}
      {showDeleteConfirm && (
        <DeleteMealplanDialog
          plan={showDeleteConfirm}
          onDelete={handleDeleteMealplan}
          onClose={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

export default App;
