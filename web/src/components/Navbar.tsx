/**
 * Navbar component — sticky top navigation with logo and auth controls.
 */

import { Link, useNavigate } from "react-router-dom";
import { LogOut, Library, Settings, Users, Menu, X, Home, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link
            to="/"
            className="navbar-logo"
            style={{ textDecoration: "none" }}
          >
            <div
              className="logo-icon"
              style={{
                background: "transparent",
                padding: "0",
                overflow: "hidden",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  filter: "brightness(1.3) contrast(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.4))"
                }}
              />
            </div>
            <span
              style={{
                background: "linear-gradient(to right, #ffffff, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                fontSize: "1.6rem",
                filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))"
              }}
            >
              ScreenCast
            </span>
          </Link>

          {/* Desktop & Mobile Controls */}
          <div className="navbar-controls">
            {isAuthenticated ? (
              <>
                {/* Desktop Icons */}
                <div className="flex hide-mobile" style={{ alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginRight: '0.5rem' }}>
                    {user?.username}
                  </span>
                  <Link to="/meeting" className="btn btn-ghost btn-icon" title="Meetings"><Users size={18} /></Link>
                  <Link to="/library" className="btn btn-ghost btn-icon" title="Library"><Library size={18} /></Link>
                  <Link to="/settings" className="btn btn-ghost btn-icon" title="Settings"><Settings size={18} /></Link>
                  <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Log out"><LogOut size={18} /></button>
                </div>

                {/* Mobile Hamburger Toggle */}
                <button 
                  className="btn btn-ghost btn-icon show-mobile" 
                  onClick={() => setIsOpen(!isOpen)}
                  style={{ zIndex: 1001, color: 'white', background: 'rgba(255,255,255,0.05)' }}
                >
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Dropdown Menu */}
                {isOpen && (
                  <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
                    <div className="mobile-menu-content glass" onClick={e => e.stopPropagation()}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 700, color: 'var(--accent)' }}>{user?.username}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Premium Creator</p>
                      </div>
                      <Link to="/" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <Home size={18} /> Home
                      </Link>
                      <Link to="/meeting" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <Users size={18} /> Video Meetings
                      </Link>
                      <Link to="/library" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <Library size={18} /> My Library
                      </Link>
                      <Link to="/settings" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <Settings size={18} /> Settings
                      </Link>
                      <button onClick={() => { handleLogout(); setIsOpen(false); }} className="mobile-menu-item" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ff4b4b' }}>
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-1 hide-mobile" style={{ alignItems: 'center' }}>
                  <Link to="/login" className="btn btn-ghost" style={{ 
                    padding: '0.5rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-primary" style={{ 
                    padding: '0.5rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    Get Started
                  </Link>
                </div>

                <button 
                  className="btn btn-ghost btn-icon show-mobile" 
                  onClick={() => setIsOpen(!isOpen)}
                  style={{ zIndex: 1001, color: 'white' }}
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {isOpen && (
                  <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
                    <div className="mobile-menu-content glass" onClick={e => e.stopPropagation()}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 700, color: 'var(--accent)' }}>Welcome</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sign in to start recording</p>
                      </div>
                      <Link to="/" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <Home size={18} /> Home
                      </Link>
                      <Link to="/login" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <LogIn size={18} /> Log In
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)} className="mobile-menu-item">
                        <ShieldCheck size={18} /> Get Started
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
