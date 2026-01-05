import { useMemo, useRef, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

export type LogEditorValue = {
  title: string;
  project: string;
  tagsText: string;
  body: string;
};

type LogEditorProps = {
  value: LogEditorValue;
  onChange: (next: LogEditorValue) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  draftStatus?: string;
  onClearDraft?: () => void;
};

type ViewMode = "edit" | "split" | "preview";

export default function LogEditor({
  value,
  onChange,
  onSave,
  onCancel,
  saveLabel,
  draftStatus,
  onClearDraft,
}: LogEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const markdownBody = useMemo(() => value.body || "_(empty)_", [value.body]);

  const setField = (field: keyof LogEditorValue, next: string) => {
    onChange({ ...value, [field]: next });
  };

  const applyWrap = (before: string, after: string, fallback = "") => {
    const el = bodyRef.current;
    if (!el) return;
    const updated = insertAtCursor(el, fallback, { before, after });
    onChange({ ...value, body: updated });
  };

  const applyInsert = (text: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const updated = insertAtCursor(el, text);
    onChange({ ...value, body: updated });
  };

  return (
    <div className="editor">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{saveLabel === "Save Log" ? "New Log Entry" : "Edit Log Entry"}</h2>
        <div className="toolbar">
          <button
            className={`button ${viewMode === "edit" ? "primary" : ""}`}
            type="button"
            onClick={() => setViewMode("edit")}
          >
            Edit
          </button>
          <button
            className={`button ${viewMode === "split" ? "primary" : ""}`}
            type="button"
            onClick={() => setViewMode("split")}
          >
            Split
          </button>
          <button
            className={`button ${viewMode === "preview" ? "primary" : ""}`}
            type="button"
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Title</span>
        <input
          className="input"
          value={value.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g., PX4 SITL, Lane following test"
        />
      </label>

      <div className="filters-row">
        <label style={{ display: "grid", gap: 6 }}>
          <span>Project (optional)</span>
          <input
            className="input"
            value={value.project}
            onChange={(e) => setField("project", e.target.value)}
            placeholder="e.g., Ackermann Autonomy"
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Tags (comma-separated)</span>
          <input
            className="input"
            value={value.tagsText}
            onChange={(e) => setField("tagsText", e.target.value)}
            placeholder="ros2, px4, control"
          />
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Notes</span>
        <div className="toolbar">
          <button className="button" type="button" onClick={() => applyInsert("\n# ")}>H1</button>
          <button className="button" type="button" onClick={() => applyInsert("\n## ")}>H2</button>
          <button className="button" type="button" onClick={() => applyWrap("**", "**", "bold")}>Bold</button>
          <button className="button" type="button" onClick={() => applyWrap("*", "*", "italic")}>Italic</button>
          <button
            className="button"
            type="button"
            onClick={() => applyWrap("[", "](url)", "link text")}
          >
            Link
          </button>
          <button className="button" type="button" onClick={() => applyWrap("`", "`", "code")}>
            Inline Code
          </button>
          <button
            className="button"
            type="button"
            onClick={() => applyWrap("\n```cpp\n", "\n```\n")}
          >
            Code Block (cpp)
          </button>
          <button
            className="button"
            type="button"
            onClick={() => applyWrap("\n```python\n", "\n```\n")}
          >
            Code Block (python)
          </button>
          <button
            className="button"
            type="button"
            onClick={() =>
              applyInsert(
                "\n```xml\n<robot name=\"nou-robot\">\n  <link name=\"base_link\"/>\n</robot>\n```\n"
              )
            }
          >
            URDF snippet
          </button>
          <button className="button" type="button" onClick={() => applyInsert("\n- [ ] ")}>
            Checklist
          </button>
        </div>
      </label>

      <div className={`editor-panels ${viewMode === "split" ? "split" : ""}`}>
        {(viewMode === "edit" || viewMode === "split") && (
          <textarea
            ref={bodyRef}
            className="textarea"
            value={value.body}
            onChange={(e) => setField("body", e.target.value)}
            placeholder="Hypothesis, setup, parameters, results, next steps..."
            rows={10}
          />
        )}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="editor-preview">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Preview</div>
            <MarkdownRenderer markdown={markdownBody} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="button" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="button" onClick={onSave}>
          {saveLabel}
        </button>
        {onClearDraft && (
          <button className="button ghost" type="button" onClick={onClearDraft}>
            Clear draft
          </button>
        )}
        {draftStatus && <span className="muted">{draftStatus}</span>}
      </div>
    </div>
  );
}

function insertAtCursor(
  el: HTMLTextAreaElement,
  insertText: string,
  wrapSelection?: { before: string; after: string }
) {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const value = el.value;
  const selected = value.slice(start, end);

  let newValue = value;
  let cursorPos = start + insertText.length;

  if (wrapSelection) {
    const wrapped = `${wrapSelection.before}${selected || insertText}${wrapSelection.after}`;
    newValue = value.slice(0, start) + wrapped + value.slice(end);
    cursorPos = start + wrapSelection.before.length + (selected || insertText).length + wrapSelection.after.length;
  } else {
    newValue = value.slice(0, start) + insertText + value.slice(end);
  }

  el.value = newValue;
  el.focus();
  el.setSelectionRange(cursorPos, cursorPos);
  return newValue;
}
