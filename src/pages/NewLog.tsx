import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogs } from "../lib/useLogs";
import LogEditor, { type LogEditorValue } from "../components/LogEditor";

const DRAFT_KEY = "lab_notebook_draft_v1";

type DraftPayload = LogEditorValue & { savedAt?: string };

export default function NewLog() {
  const { create } = useLogs();
  const nav = useNavigate();
  const [draftStatus, setDraftStatus] = useState<string | undefined>(undefined);
  const [value, setValue] = useState<LogEditorValue>({
    title: "",
    project: "",
    tagsText: "",
    body: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as DraftPayload;
      setValue({
        title: parsed.title || "",
        project: parsed.project || "",
        tagsText: parsed.tagsText || "",
        body: parsed.body || "",
      });
      if (parsed.savedAt) {
        setDraftStatus(`Draft loaded (${new Date(parsed.savedAt).toLocaleTimeString()}).`);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const payload: DraftPayload = {
        ...value,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftStatus(`Draft saved (${new Date().toLocaleTimeString()}).`);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [value]);

  const parsedTags = useMemo(
    () =>
      value.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [value.tagsText]
  );

  const handleSave = () => {
    if (!value.title.trim()) {
      alert("Title is required.");
      return;
    }
    create({
      title: value.title.trim(),
      project: value.project.trim() || undefined,
      tags: parsedTags,
      body: value.body.trim(),
    });
    localStorage.removeItem(DRAFT_KEY);
    nav("/");
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftStatus("Draft cleared.");
  };

  return (
    <LogEditor
      value={value}
      onChange={setValue}
      onSave={handleSave}
      onCancel={() => nav("/")}
      saveLabel="Save Log"
      draftStatus={draftStatus}
      onClearDraft={handleClearDraft}
    />
  );
}
