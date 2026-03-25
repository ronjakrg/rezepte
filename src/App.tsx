import { useState } from "react";
import RecipeTab from "./components/RecipeTab";
import MealplanTab from "./components/MealplanTab";
import type { Recipe } from "./types";
import "./css/App.css";

const tabs = ["Rezepte", "Woche 10"] as const;
type Tab = (typeof tabs)[number];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Rezepte");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div className="app">
      <nav className="tabs">
        {selectedRecipe ? (
          <button className="icon-btn" onClick={() => setSelectedRecipe(null)}>
            ←
          </button>
        ) : (
          <span className="icon-btn">
            <i className="bi bi-house-door-fill"></i>
          </span>
        )}
        <div className="tabs-line">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRecipe(null);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main>
        {activeTab === "Rezepte" && (
          <RecipeTab
            selectedRecipe={selectedRecipe}
            onSelectRecipe={setSelectedRecipe}
          />
        )}
        {activeTab === "Woche 10" && (
          <MealplanTab
            onSelectRecipe={(recipe) => {
              setSelectedRecipe(recipe);
              setActiveTab("Rezepte");
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
