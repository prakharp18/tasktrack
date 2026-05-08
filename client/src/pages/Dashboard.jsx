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
    { label: "To Do", value: stats.todoTasks, icon: ListTodo, color: "var(--blue)" },
    { label: "In Progress", value: stats.inProgressTasks, icon: Clock, color: "var(--amber)" },
    { label: "Completed", value: stats.doneTasks, icon: CheckCircle, color: "var(--green)" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, color: "var(--red)" },
    { label: "Team", value: stats.totalMembers, icon: Users, color: "var(--teal)" },
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

      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions">
          <Link to="/projects" className="btn btn-ghost">View Projects →</Link>
          <Link to="/team" className="btn btn-ghost">View Team →</Link>
        </div>
      </div>
    </div>
  );
}
