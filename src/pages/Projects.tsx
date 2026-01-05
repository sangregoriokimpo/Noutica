import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogs } from "../lib/useLogs";

type ProjectSummary = {
  name: string;
  count: number;
  latest: string;
  tags: string[];
  logs: { id: string; title: string; createdAt: string }[];
};

export default function Projects() {
  const { logs } = useLogs();

  const projects = useMemo<ProjectSummary[]>(() => {
    const map = new Map<string, ProjectSummary>();
    for (const log of logs) {
      const name = log.project?.trim() || "Unassigned";
      const existing = map.get(name) || {
        name,
        count: 0,
        latest: log.createdAt,
        tags: [],
        logs: [],
      };

      existing.count += 1;
      if (log.createdAt > existing.latest) {
        existing.latest = log.createdAt;
      }
      existing.logs.push({ id: log.id, title: log.title, createdAt: log.createdAt });
      existing.tags = Array.from(new Set([...existing.tags, ...log.tags]));
      map.set(name, existing);
    }

    return Array.from(map.values())
      .map((project) => ({
        ...project,
        logs: project.logs.slice(0, 5),
        tags: project.tags.slice(0, 8),
      }))
      .sort((a, b) => (a.latest < b.latest ? 1 : -1));
  }, [logs]);

  if (projects.length === 0) {
    return <div className="muted">No logs yet. Create a log to populate projects.</div>;
  }

  return (
    <div className="list">
      {projects.map((project) => (
        <div key={project.name} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{project.name}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {project.count} log(s) · Updated {new Date(project.latest).toLocaleString()}
              </div>
            </div>
          </div>

          {project.tags.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {project.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            {project.logs.map((log) => (
              <Link key={log.id} to={`/logs/${log.id}`} className="nav-link">
                <div style={{ fontWeight: 600 }}>{log.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
