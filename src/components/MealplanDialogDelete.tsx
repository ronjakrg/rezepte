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
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal mealplan-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="wrapper">
        <div className="modal-header">
          "{plan.displayName}" wirklich löschen?
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-buttons">
          <button className="text-button" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="text-button text-button-red"
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
