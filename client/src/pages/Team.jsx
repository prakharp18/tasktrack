import { useState, useEffect } from "react";
import { request } from "../utils/api";
import { Users } from "lucide-react";

export default function Team() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    request("/api/users").then((d) => setUsers(d.users));
  }, []);

  return (
    <div className="page">
      <div className="page-top">
        <h2>Team</h2>
        <span className="text-muted">{users.length} member{users.length !== 1 ? "s" : ""}</span>
      </div>

      {users.length === 0 ? (
        <div className="empty">
          <Users size={48} strokeWidth={1} />
          <h3>No members yet</h3>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Projects</th>
                <th>Tasks</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span className="user-avatar sm">{u.name.charAt(0)}</span>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`pill pill-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td>{u._count.projects}</td>
                  <td>{u._count.tasks}</td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
