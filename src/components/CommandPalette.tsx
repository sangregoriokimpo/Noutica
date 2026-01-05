import { useEffect, useMemo, useRef, useState } from "react";

export type Command = {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  commands: Command[];
};

export default function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleRun = (cmd: Command) => {
    cmd.action();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="palette-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => Math.max(prev - 1, 0));
            }
            if (e.key === "Enter" && filtered[activeIndex]) handleRun(filtered[activeIndex]);
          }}
        />
        <div className="palette-list">
          {filtered.map((cmd, index) => (
            <button
              key={cmd.id}
              className={`palette-item ${index === activeIndex ? "active" : ""}`}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => handleRun(cmd)}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && <span className="muted">{cmd.shortcut}</span>}
            </button>
          ))}
          {filtered.length === 0 && <div className="muted">No matching commands.</div>}
        </div>
      </div>
    </div>
  );
}
