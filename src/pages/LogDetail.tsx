import { Link, useNavigate, useParams } from "react-router-dom";
import { getLog, deleteLog } from "../lib/logStorage";
import { logToMarkdown } from "../lib/logMarkdown";
import { downloadTextFile, slugifyFilename } from "../lib/download";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";


export default function LogDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const log = id ? getLog(id) : undefined;

  if (!log) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Log not found</h2>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{log.title}</h2>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            {new Date(log.createdAt).toLocaleString()}
            {log.project ? ` · ${log.project}` : ""}
          </div>
          {log.tags.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
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

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <button
            onClick={() => {
              const md = logToMarkdown(log);
              const date = log.createdAt.slice(0, 10);
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
              if (!ok) return;
              deleteLog(log.id);
              nav("/");
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

      <div
        style={{
          border: "1px solid #333",
          borderRadius: 14,
          padding: 14,
          background: "#242424",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Notes (Markdown)</div>
            <div style={{ lineHeight: 1.6 }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code({ inline, className, children, ...props }: any) {
                        // fenced code blocks (```lang) -> let highlight.js handle styling
                        if (!inline) {
                        return (
                            <code className={className} {...props}>
                            {children}
                            </code>
                        );
                        }

                        // inline code -> pill style
                        return (
                        <code
                            style={{
                            background: "#1b1b1b",
                            padding: "2px 6px",
                            borderRadius: 6,
                            }}
                            {...props}
                        >
                            {children}
                        </code>
                        );
                    },
                    pre({ children }) {
                        return (
                        <pre
                            style={{
                            background: "#1b1b1b",
                            padding: 12,
                            borderRadius: 12,
                            overflowX: "auto",
                            }}
                        >
                            {children}
                        </pre>
                        );
                    },
                    }}

            >
                {log.body || "_(empty)_"}
            </ReactMarkdown>
            </div>

      </div>

      <Link to="/">← Back to Dashboard</Link>
    </div>
  );
}
