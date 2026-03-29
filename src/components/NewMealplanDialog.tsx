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
  <div className="recipe-picker-overlay" onClick={onClose}>
    <div className="recipe-picker-modal" onClick={(e) => e.stopPropagation()}>
      <div className="wrapper">
        <div className="recipe-picker-header">
          Neuen Wochenplan erstellen
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="recipe-picker-note-row">
          <input
            className="text-input"
            type="text"
            placeholder="Name (z.B. Woche 11)"
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
