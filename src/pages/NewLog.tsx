import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogs } from "../lib/useLogs";


export default function NewLog() {
  const { create } = useLogs();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [body, setBody] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);


  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <h2 style={{ margin: 0 }}>New Log Entry</h2>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., PX4 SITL, Lane following test"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#1f1f1f", color: "inherit" }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Project (optional)</span>
        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="e.g., Ackermann Autonomy"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#1f1f1f", color: "inherit" }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Tags (comma-separated)</span>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="ros2, px4, control"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#1f1f1f", color: "inherit" }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Notes</span>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
            type="button"
            onClick={() => {
                const el = bodyRef.current;
                if (!el) return;
                const md = insertAtCursor(el, "", {
                before: "\n```cpp\n",
                after: "\n```\n",
                });
                setBody(md);
            }}
            style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
            }}
            >
            + Code Block (cpp)
            </button>

            <button
            type="button"
            onClick={() => {
                const el = bodyRef.current;
                if (!el) return;
                const md = insertAtCursor(el, "", {
                before: "\n```python\n",
                after: "\n```\n",
                });
                setBody(md);
            }}
            style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
            }}
            >
            + Code Block (python)
            </button>
        </div>

        <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hypothesis, setup, parameters, results, next steps..."
            rows={8}
            style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #444",
            background: "#1f1f1f",
            color: "inherit",
            }}
        />
        </label>


      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => nav("/")}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #444", background: "transparent", color: "inherit", cursor: "pointer" }}
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (!title.trim()) {
              alert("Title is required.");
              return;
            }
            create({
              title: title.trim(),
              project: project.trim() || undefined,
              tags: tagsText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              body: body.trim(),
            });
            nav("/");
          }}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #444", background: "#2a2a2a", color: "inherit", cursor: "pointer" }}
        >
          Save Log
        </button>
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
    const wrapped = `${wrapSelection.before}${selected}${wrapSelection.after}`;
    newValue = value.slice(0, start) + wrapped + value.slice(end);
    cursorPos = start + wrapSelection.before.length + selected.length + wrapSelection.after.length;
  } else {
    newValue = value.slice(0, start) + insertText + value.slice(end);
  }

  el.value = newValue;
  el.focus();
  el.setSelectionRange(cursorPos, cursorPos);
  return newValue;
}

