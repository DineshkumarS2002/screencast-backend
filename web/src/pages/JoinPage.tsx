import { useParams } from 'react-router-dom'
import { Video, User, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export function JoinPage() {
  const { id } = useParams()
  const [userName, setUserName] = useState('')

  const handleJoin = () => {
    if (!userName.trim()) {
      alert('Please enter your name to join.')
      return
    }
    // For now, redirect to Jitsi directly or we can load Jitsi here.
    // To keep it simple and branded, we'll redirect to the meeting URL on Jitsi
    // but with the user's name already set.
    const jitsiUrl = `https://meet.jit.si/${id}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userName)}`
    window.location.href = jitsiUrl
  }

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: '2rem'
    }}>
      <div className="glass" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '3rem', 
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: '24px', 
          background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
        }}>
          <Video size={40} color="white" />
        </div>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>ScreenCast Meeting</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          You've been invited to join a professional session.
        </p>

        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter Your Name
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <User size={18} />
            </span>
            <input 
              className="input" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. John Doe"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleJoin} style={{ width: '100%', height: '55px', fontSize: '1.1rem' }}>
          <ShieldCheck size={20} /> Join Meeting Now
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Secure & encrypted by ScreenCast
        </p>
      </div>
    </div>
  )
}
