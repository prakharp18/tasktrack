import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard, FolderKanban, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">E</div>
          <span className="brand-text">Ethara</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FolderKanban size={18} /> Projects
          </NavLink>
          <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Users size={18} /> Team
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-block">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
