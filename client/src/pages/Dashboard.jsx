import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../utils/api";
import { FolderKanban, ListTodo, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    request("/api/dashboard").then((d) => setStats(d.stats));
  }, []);

  if (!stats) return <div className="page-loader">Loading…</div>;

  const cards = [
    { label: "Projects", value: stats.totalProjects, icon: FolderKanban, color: "var(--accent)" },
    { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "var(--text-0)" },
    { label: "To Do", value: stats.todoTasks, icon: ListTodo, color: "var(--blue)" },
    { label: "In Progress", value: stats.inProgressTasks, icon: Clock, color: "var(--amber)" },
    { label: "Completed", value: stats.doneTasks, icon: CheckCircle, color: "var(--green)" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, color: "var(--red)" },
  ];

  return (
    <div className="page">
      <div className="page-top">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ color: c.color, background: c.color + "15" }}>
              <c.icon size={22} />
            </div>
            <div className="stat-body">
              <span className="stat-value">{c.value}</span>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }} className="field-row">
        <div className="card">
          <div className="card-header">
            <h3>Tasks per User</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
            {stats.tasksPerUser?.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{u.name}</span>
                <span className="col-count">{u.taskCount} tasks</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <p className="text-muted" style={{ fontSize: "0.8125rem", marginBottom: "1rem" }}>
              Quickly jump into project planning, task boards, or manage team members.
            </p>
          </div>
          <div className="quick-actions">
            <Link to="/projects" className="btn btn-primary">Go to Projects →</Link>
            <Link to="/team" className="btn btn-ghost">Manage Team →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
