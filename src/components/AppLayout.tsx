import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLogs } from "../lib/useLogs";


export default function AppLayout() {
    const { logs } = useLogs();
    const location = useLocation();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #333", padding: 16 }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Lab Notebook</div>
        </Link>

        <nav style={{ display: "grid", gap: 8 }}>
          <NavLink to="/" end style={({ isActive }) => ({
            padding: "10px 12px",
            borderRadius: 10,
            textDecoration: "none",
            color: "inherit",
            background: isActive ? "#2a2a2a" : "transparent",
          })}>
            Dashboard
          </NavLink>

          <NavLink to="/new" style={({ isActive }) => ({
            padding: "10px 12px",
            borderRadius: 10,
            textDecoration: "none",
            color: "inherit",
            background: isActive ? "#2a2a2a" : "transparent",
          })}>
            New Log
          </NavLink>
        </nav>

                <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            RECENT LOGS
          </div>

          <div style={{ display: "grid", gap: 6, maxHeight: 360, overflowY: "auto" }}>
            {logs.slice(0, 10).map((log) => {
              const active = location.pathname === `/logs/${log.id}`;

              return (
                <NavLink
                  key={log.id}
                  to={`/logs/${log.id}`}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "inherit",
                    background: active ? "#2a2a2a" : "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={log.title}
                  >
                    {log.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.65 }}>
                    {log.createdAt.slice(0, 10)}
                  </div>
                </NavLink>
              );
            })}

            {logs.length === 0 && (
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                No logs yet.
              </div>
            )}
          </div>
        </div>

      </aside>

      <div>
        <header style={{
          padding: "16px 20px",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ fontWeight: 600 }}>Dashboard</div>
          <Link to="/new" style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "#3a3a3a",
            color: "inherit",
            textDecoration: "none"
          }}>
            + New log
          </Link>
        </header>

        <main style={{ padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
