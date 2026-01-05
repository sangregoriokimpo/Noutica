import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLogs } from "../lib/useLogs";
import nouticaLogo from "../assets/nouticaLogo.png";


export default function AppLayout() {
  const { logs } = useLogs();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const pageTitle = useMemo(() => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/new") return "New Log";
    if (location.pathname.endsWith("/edit")) return "Edit Log";
    if (location.pathname === "/urdf") return "URDF Viewer";
    if (location.pathname.startsWith("/logs/")) return "Log Detail";
    return "Noutica";
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("noutica_theme");
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.body.dataset.theme = initial;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.dataset.theme = next;
    localStorage.setItem("noutica_theme", next);
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-title" onClick={() => setSidebarOpen(false)}>
            <span className="brand">
              <img src={nouticaLogo} alt="Noutica logo" className="brand-logo" />
              Noutica
            </span>
          </Link>
          <button
            className="button sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>
        </div>

        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/new"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            New Log
          </NavLink>

          <NavLink
            to="/urdf"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            URDF Viewer
          </NavLink>
        </nav>

        <div className="recent-logs">
          <div className="recent-logs-label">RECENT LOGS</div>

          <div className="recent-logs-list">
            {logs.slice(0, 10).map((log) => {
              const active = location.pathname === `/logs/${log.id}`;

              return (
                <NavLink
                  key={log.id}
                  to={`/logs/${log.id}`}
                  className={`recent-logs-item ${active ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="recent-logs-title" title={log.title}>
                    {log.title}
                  </div>
                  <div className="recent-logs-date">{log.createdAt.slice(0, 10)}</div>
                </NavLink>
              );
            })}

            {logs.length === 0 && <div className="muted">No logs yet.</div>}
          </div>
        </div>
      </aside>

      <div className="content">
        <header className="header">
          <div className="header-actions">
            <button
              className="button sidebar-toggle"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              Menu
            </button>
            <div className="header-title">{pageTitle}</div>
          </div>
          <div className="header-actions">
            <button className="button ghost" type="button" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link to="/new" className="button primary">
              + New log
            </Link>
          </div>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
