import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLogs } from "../lib/useLogs";
import nouticaLogo from "../assets/nouticaLogo.png";
import CommandPalette, { type Command } from "./CommandPalette";


export default function AppLayout() {
  const { logs } = useLogs();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const nav = useNavigate();

  const pageTitle = useMemo(() => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/new") return "New Log";
    if (location.pathname === "/projects") return "Projects";
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (!isTypingField && event.key === "/") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      { id: "new-log", label: "New log", shortcut: "N", action: () => nav("/new") },
      { id: "dashboard", label: "Go to dashboard", shortcut: "D", action: () => nav("/") },
      { id: "projects", label: "Go to projects", shortcut: "P", action: () => nav("/projects") },
      { id: "urdf", label: "Open URDF viewer", shortcut: "U", action: () => nav("/urdf") },
      { id: "toggle-theme", label: `Switch to ${theme === "dark" ? "light" : "dark"} mode`, action: toggleTheme },
    ],
    [nav, theme, toggleTheme]
  );

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
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            Projects
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
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  );
}
