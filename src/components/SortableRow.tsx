import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRowProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

// Row inside a <SortableContext>, reorderable by dragging its grip icon
function SortableRow({ id, className = "", children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className}${isDragging ? " form-row-dragging" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <span className="form-drag-handle" {...attributes} {...listeners}>
        <i className="bi bi-grip-vertical"></i>
      </span>
      {children}
    </div>
  );
}

export default SortableRow;
