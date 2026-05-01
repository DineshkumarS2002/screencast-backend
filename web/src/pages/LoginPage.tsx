import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Video, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import GoogleButton from "../components/GoogleButton";

export function LoginPage() {
  console.log('DEBUG: Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();


  // ... wakeUp logic ...


  useEffect(() => {
    // Wake up the backend on Render free tier
    const wakeUp = async () => {
      try {
        const API_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        await axios.get(API_URL);
      } catch (e) {
        // Ignore error, just a ping
      }
    };
    wakeUp();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            className="card-hover"
            style={{
              width: 64,
              height: 64,
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, var(--accent), var(--accent-alt))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              boxShadow: "0 8px 32px var(--accent-glow)",
            }}
          >
            <Video size={32} color="white" />
          </div>
          <h1 style={{ marginBottom: "0.5rem" }}>Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Log in to your ScreenCast account
          </p>
        </div>

        <div className="glass" style={{ padding: "2.5rem" }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "12px",
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="input-username"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                >
                  <Mail size={18} />
                </span>
                <input
                  id="input-username"
                  className="input"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: "2.8rem" }}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="input-password"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                >
                  <Lock size={18} />
                </span>
                <input
                  id="input-password"
                  className="input"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "2.8rem", paddingRight: "3rem" }}
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPwd((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.85rem",
                marginTop: "0.5rem",
                borderRadius: "12px",
              }}
            >
              {loading ? (
                <span className="flex-center" style={{ gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Signing in…
                </span>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div
            style={{
              margin: "1.5rem 0",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--glass-border)",
              }}
            ></div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--glass-border)",
              }}
            ></div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleButton />
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "2rem",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}
          >
            New here?{" "}
            <Link
              to="/register"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  );
}
