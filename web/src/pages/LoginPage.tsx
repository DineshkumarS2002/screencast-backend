import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Video, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import GoogleButton from "../components/GoogleButton";
import { motion } from "framer-motion";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const wakeUp = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "";
        await axios.get(API_URL);
      } catch (e) { /* ignore */ }
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
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      flex: 1, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorative Blobs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "40vw",
        height: "40vw",
        background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        opacity: 0.3,
        zIndex: -1
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-10%",
        width: "30vw",
        height: "30vw",
        background: "radial-gradient(circle, var(--accent-alt) 0%, transparent 70%)",
        opacity: 0.2,
        zIndex: -1
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 440 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: "24px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-alt))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 12px 40px var(--accent-glow)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Video size={40} color="white" />
          </motion.div>
          <h1 style={{ marginBottom: "0.75rem", fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            Log in to access your secure media vault
          </p>
        </div>

        <div className="glass" style={{ 
          padding: "2.5rem", 
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: "0.85rem 1rem",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "14px",
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <label htmlFor="input-username" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500, marginLeft: "0.5rem" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
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
                  style={{ paddingLeft: "3.2rem", borderRadius: "16px", height: "54px" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <label htmlFor="input-password" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500, marginLeft: "0.5rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
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
                  style={{ paddingLeft: "3.2rem", paddingRight: "3.5rem", borderRadius: "16px", height: "54px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "0.5rem"
                  }}
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
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
                padding: "1rem",
                marginTop: "0.5rem",
                borderRadius: "16px",
                fontSize: "1.05rem",
                fontWeight: 700,
                boxShadow: "0 8px 24px var(--accent-glow)"
              }}
            >
              {loading ? "Signing in..." : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                  <LogIn size={20} /> Sign In
                </div>
              )}
            </button>
          </form>

          <div style={{ margin: "2rem 0", display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <GoogleButton />
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              New here?{" "}
              <Link to="/register" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: "2.5rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "0.5rem",
          color: "var(--text-muted)",
          fontSize: "0.85rem"
        }}>
          <ShieldCheck size={16} />
          <span>AES-256 Encrypted Connection</span>
        </div>
      </motion.div>
    </main>
  );
}
