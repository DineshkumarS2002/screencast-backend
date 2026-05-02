/**
 * HomePage — Landing + Recorder page.
 *
 * Unauthenticated users see a hero section.
 * Authenticated users jump straight to the recorder panel.
 */

import { Link, useNavigate } from "react-router-dom";
import { Monitor, Upload, Library, ArrowRight, Zap, Users } from "lucide-react";
import { RecorderPanel } from "../components/RecorderPanel";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";

const FEATURES = [
  {
    icon: <Monitor size={24} />,
    title: "Crystal Clear Capture",
    desc: "Ultra-low latency HD recording with smart system audio routing.",
  },
  {
    icon: <Users size={24} />,
    title: "Instant Meetings",
    desc: "Host professional video conferences directly from your dashboard.",
  },
  {
    icon: <Upload size={24} />,
    title: "Cloud Sync",
    desc: "Automatic background uploads to your secure, searchable media vault.",
  },
  {
    icon: <Zap size={24} />,
    title: "Lightning Fast",
    desc: "Optimized performance for both high-end rigs and mobile devices.",
  },
];

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  if (isAuthenticated) {
    return (
      <>
        <main style={{ 
          flex: 1, 
          padding: "2rem 0",
          paddingTop: "calc(2rem + env(safe-area-inset-top))"
        }}>
          <div className="container">
            <div style={{ textAlign: "left", marginBottom: "2rem" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-alt)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <div style={{ width: 20, height: 2, background: 'var(--accent)' }} />
                Creator Dashboard
              </div>
              <h1
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 800
                }}
              >
                Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name || user?.username || 'Creator'}</span>
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                  maxWidth: 600,
                }}
              >
                Ready to capture your next big idea? Select a tool to get started.
              </p>
            </div>

            <div
              className="dashboard-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.25rem",
                padding: "0 0.5rem" // Extra breathing room on sides
              }}
            >
              <div className="glass" style={{ padding: "2rem" }}>
                <h2
                  style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Monitor size={24} color="var(--accent)" /> Screen Recorder
                </h2>
                <RecorderPanel onToast={addToast} onUploaded={() => {}} />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <div
                  className="glass"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, var(--accent), var(--accent-light))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      boxShadow: "0 8px 24px var(--accent-glow)",
                    }}
                  >
                    <Users size={30} color="white" />
                  </div>
                  <h2 style={{ marginBottom: "1rem" }}>Video Meetings</h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1.5rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    Host a private, high-quality video conference right now.
                  </p>
                  <button className="btn btn-primary" style={{ width: "100%", maxWidth: "280px", padding: "0.8rem", borderRadius: "12px", fontWeight: 700, margin: "0.5rem auto", whiteSpace: "nowrap" }} onClick={() => navigate("/meeting")}>
                    Host Now
                  </button>
                </div>

                <div
                  className="glass"
                  style={{ padding: "2rem", textAlign: "center", flex: 1 }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    <Library size={30} color="var(--text-secondary)" />
                  </div>
                  <h2 style={{ marginBottom: "1rem" }}>Your Library</h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1.5rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    Review, download, or share your past recordings.
                  </p>
                  <button className="btn btn-ghost" style={{ width: "100%", maxWidth: "280px", padding: "0.8rem", borderRadius: "12px", margin: "0.5rem auto", whiteSpace: "nowrap" }} onClick={() => navigate("/library")}>
                    Go to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <>
      <main style={{ flex: 1 }}>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "5rem 0 4rem", textAlign: "center" }}>
          <div className="container">
            {/* Pill badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: "999px",
                padding: "0.5rem 1.25rem",
                fontSize: "0.85rem",
                color: "var(--accent-alt)",
                marginBottom: "2rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              <Zap size={14} fill="currentColor" />
              Ultimate Screen Experience
            </div>

            <h1
              style={{
                marginBottom: "1.25rem",
                maxWidth: 800,
                margin: "0 auto 1.25rem",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1.1,
              }}
            >
              Record Screen with{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-alt))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ultra-Precision
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--text-secondary)",
                maxWidth: 620,
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}
            >
              A clean, high-performance screen recorder that keeps your privacy
              intact. Capture, manage, and share your recordings with ease.
            </p>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  padding: "1rem 2.5rem",
                  fontSize: "1.1rem",
                  borderRadius: "16px",
                }}
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="btn btn-ghost"
                style={{
                  padding: "1rem 2.5rem",
                  fontSize: "1.1rem",
                  borderRadius: "16px",
                }}
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* ── Feature grid ──────────────────────────────────────────────── */}
        <section style={{ padding: "3rem 0 5rem" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass card-hover"
                  style={{ padding: "2rem", textAlign: "left" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                      color: "var(--accent-alt)",
                      boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={{ marginBottom: "0.75rem", fontSize: "1.25rem" }}>
                    {f.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
