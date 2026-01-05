import { logToMarkdown } from "../lib/logMarkdown";
import { downloadTextFile, slugifyFilename } from "../lib/download";
import { useLogs } from "../lib/useLogs";
import { Link } from "react-router-dom";



export default function Dashboard() {
  const { logs, remove } = useLogs();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Dashboard</h2>

      {logs.length === 0 ? (
        <div style={{ opacity: 0.8 }}>
          No logs yet. Click <b>New Log</b> to create one.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                border: "1px solid #333",
                borderRadius: 14,
                padding: 14,
                background: "#242424",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
                <div>
                    <Link to={`/logs/${log.id}`} style={{ fontWeight: 700, color: "inherit", textDecoration: "none" }}>
                    {log.title}
                </Link>
                <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                  {new Date(log.createdAt).toLocaleString()}
                  {log.project ? ` · ${log.project}` : ""}
                </div>

                {log.tags.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {log.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid #444",
                          opacity: 0.9,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    const md = logToMarkdown(log);
                    const date = log.createdAt.slice(0, 10); // YYYY-MM-DD
                    const name = `${date}-${slugifyFilename(log.title)}.md`;
                    downloadTextFile(name, md);
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
                  Export
                </button>

                <button
                  onClick={() => {
                    const ok = confirm(`Delete "${log.title}"?`);
                    if (ok) remove(log.id);
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
