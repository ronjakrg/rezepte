import React from "react";

interface NewMealplanDialogProps {
  newName: string;
  setNewName: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

const NewMealplanDialog: React.FC<NewMealplanDialogProps> = ({
  newName,
  setNewName,
  onCreate,
  onClose,
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal mealplan-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="wrapper">
        <div className="modal-header">
          Neuen Mealplan erstellen
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="input-row">
          <input
            className="text-input"
            type="text"
            placeholder="Name des Mealplans ..."
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreate();
            }}
          />
          <button className="arrow-btn" type="button" onClick={onCreate}>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default NewMealplanDialog;
