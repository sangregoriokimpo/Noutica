import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LogEditor, { type LogEditorValue } from "../components/LogEditor";
import { getLog, updateLog } from "../lib/logStorage";

export default function EditLog() {
  const { id } = useParams();
  const nav = useNavigate();
  const log = id ? getLog(id) : undefined;

  const initialValue = useMemo<LogEditorValue>(() => {
    if (!log) {
      return { title: "", project: "", tagsText: "", body: "" };
    }
    return {
      title: log.title,
      project: log.project ?? "",
      tagsText: log.tags.join(", "),
      body: log.body,
    };
  }, [log]);

  const [value, setValue] = useState<LogEditorValue>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!log) {
    return (
      <div className="editor">
        <h2 style={{ margin: 0 }}>Log not found</h2>
        <button className="button" type="button" onClick={() => nav("/")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (!value.title.trim()) {
      alert("Title is required.");
      return;
    }
    updateLog(log.id, {
      title: value.title.trim(),
      project: value.project.trim() || undefined,
      tags: value.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      body: value.body.trim(),
    });
    nav(`/logs/${log.id}`);
  };

  return (
    <LogEditor
      value={value}
      onChange={setValue}
      onSave={handleSave}
      onCancel={() => nav(`/logs/${log.id}`)}
      saveLabel="Save Changes"
    />
  );
}
