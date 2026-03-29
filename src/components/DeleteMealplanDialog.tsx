import React from "react";
import type { MealplanMeta } from "../lib/mealplan";

interface DeleteMealplanDialogProps {
  plan: MealplanMeta;
  onDelete: (plan: MealplanMeta) => void;
  onClose: () => void;
}

const DeleteMealplanDialog: React.FC<DeleteMealplanDialogProps> = ({
  plan,
  onDelete,
  onClose,
}) => (
  <div className="recipe-picker-overlay" onClick={onClose}>
    <div className="recipe-picker-modal" onClick={(e) => e.stopPropagation()}>
      <div className="wrapper">
        <div className="recipe-picker-header">
          „{plan.displayName}" löschen?
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="recipe-picker-note-row">
          <button className="arrow-btn" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="arrow-btn"
            style={{
              background: "var(--color-danger, #e53e3e)",
              color: "#fff",
            }}
            onClick={() => onDelete(plan)}
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteMealplanDialog;
