import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Video, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.username.trim()) errs.username = 'Username is required.'
    if (!formData.email.trim())    errs.email = 'Email is required.'
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(formData.username, formData.email, formData.password, formData.confirmPassword)
      navigate('/')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data || {}
      const mapped: Record<string, string> = {}
      for (const [k, v] of Object.entries(data)) {
        mapped[k] = Array.isArray(v) ? v.join(' ') : String(v)
      }
      setErrors(Object.keys(mapped).length ? mapped : { general: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="card-hover" style={{
            width: 64, height: 64, borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-alt))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', boxShadow: '0 8px 32px var(--accent-glow)',
          }}>
            <Video size={32} color="white" />
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>Start Recording</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create your free account today</p>
        </div>

        <div className="glass" style={{ padding: '2.5rem' }}>
          {errors.general && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', color: '#fca5a5', fontSize: '0.875rem',
              marginBottom: '1.5rem', textAlign: 'center'
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input 
                  type="text" required 
                  className="input"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Choose a username"
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
              {errors.username && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.username}</p>}
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input 
                  type="email" required 
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
              {errors.email && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.email}</p>}
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type={showPwd ? "text" : "password"} required 
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="At least 6 characters"
                  style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.password}</p>}
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type={showConfirmPwd ? "text" : "password"} required 
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Repeat your password"
                  style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.confirmPassword}</p>}
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', borderRadius: '12px' }}
            >
              {loading ? (
                <span className="flex-center" style={{ gap: '0.75rem' }}>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Creating Account…
                </span>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in here</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}

