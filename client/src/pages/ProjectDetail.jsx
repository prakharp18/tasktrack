import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { request } from "../utils/api";
import { Plus, ArrowLeft, Calendar, Trash2, UserPlus, X } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", assigneeId: "", dueDate: "" });
  const [memberUserId, setMemberUserId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { load(); }, [id]);

  async function load() {
    const [projData, userData] = await Promise.all([
      request(`/api/projects/${id}`),
      request("/api/users"),
    ]);
    setProject(projData.project);
    setUsers(userData.users);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ ...form, projectId: id, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null }),
      });
      setForm({ title: "", description: "", priority: "MEDIUM", assigneeId: "", dueDate: "" });
      setShowTaskForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request(`/api/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: memberUserId }),
      });
      setMemberUserId("");
      setShowMemberForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(userId) {
    if (!confirm("Remove this member?")) return;
    await request(`/api/projects/${id}/members/${userId}`, { method: "DELETE" });
    load();
  }

  async function updateStatus(taskId, status) {
    await request(`/api/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status }) });
    load();
  }

  async function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    await request(`/api/tasks/${taskId}`, { method: "DELETE" });
    load();
  }

  if (!project) return <div className="page-loader">Loading…</div>;

  const canManage = user.role === "ADMIN" || project.owner.id === user.id;
  const columns = [
    { key: "TODO", label: "To Do" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "DONE", label: "Done" },
  ];

  const memberIds = new Set(project.members?.map((m) => m.user.id) || []);
  const nonMembers = users.filter((u) => u.id !== project.owner.id && !memberIds.has(u.id));

  function isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  }

  const filteredTasks = filter === "ALL" ? project.tasks : project.tasks.filter((t) => t.priority === filter);

  return (
    <div className="page">
      <Link to="/projects" className="back-link"><ArrowLeft size={16} /> Back to Projects</Link>

      <div className="page-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h2>{project.title}</h2>
            <span className={`pill pill-${project.status.toLowerCase()}`}>{project.status}</span>
          </div>
          {project.description && <p className="text-muted" style={{ marginTop: 4 }}>{project.description}</p>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {canManage && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowMemberForm(true)}>
                <UserPlus size={16} /> Members
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
                <Plus size={16} /> Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {project.members?.length > 0 && (
        <div className="member-chips">
          <span className="text-muted" style={{ fontSize: "0.75rem", marginRight: "0.5rem" }}>Members:</span>
          <span className="assignee-chip">{project.owner.name} (Owner)</span>
          {project.members.map((m) => (
            <span className="assignee-chip" key={m.user.id}>
              {m.user.name}
              {canManage && (
                <button className="chip-remove" onClick={() => removeMember(m.user.id)}><X size={12} /></button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="board-filters">
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Filter:</span>
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="board">
        {columns.map((col) => {
          const tasks = filteredTasks.filter((t) => t.status === col.key);
          return (
            <div className="board-col" key={col.key}>
              <div className="col-header">
                <span>{col.label}</span>
                <span className="col-count">{tasks.length}</span>
              </div>
              <div className="col-list">
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  const canEdit = canManage || task.assignee?.id === user.id;
                  return (
                    <div className={`task-card ${overdue ? "task-overdue" : ""}`} key={task.id}>
                      <h5>{task.title}</h5>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-meta">
                        <span className={`pill pill-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className={`due-tag ${overdue ? "overdue" : ""}`}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        {overdue && <span className="pill pill-overdue">Overdue</span>}
                      </div>
                      <div className="task-actions">
                        <div className="task-actions-left">
                          {task.assignee && <span className="assignee-chip">{task.assignee.name}</span>}
                        </div>
                        <div className="task-actions-right">
                          {canEdit && (
                            <select className="status-select" value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)}>
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          )}
                          {canManage && (
                            <button className="icon-btn danger" onClick={() => deleteTask(task.id)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && <div className="col-empty">No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskForm && (
        <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Task</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreateTask}>
              <label className="field">
                <span>Title</span>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Priority</span>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
                <label className="field">
                  <span>Assignee</span>
                  <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Due date</span>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberForm && (
        <div className="modal-overlay" onClick={() => setShowMemberForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Member</h3>
            {error && <div className="alert alert-error">{error}</div>}
            {nonMembers.length === 0 ? (
              <p className="text-muted">All users are already members of this project.</p>
            ) : (
              <form onSubmit={handleAddMember}>
                <label className="field">
                  <span>Select user</span>
                  <select value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} required>
                    <option value="">Choose a user…</option>
                    {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowMemberForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Adding…" : "Add"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
