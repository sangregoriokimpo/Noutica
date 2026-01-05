import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { logToMarkdown } from "../lib/logMarkdown";
import { downloadTextFile, slugifyFilename } from "../lib/download";
import { useLogs } from "../lib/useLogs";
import { saveAllLogs, type LogEntry } from "../lib/logStorage";

export default function Dashboard() {
  const { logs, remove, refresh } = useLogs();
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [importStatus, setImportStatus] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const projectOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.project).filter(Boolean))) as string[],
    [logs]
  );

  const tagOptions = useMemo(
    () => Array.from(new Set(logs.flatMap((log) => log.tags))).sort(),
    [logs]
  );

  const parsedTagFilters = useMemo(
    () =>
      tagsFilter
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsFilter]
  );

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (projectFilter && log.project !== projectFilter) return false;
      if (parsedTagFilters.length && !parsedTagFilters.every((tag) => log.tags.includes(tag))) return false;
      if (startDate && log.createdAt.slice(0, 10) < startDate) return false;
      if (endDate && log.createdAt.slice(0, 10) > endDate) return false;
      if (!q) return true;
      const haystack = [log.title, log.project, log.body, log.tags.join(" ")].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, query, projectFilter, parsedTagFilters, startDate, endDate]);

  const clearFilters = () => {
    setQuery("");
    setProjectFilter("");
    setTagsFilter("");
    setStartDate("");
    setEndDate("");
  };

  const exportAllMarkdown = () => {
    const combined = logs.map((log) => logToMarkdown(log)).join("\n\n---\n\n");
    downloadTextFile("noutica-export.md", combined, "text/markdown;charset=utf-8");
  };

  const exportAllJson = () => {
    downloadTextFile("noutica-export.json", JSON.stringify(logs, null, 2), "application/json");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const normalized = normalizeImportedLogs(parsed);
        const merged = mergeLogs(logs, normalized);
        saveAllLogs(merged);
        refresh();
        setImportStatus(`Imported ${normalized.length} log(s).`);
      } catch (error) {
        setImportStatus("Import failed. Use the JSON export format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="filters card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>Search & Filters</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="button" type="button" onClick={exportAllMarkdown}>
              Export all (MD)
            </button>
            <button className="button" type="button" onClick={exportAllJson}>
              Export all (JSON)
            </button>
            <button className="button ghost" type="button" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>

        <div className="filters-row">
          <label style={{ display: "grid", gap: 6 }}>
            <span>Search</span>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, project, notes, tags..."
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Project</span>
            <select
              className="select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All projects</option>
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Tags (comma-separated)</span>
            <input
              className="input"
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              placeholder={tagOptions.slice(0, 5).join(", ")}
            />
          </label>
        </div>

        <div className="filters-row">
          <label style={{ display: "grid", gap: 6 }}>
            <span>Start date</span>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>End date</span>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button className="button ghost" type="button" onClick={clearFilters}>
              Clear filters
            </button>
            <div className="muted">{filteredLogs.length} result(s)</div>
          </div>
        </div>
        {importStatus && <div className="muted">{importStatus}</div>}
      </div>

      {logs.length === 0 ? (
        <div className="muted">No logs yet. Click New Log to create one.</div>
      ) : filteredLogs.length === 0 ? (
        <div className="muted">No logs match the current filters.</div>
      ) : (
        <div className="list">
          {filteredLogs.map((log) => (
            <div key={log.id} className="card list-item">
              <div>
                <Link to={`/logs/${log.id}`} style={{ fontWeight: 700, textDecoration: "none" }}>
                  {log.title}
                </Link>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  {new Date(log.createdAt).toLocaleString()}
                  {log.project ? ` · ${log.project}` : ""}
                </div>

                {log.tags.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {log.tags.map((t) => (
                      <span key={t} className="tag-pill">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="button ghost" to={`/logs/${log.id}/edit`}>
                  Edit
                </Link>
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    const md = logToMarkdown(log);
                    const date = log.createdAt.slice(0, 10);
                    const name = `${date}-${slugifyFilename(log.title)}.md`;
                    downloadTextFile(name, md, "text/markdown;charset=utf-8");
                  }}
                >
                  Export
                </button>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => {
                    const ok = confirm(`Delete "${log.title}"?`);
                    if (ok) remove(log.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeImportedLogs(raw: unknown): LogEntry[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const data = entry as Partial<LogEntry> & { tags?: string[] };
      if (!data.title || typeof data.title !== "string") return null;
      return {
        id: typeof data.id === "string" && data.id.trim() ? data.id : randomId(),
        title: data.title.trim(),
        project: typeof data.project === "string" ? data.project : undefined,
        tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
        body: typeof data.body === "string" ? data.body : "",
        createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
      } satisfies LogEntry;
    })
    .filter(Boolean) as LogEntry[];
}

function mergeLogs(existing: LogEntry[], imported: LogEntry[]) {
  const map = new Map<string, LogEntry>();
  for (const log of existing) map.set(log.id, log);
  for (const log of imported) map.set(log.id, log);
  return Array.from(map.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
}
