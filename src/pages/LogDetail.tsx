import { useNavigate, useParams, Link } from "react-router-dom";
import { getLog, deleteLog } from "../lib/logStorage";
import { logToMarkdown } from "../lib/logMarkdown";
import { downloadTextFile, slugifyFilename } from "../lib/download";
import MarkdownRenderer from "../components/MarkdownRenderer";
import UrdfCanvas from "../components/UrdfCanvas";
import { useMemo, useState } from "react";


export default function LogDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const log = id ? getLog(id) : undefined;
  const [urdfStatus, setUrdfStatus] = useState<string | undefined>(undefined);
  const urdfText = useMemo(() => (log?.body ? extractUrdf(log.body) : null), [log?.body]);
  const attachments = log?.attachments ?? [];

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

  return (
    <div className="editor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>{log.title}</h2>
          <div className="muted" style={{ marginTop: 6 }}>
            {new Date(log.createdAt).toLocaleString()}
            {log.project ? ` · ${log.project}` : ""}
          </div>
          {log.tags.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {log.tags.map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
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
              if (!ok) return;
              deleteLog(log.id);
              nav("/");
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Notes (Markdown)</div>
        <MarkdownRenderer markdown={log.body || "_(empty)_"} />
      </div>

      {attachments.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Attachments</div>
          <div style={{ display: "grid", gap: 10 }}>
            {attachments.map((item) => (
              <div
                key={item.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(item.type || "").startsWith("image/") && (
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {formatBytes(item.size)} · {item.type || "unknown"}
                    </div>
                  </div>
                </div>
                <a className="button ghost" href={item.dataUrl} download={item.name}>
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {urdfText && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>URDF Preview</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {urdfStatus && <span className="muted">{urdfStatus}</span>}
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  sessionStorage.setItem("urdf_viewer_seed_v1", urdfText);
                  nav("/urdf");
                }}
              >
                Open in URDF Viewer
              </button>
            </div>
          </div>
          <UrdfCanvas urdfText={urdfText} onStatus={setUrdfStatus} minHeight={320} />
        </div>
      )}

      <button className="button" type="button" onClick={() => nav("/")}>
        Back to Dashboard
      </button>
    </div>
  );
}

function extractUrdf(markdown: string): string | null {
  const fenced = /```(?:xml|urdf)?\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = fenced.exec(markdown))) {
    const block = match[1].trim();
    if (block.includes("<robot")) {
      return block;
    }
  }

  const inlineMatch = markdown.match(/<robot[\s\S]*?<\/robot>/i);
  return inlineMatch ? inlineMatch[0].trim() : null;
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
