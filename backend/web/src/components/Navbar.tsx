/**
 * Navbar component — sticky top navigation with logo and auth controls.
 */

import { Link, useNavigate } from 'react-router-dom'
import { Video, LogOut, Library, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon" style={{ 
              background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
              boxShadow: '0 0 15px var(--accent-glow)' 
            }}>
              <Video size={18} color="white" />
            </div>
            <span style={{ 
              background: 'linear-gradient(to right, #fff, var(--accent-alt))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              ScreenCast
            </span>
          </Link>

          {/* Right side controls */}
          {isAuthenticated ? (
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              <span className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {user?.username}
              </span>
              <Link to="/library" className="btn btn-ghost btn-icon" title="My Recordings">
                <Library size={18} />
              </Link>
              <Link to="/settings" className="btn btn-ghost btn-icon" title="Settings">
                <Settings size={18} />
              </Link>
              <button
                id="btn-logout"
                className="btn btn-ghost btn-icon"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Link to="/login"    className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
