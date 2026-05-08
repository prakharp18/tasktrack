import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { request } from "../utils/api";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">E</div>
          <h1>Create account</h1>
          <p>Get started with Ethara</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle}>
          <label className="field">
            <span>Full name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Min 6 characters" 
                required 
                minLength={6} 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
