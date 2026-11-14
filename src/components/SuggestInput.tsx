import { useState } from "react";

interface SuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

// Text input with a styleable suggestion list (replacement for <datalist>)
function SuggestInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: SuggestInputProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const query = value.trim().toLowerCase();
  const matches = suggestions.filter(
    (s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query,
  );

  function select(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + matches.length) % matches.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="suggest">
      <input
        className="text-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {open && matches.length > 0 && (
        <ul className="suggest-list">
          {matches.map((s, i) => (
            <li
              key={s}
              className={i === active ? "suggest-active" : ""}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                select(s);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SuggestInput;
