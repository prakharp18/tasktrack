import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { request } from "../utils/api";
import { Plus, FolderKanban } from "lucide-react";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await request("/api/projects");
    setProjects(data.projects);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title, description: desc }),
      });
      setTitle("");
      setDesc("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-top">
        <h2>Projects</h2>
        {user.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Project</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <label className="field">
                <span>Title</span>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty">
          <FolderKanban size={48} strokeWidth={1} />
          <h3>No projects yet</h3>
          <p>{user.role === "ADMIN" ? "Create your first project." : "You haven't been assigned to any projects."}</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p.id}`} className="project-card" key={p.id}>
              <div className="project-card-top">
                <h4>{p.title}</h4>
                <span className={`pill pill-${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <p className="project-desc">{p.description || "No description"}</p>
              <div className="project-card-bottom">
                <span>{p._count.tasks} tasks</span>
                <span className="owner-tag">{p.owner.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
